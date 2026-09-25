import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { createApplicationSchema, updateApplicationStatusSchema } from './applications.schema';
import { isEligible } from '../matching/matching.utils';

export const applyToOpportunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createApplicationSchema.parse(req.body);
    const userId = (req as any).user.id;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: data.opportunityId }
    });

    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    if (opportunity.status !== 'PUBLISHED') {
      res.status(400).json({ error: "This opportunity is not currently accepting applications" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true, academicProfile: true }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.role === 'ACADEMICIAN') {
      if (!user.academicProfile) {
        res.status(400).json({ error: "Complete your academic profile before applying" });
        return;
      }
      // Academicians bypass strict student eligibility (minYear, etc.)
    } else {
      if (!user.studentProfile) {
        res.status(400).json({ error: "Complete your student profile before applying" });
        return;
      }

      if (!isEligible(user.studentProfile, opportunity)) {
        res.status(403).json({ error: "You do not meet the eligibility requirements for this opportunity" });
        return;
      }
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        opportunityId_studentId: {
          opportunityId: data.opportunityId,
          studentId: userId
        }
      }
    });

    if (existingApplication) {
      res.status(409).json({ error: "You have already applied to this opportunity" });
      return;
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          opportunityId: data.opportunityId,
          studentId: userId,
          status: 'APPLIED',
          portfolioUrl: data.portfolioUrl,
          resumeDocumentId: data.resumeDocumentId
        }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          oldStatus: null,
          newStatus: 'APPLIED',
          changedBy: userId
        }
      });

      return app;
    }, {
      maxWait: 5000,
      timeout: 20000
    });

    res.status(201).json({ application });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getStudentApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const applications = await prisma.application.findMany({
      where: { studentId: userId },
      include: {
        opportunity: {
          include: {
            organization: true
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicationId = String(req.params.id);
    const { status: newStatus } = updateApplicationStatusSchema.parse(req.body);
    const user = (req as any).user;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        opportunity: true
      }
    });

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const currentStatus = application.status;

    // Validate based on Role
    let isAuthorized = false;
    let isValidTransition = false;

    if (user.role === 'STUDENT') {
      if (application.studentId !== user.id) {
        res.status(403).json({ error: "Not authorized to update this application" });
        return;
      }
      
      isAuthorized = true;
      if (newStatus === 'WITHDRAWN' && ['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(currentStatus)) {
        isValidTransition = true;
      } else if (newStatus === 'ACCEPTED' && currentStatus === 'OFFERED') {
        isValidTransition = true;
      } else if (newStatus === 'DECLINED' && currentStatus === 'OFFERED') {
        isValidTransition = true;
      }
    } else if (user.role === 'INDUSTRY' || user.role === 'ADMIN') {
      // Must verify organization ownership
      const actingUser = await prisma.user.findUnique({ where: { id: user.id } });
      
      if (!actingUser || actingUser.organizationId !== (application as any).opportunity?.organizationId) {
        // ADMIN can't bypass unless they own the org (or we could add a super-admin exception, but user said:
        // "Do not treat ADMIN as automatically equivalent to an industry recruiter... verify that the authenticated user belongs to the organization")
        res.status(403).json({ error: "You are not authorized to manage applications for this organization" });
        return;
      }

      isAuthorized = true;
      if (currentStatus === 'APPLIED' && ['SHORTLISTED', 'REJECTED'].includes(newStatus)) {
        isValidTransition = true;
      } else if (currentStatus === 'SHORTLISTED' && ['INTERVIEW', 'REJECTED'].includes(newStatus)) {
        isValidTransition = true;
      } else if (currentStatus === 'INTERVIEW' && ['OFFERED', 'REJECTED'].includes(newStatus)) {
        isValidTransition = true;
      } else if (currentStatus === 'OFFERED' && newStatus === 'REJECTED') {
        isValidTransition = true; // Rescinding an offer
      }
    }

    if (!isAuthorized) {
      // The authorization check above already handles sending 403, but just in case:
      return;
    }

    if (!isValidTransition) {
      res.status(400).json({ error: `Cannot transition application from ${currentStatus} to ${newStatus} as a ${user.role}` });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: applicationId },
        data: { status: newStatus as any }
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: app.id,
          oldStatus: currentStatus,
          newStatus: newStatus as any,
          changedBy: user.id
        }
      });

      // Send Notification to applicant
      if (currentStatus !== newStatus) {
        let notifType: 'APPLICATION_UPDATE' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'REJECTION' = 'APPLICATION_UPDATE';
        if (newStatus === 'SHORTLISTED') notifType = 'SHORTLISTED';
        else if (newStatus === 'INTERVIEW') notifType = 'INTERVIEW';
        else if (newStatus === 'OFFERED') notifType = 'OFFER';
        else if (newStatus === 'REJECTED') notifType = 'REJECTION';

        await tx.notification.create({
          data: {
            userId: app.studentId,
            type: notifType,
            payload: {
              applicationId: app.id,
              opportunityId: app.opportunityId,
              oldStatus: currentStatus,
              newStatus: newStatus,
              message: `Your application status has been updated to ${newStatus}.`
            }
          }
        });
      }

      return app;
    });

    res.status(200).json({ application: updated });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};
