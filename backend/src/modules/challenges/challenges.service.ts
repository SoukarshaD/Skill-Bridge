import { prisma } from '../../config/database';
import { ChallengeSubmissionStatus } from '@prisma/client';
import { issueCertificateFromSource } from '../certificates/certificates.service';

export const challengeService = {
  async submit(challengeId: string, studentId: string, data: any) {
    const challenge = await prisma.opportunity.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.type !== 'INNOVATION_CHALLENGE') throw new Error('Challenge not found');
    if (challenge.deadline && new Date() > challenge.deadline) throw new Error('Challenge deadline has passed');

    // Check if already submitted
    const existing = await prisma.challengeSubmission.findFirst({
      where: { challengeId, studentId }
    });
    if (existing) throw new Error('You have already submitted a solution for this challenge');

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        studentId: data.teamId ? undefined : studentId,
        teamId: data.teamId,
        title: data.title,
        description: data.description,
        technicalApproach: data.technicalApproach,
        repositoryUrl: data.repositoryUrl,
        demoUrl: data.demoUrl,
        documentId: data.documentId,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        payload: {
          title: `Submission Received`,
          message: `Your submission for ${challenge.title} has been received.`
        }
      }
    });

    return submission;
  },

  async getSubmissions(challengeId: string, organizerId: string) {
    const challenge = await prisma.opportunity.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new Error('Challenge not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (challenge.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    return prisma.challengeSubmission.findMany({
      where: { challengeId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        team: { include: { members: { include: { student: { select: { name: true, email: true } } } } } },
        document: true
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  async getMySubmissions(studentId: string) {
    return prisma.challengeSubmission.findMany({
      where: { studentId },
      include: {
        challenge: { include: { organization: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  async evaluate(challengeId: string, submissionId: string, evaluatorId: string, data: { score: number; feedback: string; status: ChallengeSubmissionStatus }) {
    const challenge = await prisma.opportunity.findUnique({ where: { id: challengeId }, include: { organization: true } });
    if (!challenge) throw new Error('Challenge not found');

    const user = await prisma.user.findUnique({ where: { id: evaluatorId } });
    if (!user || (challenge.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        status: data.status,
        evaluatorId,
        evaluatedAt: new Date()
      },
      include: {
        team: { include: { members: true } }
      }
    });

    // Notify student/team
    const notifyIds = updated.teamId && updated.team ? updated.team.members.map(m => m.studentId) : [updated.studentId as string];
    for (const nId of notifyIds) {
      if (!nId) continue;
      await prisma.notification.create({
        data: {
          userId: nId,
          type: 'SYSTEM',
          payload: {
            title: `Submission Evaluated`,
            message: `Your submission for ${challenge.title} has been evaluated. Status: ${data.status.replace(/_/g, ' ')}`,
            actionUrl: `/student/challenges/${challenge.id}`
          }
        }
      });

      // Issue certificate if selected
      if (data.status === 'SELECTED' && challenge.certificateAvailable) {
        const skills = await prisma.opportunitySkill.findMany({ where: { opportunityId: challengeId } });
        await issueCertificateFromSource(
          nId,
          'EXTERNAL', // or PROGRAM depending on definitions, 'EXTERNAL' or 'INTERNSHIP'. We use 'EXTERNAL' as default for challenges, or add CHALLENGE to enums later
          challengeId,
          `${challenge.title} Winner`,
          challenge.organization.name,
          `Awarded for winning the ${challenge.title} innovation challenge.`,
          skills.map(s => s.skillId),
          'ADMIN_VERIFIED'
        );
      }
    }

    return updated;
  },

  async updateStatus(challengeId: string, submissionId: string, organizerId: string, status: ChallengeSubmissionStatus) {
    const challenge = await prisma.opportunity.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new Error('Challenge not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (challenge.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    return prisma.challengeSubmission.update({
      where: { id: submissionId },
      data: { status }
    });
  },

  async createTeam(challengeId: string, studentId: string, data: { name: string; memberIds?: string[] }) {
    const challenge = await prisma.opportunity.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new Error('Challenge not found');

    const allMembers = [studentId, ...(data.memberIds || [])];
    const uniqueMembers = Array.from(new Set(allMembers));

    if (uniqueMembers.length < challenge.minTeamSize) throw new Error(`Minimum team size is ${challenge.minTeamSize}`);
    if (uniqueMembers.length > challenge.maxTeamSize) throw new Error(`Maximum team size is ${challenge.maxTeamSize}`);

    const team = await prisma.challengeTeam.create({
      data: {
        challengeId,
        name: data.name,
        members: {
          create: uniqueMembers.map(id => ({
            studentId: id,
            isLeader: id === studentId
          }))
        }
      },
      include: { members: true }
    });

    return team;
  }
};
