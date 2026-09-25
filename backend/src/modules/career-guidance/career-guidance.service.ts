import { prisma } from '../../config/database';
import { calculateMatchScore } from '../matching/matching.utils';

export class CareerGuidanceService {
  
  async getRoles() {
    return prisma.careerRole.findMany({
      include: {
        requiredSkills: {
          include: { skill: true }
        }
      }
    });
  }

  async getRole(id: string) {
    return prisma.careerRole.findUnique({
      where: { id },
      include: {
        requiredSkills: {
          include: { skill: true }
        }
      }
    });
  }

  async getRecommendations(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || !user.studentProfile) {
      throw new Error("Student profile not found");
    }

    const studentSkills = user.studentProfile.studentSkills;
    const roles = await this.getRoles();

    const recommendations = roles.map(role => {
      // Map CareerRoleSkill to what calculateMatchScore expects (OpportunitySkill structure)
      const mappedSkills = role.requiredSkills.map(rs => ({
        ...rs,
        opportunityId: 'dummy',
      })) as any[];

      const match = calculateMatchScore(studentSkills, mappedSkills);

      return {
        role,
        score: match.overallMatchPercentage || 0,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    });

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }

  async getRoleGaps(roleId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || !user.studentProfile) {
      throw new Error("Student profile not found");
    }

    const role = await this.getRole(roleId);
    if (!role) {
      throw new Error("Career role not found");
    }

    const studentSkills = user.studentProfile.studentSkills;
    const mappedSkills = role.requiredSkills.map(rs => ({
      ...rs,
      opportunityId: 'dummy',
    })) as any[];

    const match = calculateMatchScore(studentSkills, mappedSkills);

    const readinessPercentage = match.overallMatchPercentage || 0;

    return {
      role,
      readinessPercentage,
      strongMatches: match.matchedSkills,
      skillGaps: match.missingSkills,
      topImprovementAreas: match.missingSkills.slice(0, 3)
    };
  }

  async getCareerPathway(roleId: string, userId: string) {
    const gaps = await this.getRoleGaps(roleId, userId);

    // 1. Recommended Learning (based on gaps)
    const missingSkillIds = gaps.skillGaps.map(g => g.skillId);
    let recommendedLearning: any[] = [];
    if (missingSkillIds.length > 0) {
      recommendedLearning = await prisma.learningResource.findMany({
        where: {
          learningResourceSkills: {
            some: {
              skillId: { in: missingSkillIds }
            }
          }
        },
        include: {
          learningResourceSkills: { include: { skill: true } }
        },
        take: 5
      });
    }

    // 2. Relevant Opportunities (based on role skills)
    const roleSkillIds = gaps.role.requiredSkills.map(rs => rs.skillId);
    let relevantOpportunities: any[] = [];
    if (roleSkillIds.length > 0) {
      relevantOpportunities = await prisma.opportunity.findMany({
        where: {
          status: 'PUBLISHED',
          requiredSkills: {
            some: {
              skillId: { in: roleSkillIds }
            }
          }
        },
        include: {
          organization: true,
          requiredSkills: { include: { skill: true } }
        },
        take: 5
      });
    }

    // 3. Portfolio Evidence
    const portfolio = await prisma.portfolioItem.findMany({
      where: { studentId: userId }
    });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: userId },
      include: {
        skills: { include: { skill: true } }
      }
    });

    // 4. Relevant Projects/Internships (completed apps or workspaces)
    const internships = await prisma.internship.findMany({
      where: { studentId: userId },
      include: { opportunity: true }
    });

    const projectWorkspaces = await prisma.projectWorkspace.findMany({
      where: { studentId: userId },
      include: { opportunity: true }
    });

    return {
      ...gaps,
      recommendedLearning,
      relevantOpportunities,
      evidence: {
        portfolio,
        certificates,
        internships,
        projectWorkspaces
      }
    };
  }
}
