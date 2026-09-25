import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { proposeCollaborationSchema, updateCollaborationStatusSchema } from './collaborations.schema';
import { CollaborationStatus } from '@prisma/client';

export const getIndustryOrganizations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industries = await prisma.organization.findMany({
      where: { type: 'INDUSTRY' },
      select: { id: true, name: true, domain: true }
    });
    res.status(200).json({ industries });
  } catch (error) {
    next(error);
  }
};

export const proposeCollaboration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = proposeCollaborationSchema.parse(req.body);
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const userOrgId = (req as any).user.organizationId;

    let academicianId = '';
    let industryId = '';

    if (userRole === 'INDUSTRY' || userRole === 'ADMIN') {
      if (!userOrgId) {
        res.status(403).json({ error: "User does not belong to an organization" });
        return;
      }
      if (!data.academicianId) {
        res.status(400).json({ error: "academicianId is required for industry" });
        return;
      }
      industryId = userOrgId;
      academicianId = data.academicianId;
    } else {
      if (!data.industryId) {
        res.status(400).json({ error: "industryId is required for academician" });
        return;
      }
      academicianId = userId;
      industryId = data.industryId;
    }

    // Verify academician
    const academician = await prisma.user.findUnique({
      where: { id: academicianId }
    });
    if (!academician || academician.role !== 'ACADEMICIAN') {
      res.status(404).json({ error: "Academician not found" });
      return;
    }

    // Check if industry exists
    const industry = await prisma.organization.findUnique({
      where: { id: industryId }
    });
    if (!industry || industry.type !== 'INDUSTRY') {
      res.status(404).json({ error: "Industry organization not found" });
      return;
    }

    const collaboration = await prisma.collaboration.create({
      data: {
        academicianId,
        industryId,
        title: data.title,
        description: data.description,
        type: data.type as any,
        expertise: data.expertise,
        expectedOutcomes: data.expectedOutcomes,
        duration: data.duration,
        documentId: data.documentId,
        status: CollaborationStatus.PROPOSED
      }
    });

    // Notify the other party
    if (userRole === 'ACADEMICIAN') {
      const industryUsers = await prisma.user.findMany({
        where: { organizationId: industry.id }
      });
      for (const user of industryUsers) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SYSTEM',
            payload: {
              collaborationId: collaboration.id,
              message: `New collaboration proposal received from ${academician.name}: ${collaboration.title}`
            }
          }
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          userId: academician.id,
          type: 'SYSTEM',
          payload: {
            collaborationId: collaboration.id,
            message: `New collaboration proposal received from ${industry.name}: ${collaboration.title}`
          }
        }
      });
    }

    res.status(201).json({ collaboration });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getAcademicianCollaborations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const collaborations = await prisma.collaboration.findMany({
      where: { academicianId: userId },
      include: {
        industry: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ collaborations });
  } catch (error) {
    next(error);
  }
};

export const getIndustryCollaborations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.organizationId) {
      res.status(403).json({ error: "User does not belong to an organization" });
      return;
    }

    const collaborations = await prisma.collaboration.findMany({
      where: { industryId: user.organizationId },
      include: {
        academician: {
          select: {
            id: true,
            name: true,
            email: true,
            academicProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ collaborations });
  } catch (error) {
    next(error);
  }
};

export const getCollaborationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const collaboration = await prisma.collaboration.findUnique({
      where: { id },
      include: {
        academician: {
          select: {
            id: true,
            name: true,
            email: true,
            academicProfile: true
          }
        },
        industry: true,
        document: true
      }
    });

    if (!collaboration) {
      res.status(404).json({ error: "Collaboration not found" });
      return;
    }

    // Access check
    if (role === 'ACADEMICIAN' && collaboration.academicianId !== userId) {
      res.status(403).json({ error: "Unauthorized access" });
      return;
    }
    
    if ((role === 'INDUSTRY' || role === 'ADMIN') && collaboration.industryId !== user?.organizationId) {
      res.status(403).json({ error: "Unauthorized access" });
      return;
    }

    res.status(200).json({ collaboration });
  } catch (error) {
    next(error);
  }
};

export const updateCollaborationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = (req as any).user.id;
    const data = updateCollaborationStatusSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const collaboration = await prisma.collaboration.findUnique({ where: { id } });
    if (!collaboration) {
      res.status(404).json({ error: "Collaboration not found" });
      return;
    }

    const role = user.role;
    if (role === 'ACADEMICIAN' && collaboration.academicianId !== user.id) {
      res.status(403).json({ error: "Unauthorized academician" });
      return;
    }
    if ((role === 'INDUSTRY' || role === 'ADMIN') && collaboration.industryId !== user.organizationId) {
      res.status(403).json({ error: "Unauthorized industry" });
      return;
    }

    const currentStatus = collaboration.status;
    const nextStatus = data.status;

    // Strict State Machine Validation
    const validTransitions: Record<string, string[]> = {
      'PROPOSED': ['REVIEWING', 'ACCEPTED', 'REJECTED'],
      'REVIEWING': ['ACCEPTED', 'REJECTED'],
      'ACCEPTED': ['ACTIVE'],
      'ACTIVE': ['COMPLETED'],
      'REJECTED': [],
      'COMPLETED': []
    };

    if (!validTransitions[currentStatus]?.includes(nextStatus)) {
      res.status(409).json({ error: `Invalid status transition from ${currentStatus} to ${nextStatus}` });
      return;
    }

    const updated = await prisma.collaboration.update({
      where: { id },
      data: { status: nextStatus as any }
    });

    // Notify the other party
    if (role === 'ACADEMICIAN') {
      const industryUsers = await prisma.user.findMany({
        where: { organizationId: collaboration.industryId }
      });
      for (const orgUser of industryUsers) {
        await prisma.notification.create({
          data: {
            userId: orgUser.id,
            type: 'SYSTEM',
            payload: {
              collaborationId: updated.id,
              message: `Your collaboration proposal "${updated.title}" has been updated to ${updated.status} by the Academician.`
            }
          }
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          userId: collaboration.academicianId,
          type: 'SYSTEM',
          payload: {
            collaborationId: updated.id,
            message: `Your collaboration proposal "${updated.title}" has been updated to ${updated.status}.`
          }
        }
      });
    }

    res.status(200).json({ collaboration: updated });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};
