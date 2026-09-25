import { prisma } from '../../config/database';
import { ValidationRelevance, OutcomeCategory } from '@prisma/client';

export class LmiFeedbackService {

  // ==========================================
  // EMPLOYER VALIDATION
  // ==========================================

  async submitEmployerValidation(data: {
    skillId?: string;
    programId?: string;
    relevance: ValidationRelevance;
    comments?: string;
    organizationId: string;
    userId: string;
  }) {
    // Basic validation
    if (!data.skillId && !data.programId) {
      throw new Error("Validation must specify either a skill or a program.");
    }

    // Application-layer deduplication: An organization can only have one validation per skill/program combo
    const existing = await prisma.employerValidation.findFirst({
      where: {
        organizationId: data.organizationId,
        skillId: data.skillId || null,
        programId: data.programId || null
      }
    });

    if (existing) {
      // Update existing
      return await prisma.employerValidation.update({
        where: { id: existing.id },
        data: {
          relevance: data.relevance,
          comments: data.comments,
          userId: data.userId // updating the user who last touched it
        }
      });
    }

    return await prisma.employerValidation.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        skillId: data.skillId || null,
        programId: data.programId || null,
        relevance: data.relevance,
        comments: data.comments
      }
    });
  }

  async getValidationConfidence(count: number) {
    if (count === 0) return 'NO_VALIDATION';
    if (count <= 2) return 'LOW';
    if (count <= 5) return 'MEDIUM';
    return 'HIGH';
  }

  async getSkillValidations(skillId: string) {
    const validations = await prisma.employerValidation.findMany({
      where: { skillId, programId: null },
      include: { organization: { select: { name: true } } }
    });

    const breakdown = { RELEVANT: 0, LOW_RELEVANCE: 0, EMERGING_IMPORTANCE: 0 };
    validations.forEach(v => breakdown[v.relevance]++);

    return {
      skillId,
      totalCount: validations.length,
      confidence: await this.getValidationConfidence(validations.length),
      breakdown,
      validations: validations.map(v => ({
        id: v.id,
        relevance: v.relevance,
        comments: v.comments,
        organizationName: v.organization.name,
        createdAt: v.createdAt
      }))
    };
  }

  async getProgramValidations(programId: string) {
    const validations = await prisma.employerValidation.findMany({
      where: { programId },
      include: { organization: { select: { name: true } }, skill: { select: { name: true } } }
    });

    const breakdown = { RELEVANT: 0, LOW_RELEVANCE: 0, EMERGING_IMPORTANCE: 0 };
    validations.forEach(v => breakdown[v.relevance]++);

    return {
      programId,
      totalCount: validations.length,
      confidence: await this.getValidationConfidence(validations.length),
      breakdown,
      validations: validations.map(v => ({
        id: v.id,
        relevance: v.relevance,
        comments: v.comments,
        organizationName: v.organization.name,
        skillName: v.skill?.name || null,
        createdAt: v.createdAt
      }))
    };
  }

  // ==========================================
  // OUTCOMES
  // ==========================================

  async submitOutcome(data: {
    programId: string;
    studentId: string;
    category: OutcomeCategory;
    source?: string;
  }) {
    // Outcomes might legitimately change over time (e.g. COMPLETED -> EMPLOYMENT).
    // The schema allows distinct categories per student per program.
    // If we're submitting EMPLOYMENT, it's fine if they already have COMPLETED.
    
    return await prisma.trainingOutcome.upsert({
      where: {
        programId_studentId_category: {
          programId: data.programId,
          studentId: data.studentId,
          category: data.category
        }
      },
      update: {
        source: data.source,
        evidenceDate: new Date()
      },
      create: {
        programId: data.programId,
        studentId: data.studentId,
        category: data.category,
        source: data.source
      }
    });
  }

  async getProgramOutcomes(programId: string) {
    const outcomes = await prisma.trainingOutcome.findMany({
      where: { programId }
    });

    const totalStudents = new Set(outcomes.map(o => o.studentId)).size;
    const evidenceStatus = totalStudents < 5 ? 'INSUFFICIENT_DATA' : 'SUFFICIENT_DATA';

    const breakdown = {
      TRAINING_COMPLETED: 0,
      EMPLOYMENT: 0,
      APPRENTICESHIP: 0,
      FURTHER_TRAINING: 0,
      NOT_PLACED: 0,
      UNKNOWN: 0
    };

    outcomes.forEach(o => breakdown[o.category]++);

    return {
      programId,
      totalTrackedStudents: totalStudents,
      evidenceStatus,
      breakdown,
      rates: evidenceStatus === 'SUFFICIENT_DATA' ? {
        completionRate: Math.round((breakdown.TRAINING_COMPLETED / totalStudents) * 100),
        employmentRate: Math.round((breakdown.EMPLOYMENT / totalStudents) * 100),
        apprenticeshipRate: Math.round((breakdown.APPRENTICESHIP / totalStudents) * 100)
      } : null,
      note: 'Based on platform-recorded outcomes. Not a guaranteed placement rate.'
    };
  }
}
