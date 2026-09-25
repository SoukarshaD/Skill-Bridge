import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { calculateMatchScore, isEligible } from '../matching/matching.utils';
import { createOpportunitySchema } from './opportunities.schema';

export const createOpportunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createOpportunitySchema.parse(req.body);
    const { requiredSkills, ...opportunityData } = data;
    const userId = (req as any).user.userId;

    // We assume the user is Industry/Admin and has an organization.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user || !user.organizationId) {
      res.status(403).json({ error: "User is not associated with an organization" });
      return;
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        ...opportunityData,
        organizationId: user.organizationId,
        requiredSkills: requiredSkills ? {
          create: requiredSkills
        } : undefined
      },
      include: {
        requiredSkills: {
          include: { skill: true }
        }
      }
    });

    res.status(201).json({ opportunity });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
    } else {
      next(error);
    }
  }
};

export const getOrganizationOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.organizationId) {
      res.status(403).json({ error: "User is not associated with an organization" });
      return;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { organizationId: user.organizationId },
      include: {
        requiredSkills: {
          include: { skill: true }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ opportunities });
  } catch (error) {
    next(error);
  }
};

export const getStudentRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;

    // Fetch student profile and skills
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: {
            studentSkills: {
              include: { skill: true }
            }
          }
        }
      }
    });

    if (!student || !student.studentProfile) {
      res.status(400).json({ error: "Student profile incomplete. Please complete your profile first." });
      return;
    }

    // Fetch active opportunities
    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        requiredSkills: {
          include: { skill: true }
        },
        organization: true
      }
    });

    // Score and filter
    const recommendations = [];
    for (const opp of opportunities) {
      if (!isEligible(student.studentProfile, opp)) {
        continue;
      }

      const matchResult = calculateMatchScore(
        student.studentProfile.studentSkills,
        opp.requiredSkills
      );

      recommendations.push({
        opportunity: opp,
        match: matchResult
      });
    }

    // Sort descending by overallMatchPercentage (nulls at the bottom)
    recommendations.sort((a, b) => {
      const aScore = a.match.overallMatchPercentage ?? -1;
      const bScore = b.match.overallMatchPercentage ?? -1;
      return bScore - aScore;
    });

    res.status(200).json({ recommendations });
  } catch (error) {
    next(error);
  }
};



export const getAllPublishedOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = (req as any).user.id;
    const { type, location, remoteOnly } = req.query;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: { studentSkills: { include: { skill: true } } }
        }
      }
    });

    const where: any = { status: 'PUBLISHED' };
    if (type) {
      where.type = String(type);
    } else {
      // By default, exclude academician-only types for students
      where.type = {
        notIn: ['FACULTY_INTERNSHIP', 'INDUSTRIAL_TRAINING', 'CONSULTANCY', 'RESEARCH_COLLABORATION']
      };
    }
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (remoteOnly === 'true') where.workMode = 'REMOTE';

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        requiredSkills: { include: { skill: true } },
        organization: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const results = opportunities.map(opp => {
      let matchResult = null;
      if (student?.studentProfile) {
        matchResult = calculateMatchScore(student.studentProfile.studentSkills, opp.requiredSkills);
      }
      return {
        opportunity: opp,
        match: matchResult
      };
    });

    res.status(200).json({ opportunities: results });
  } catch (error) {
    next(error);
  }
};

export const getOpportunityDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const opportunityId = String(req.params.id);
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        requiredSkills: { include: { skill: true } },
        organization: true
      }
    });

    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    // Only industry owner or admin can view draft/closed opportunities, students can only view published
    if (opportunity.status !== 'PUBLISHED' && userRole === 'STUDENT') {
      res.status(403).json({ error: "This opportunity is not available" });
      return;
    }

    let matchResult = null;
    let applicationStatus = null;

    if (userRole === 'STUDENT') {
      const student = await prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: { include: { studentSkills: { include: { skill: true } } } } }
      });

      if (student?.studentProfile) {
        matchResult = calculateMatchScore(student.studentProfile.studentSkills, opportunity.requiredSkills);
      }

      const existingApp = await prisma.application.findUnique({
        where: { opportunityId_studentId: { opportunityId, studentId: userId } }
      });
      if (existingApp) {
        applicationStatus = existingApp.status;
      }
    }

    res.status(200).json({ opportunity, match: matchResult, applicationStatus });
  } catch (error) {
    next(error);
  }
};


export const getAcademicianOpportunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'PUBLISHED',
        type: {
          in: ['FACULTY_INTERNSHIP', 'INDUSTRIAL_TRAINING', 'FDP', 'CONSULTANCY', 'RESEARCH_COLLABORATION']
        }
      },
      include: {
        requiredSkills: { include: { skill: true } },
        organization: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ opportunities });
  } catch (error) {
    next(error);
  }
};

export const searchAcademicians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { query } = req.query;
    const academicians = await prisma.user.findMany({
      where: {
        role: 'ACADEMICIAN',
        academicProfile: query ? {
          OR: [
            { expertise: { hasSome: [String(query)] } },
            { researchAreas: { hasSome: [String(query)] } },
            { consultancyAreas: { hasSome: [String(query)] } }
          ]
        } : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        academicProfile: {
          select: {
            institution: true,
            department: true,
            expertise: true,
            researchAreas: true,
            consultancyAreas: true
          }
        },
        institution: {
          select: {
            name: true,
            domain: true
          }
        }
      }
    });

    res.status(200).json({ academicians });
  } catch (error) {
    next(error);
  }
};
