import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { calculateMatchScore } from '../matching/matching.utils';
import { createLearningResourceSchema, trackLearningProgressSchema, updateLearningResourceSchema } from './learning.schema';

export const createLearningResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createLearningResourceSchema.parse(req.body);
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user || !user.organizationId) {
      res.status(403).json({ error: "User is not associated with an organization" });
      return;
    }

    const { skills, ...resourceData } = data;

    const resource = await prisma.learningResource.create({
      data: {
        ...resourceData,
        organizationId: user.organizationId,
        learningResourceSkills: skills ? {
          create: skills.map(s => ({
            skillId: s.skillId,
            targetProficiency: s.targetProficiency
          }))
        } : undefined
      },
      include: {
        learningResourceSkills: {
          include: { skill: true }
        }
      }
    });

    res.status(201).json({ resource });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getOrganizationResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.organizationId) {
      res.status(403).json({ error: "User is not associated with an organization" });
      return;
    }

    const resources = await prisma.learningResource.findMany({
      where: { organizationId: user.organizationId },
      include: {
        learningResourceSkills: { include: { skill: true } }
      },
      orderBy: { id: 'desc' }
    });

    res.status(200).json({ resources });
  } catch (error) {
    next(error);
  }
};

export const updateLearningResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = String(req.params.id);
    const data = updateLearningResourceSchema.parse(req.body);
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const existingResource = await prisma.learningResource.findUnique({ where: { id: resourceId } });

    if (!existingResource) {
      res.status(404).json({ error: "Learning resource not found" });
      return;
    }

    if (!user || user.organizationId !== existingResource.organizationId) {
      res.status(403).json({ error: "You can only edit resources belonging to your organization" });
      return;
    }

    const { skills, ...resourceData } = data;

    const updated = await prisma.$transaction(async (tx) => {
      let resource = await tx.learningResource.update({
        where: { id: resourceId },
        data: resourceData
      });

      if (skills) {
        await tx.learningResourceSkill.deleteMany({
          where: { learningResourceId: resourceId }
        });
        resource = await tx.learningResource.update({
          where: { id: resourceId },
          data: {
            learningResourceSkills: {
              create: skills.map(s => ({
                skillId: s.skillId,
                targetProficiency: s.targetProficiency
              }))
            }
          },
          include: {
            learningResourceSkills: { include: { skill: true } }
          }
        });
      }

      return resource;
    });

    res.status(200).json({ resource: updated });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getOpportunityLearningRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const opportunityId = String(req.params.opportunityId);

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: { studentSkills: { include: { skill: true } } }
        }
      }
    });

    if (!student || !student.studentProfile) {
      res.status(400).json({ error: "Student profile not complete" });
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { requiredSkills: { include: { skill: true } } }
    });

    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    const matchResult = calculateMatchScore(student.studentProfile.studentSkills, opportunity.requiredSkills);
    const missingSkills = matchResult.missingSkills;

    if (missingSkills.length === 0) {
      res.status(200).json({ recommendations: [], message: "You meet all skill requirements for this opportunity!" });
      return;
    }

    // Find resources that target the missing skills at or above the required proficiency
    const recommendations: any[] = [];
    
    for (const gap of missingSkills) {
      const resources = await prisma.learningResource.findMany({
        where: {
          learningResourceSkills: {
            some: {
              skillId: gap.skillId,
              targetProficiency: { gte: gap.requiredProficiency }
            }
          }
        },
        include: {
          organization: true,
          learningResourceSkills: { include: { skill: true } }
        }
      });

      for (const r of resources) {
        // Prevent adding duplicates if a resource covers multiple gaps
        if (!recommendations.some(existing => existing.resource.id === r.id)) {
          recommendations.push({
            resource: r,
            addressedGaps: [gap]
          });
        } else {
          // Add gap to existing
          const existing = recommendations.find(existing => existing.resource.id === r.id);
          existing.addressedGaps = existing.addressedGaps.concat(gap).filter((g: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.skillId === g.skillId));
        }
      }
    }

    // Sort by how many gaps they address, then by gap severity
    recommendations.sort((a, b) => {
      if (b.addressedGaps.length !== a.addressedGaps.length) {
        return b.addressedGaps.length - a.addressedGaps.length; // More gaps first
      }
      const aMaxSeverity = Math.max(...a.addressedGaps.map((g: any) => g.gapSeverity));
      const bMaxSeverity = Math.max(...b.addressedGaps.map((g: any) => g.gapSeverity));
      return bMaxSeverity - aMaxSeverity;
    });

    res.status(200).json({ recommendations });
  } catch (error) {
    next(error);
  }
};

export const getMyLearning = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });

    if (!student || !student.studentProfile) {
      res.status(400).json({ error: "Student profile not found" });
      return;
    }

    const learning = await prisma.studentLearningResource.findMany({
      where: { studentProfileId: student.studentProfile.id },
      include: {
        learningResource: {
          include: {
            organization: true,
            learningResourceSkills: { include: { skill: true } }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.status(200).json({ learning });
  } catch (error) {
    next(error);
  }
};

export const trackProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const resourceId = String(req.params.id);
    const { status: newStatus } = trackLearningProgressSchema.parse(req.body);

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });

    if (!student || !student.studentProfile) {
      res.status(400).json({ error: "Student profile not found" });
      return;
    }

    const profileId = student.studentProfile.id;

    // Check if enrollment exists
    let enrollment = await prisma.studentLearningResource.findUnique({
      where: {
        studentProfileId_learningResourceId: {
          studentProfileId: profileId,
          learningResourceId: resourceId
        }
      }
    });

    if (!enrollment) {
      // Allow moving directly to IN_PROGRESS or COMPLETED if not started explicitly, but typically we want forward transitions
      if (newStatus !== 'IN_PROGRESS' && newStatus !== 'COMPLETED' && newStatus !== 'NOT_STARTED') {
        res.status(400).json({ error: "Invalid status" });
        return;
      }
      enrollment = await prisma.studentLearningResource.create({
        data: {
          studentProfileId: profileId,
          learningResourceId: resourceId,
          status: newStatus as any,
          startedAt: (newStatus === 'IN_PROGRESS' || newStatus === 'COMPLETED') ? new Date() : null,
          completedAt: newStatus === 'COMPLETED' ? new Date() : null,
        }
      });
      res.status(200).json({ enrollment });
      return;
    }

    const currentStatus = enrollment.status;

    // State machine logic
    let isValidTransition = false;
    if (currentStatus === 'NOT_STARTED' && ['IN_PROGRESS', 'COMPLETED'].includes(newStatus)) {
      isValidTransition = true;
    } else if (currentStatus === 'IN_PROGRESS' && newStatus === 'COMPLETED') {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      res.status(400).json({ error: `Cannot transition learning progress from ${currentStatus} to ${newStatus}` });
      return;
    }

    const dataToUpdate: any = { status: newStatus };
    if (newStatus === 'IN_PROGRESS' && !enrollment.startedAt) {
      dataToUpdate.startedAt = new Date();
    } else if (newStatus === 'COMPLETED') {
      dataToUpdate.completedAt = new Date();
      if (!enrollment.startedAt) dataToUpdate.startedAt = new Date();
    }

    const updated = await prisma.studentLearningResource.update({
      where: { id: enrollment.id },
      data: dataToUpdate
    });

    res.status(200).json({ enrollment: updated });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};
