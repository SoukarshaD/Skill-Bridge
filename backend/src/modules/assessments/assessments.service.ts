import { prisma } from '../../config/database';
import { AssessmentType, AttemptStatus, VerificationStatus } from '@prisma/client';

export class AssessmentService {
  /**
   * Get all published assessments
   */
  async getPublishedAssessments() {
    return prisma.assessment.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get assessment details by ID
   */
  async getAssessmentById(id: string) {
    const assessment = await prisma.assessment.findFirst({
      where: { id, isPublished: true },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            difficulty: true,
            marks: true,
            order: true,
            skillId: true,
            skill: { select: { name: true } }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!assessment) {
      throw new Error('Assessment not found or not published');
    }

    return assessment;
  }

  /**
   * Start a new attempt for a student
   */
  async startAttempt(assessmentId: string, studentId: string) {
    // Check if assessment exists
    await this.getAssessmentById(assessmentId);

    // Check if student already has an IN_PROGRESS attempt
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { assessmentId, studentId, status: 'IN_PROGRESS' }
    });

    if (existing) {
      return existing;
    }

    return prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        studentId,
        status: 'IN_PROGRESS'
      }
    });
  }

  /**
   * Submit an attempt, calculate score, and update StudentSkill profile
   */
  async submitAttempt(attemptId: string, studentId: string, answers: { questionId: string; answer: string }[]) {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { id: attemptId, studentId },
      include: {
        assessment: {
          include: {
            questions: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (!attempt) throw new Error('Attempt not found');
    if (attempt.status === 'COMPLETED') throw new Error('Attempt already submitted');

    let totalScore = 0;
    let maxScore = 0;

    // Track skill scores
    const skillScores = new Map<string, { skillId: string; earned: number; total: number }>();

    const responsesToCreate: any[] = [];

    for (const q of attempt.assessment.questions) {
      maxScore += q.marks;
      const submittedAnswer = answers.find(a => a.questionId === q.id);
      
      let isCorrect = false;
      let marksAwarded = 0;

      if (submittedAnswer && submittedAnswer.answer === q.correctAnswer) {
        isCorrect = true;
        marksAwarded = q.marks;
        totalScore += q.marks;
      }

      responsesToCreate.push({
        attemptId: attempt.id,
        questionId: q.id,
        answer: submittedAnswer ? submittedAnswer.answer : '',
        isCorrect,
        marksAwarded
      });

      if (q.skillId) {
        const existing = skillScores.get(q.skillId) || { skillId: q.skillId, earned: 0, total: 0 };
        existing.earned += marksAwarded;
        existing.total += q.marks;
        skillScores.set(q.skillId, existing);
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Save responses & update attempt
    await prisma.$transaction(async (tx) => {
      await tx.assessmentResponse.createMany({
        data: responsesToCreate
      });

      await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'COMPLETED',
          score: totalScore,
          maxScore,
          percentage,
          submittedAt: new Date()
        }
      });

      // Update StudentSkills based on deterministic rule
      // 0-20% = 1, 21-40% = 2, 41-60% = 3, 61-80% = 4, 81-100% = 5
      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId: studentId }
      });

      if (studentProfile && attempt.assessment.type === 'TECHNICAL') {
        for (const [skillId, stats] of skillScores.entries()) {
          const skillPercentage = stats.total > 0 ? (stats.earned / stats.total) * 100 : 0;
          let calculatedProficiency = 1;
          if (skillPercentage > 80) calculatedProficiency = 5;
          else if (skillPercentage > 60) calculatedProficiency = 4;
          else if (skillPercentage > 40) calculatedProficiency = 3;
          else if (skillPercentage > 20) calculatedProficiency = 2;

          const existingSkill = await tx.studentSkill.findFirst({
            where: { studentProfileId: studentProfile.id, skillId }
          });

          if (existingSkill) {
            // Do not downgrade if verified, or if existing is higher
            if (existingSkill.verificationStatus === 'VERIFIED') continue;
            if (existingSkill.proficiency >= calculatedProficiency) continue;

            await tx.studentSkill.update({
              where: { id: existingSkill.id },
              data: {
                proficiency: calculatedProficiency,
                verificationStatus: 'VERIFIED' // Mark as verified by assessment
              }
            });
          } else {
            await tx.studentSkill.create({
              data: {
                studentProfileId: studentProfile.id,
                skillId,
                proficiency: calculatedProficiency,
                verificationStatus: 'VERIFIED'
              }
            });
          }
        }
      }
    });

    return this.getAttemptResult(attemptId, studentId);
  }

  /**
   * Get attempt results (including skill performance)
   */
  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { id: attemptId, studentId },
      include: {
        assessment: true,
        responses: {
          include: {
            question: {
              include: {
                skill: true
              }
            }
          }
        }
      }
    });

    if (!attempt) throw new Error('Attempt not found');
    if (attempt.status !== 'COMPLETED') throw new Error('Attempt not completed');

    const skillMap = new Map<string, { skillName: string; earned: number; total: number }>();
    
    for (const res of attempt.responses) {
      const q = res.question;
      if (q.skillId && q.skill) {
        const existing = skillMap.get(q.skillId) || { skillName: q.skill.name, earned: 0, total: 0 };
        existing.earned += res.marksAwarded;
        existing.total += q.marks;
        skillMap.set(q.skillId, existing);
      }
    }

    const skillsPerformance = Array.from(skillMap.values()).map(s => ({
      skillName: s.skillName,
      percentage: s.total > 0 ? (s.earned / s.total) * 100 : 0
    }));

    skillsPerformance.sort((a, b) => b.percentage - a.percentage);

    const strongestSkills = skillsPerformance.slice(0, 3);
    const skillGaps = skillsPerformance.slice(-3).reverse().filter(s => !strongestSkills.includes(s));

    return {
      ...attempt,
      strongestSkills,
      skillGaps,
      skillsPerformance
    };
  }

  /**
   * Get all attempts for a student
   */
  async getMyAttempts(studentId: string) {
    return prisma.assessmentAttempt.findMany({
      where: { studentId },
      include: {
        assessment: {
          select: { title: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
