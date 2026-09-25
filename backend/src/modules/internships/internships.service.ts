import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';

export class InternshipService {
  async getInternships(userId: string, role: string, organizationId?: string) {
    if (role === 'STUDENT') {
      return prisma.internship.findMany({
        where: { studentId: userId },
        include: {
          opportunity: true,
          organization: true,
          milestones: true
        }
      });
    } else if (role === 'INDUSTRY' && organizationId) {
      return prisma.internship.findMany({
        where: { organizationId },
        include: {
          opportunity: true,
          student: { select: { id: true, name: true, email: true } },
          milestones: true
        }
      });
    }
    return [];
  }

  async getInternshipById(internshipId: string, userId: string, role: string, organizationId?: string) {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        opportunity: true,
        student: { select: { id: true, name: true, email: true } },
        organization: true,
        milestones: { orderBy: { createdAt: 'asc' } },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, role: true } } }
        }
      }
    });

    if (!internship) throw new Error('Internship not found');

    if (role === 'STUDENT' && internship.studentId !== userId) {
      throw new Error('Unauthorized');
    }
    if (role === 'INDUSTRY' && internship.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    return internship;
  }

  async startInternship(applicationId: string, userId: string, role: string, organizationId?: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { opportunity: true }
    });

    if (!application) throw new Error('Application not found');
    if (application.status !== 'ACCEPTED') throw new Error('Application must be ACCEPTED to start an internship');

    if (role === 'INDUSTRY' && application.opportunity.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    // Check if internship already exists
    const existing = await prisma.internship.findUnique({
      where: { applicationId }
    });
    if (existing) throw new Error('Internship already exists for this application');

    const internship = await prisma.internship.create({
      data: {
        applicationId,
        studentId: application.studentId,
        organizationId: application.opportunity.organizationId,
        opportunityId: application.opportunityId,
        status: 'ACTIVE',
        startDate: new Date()
      }
    });

    // Create Notification for Student
    await prisma.notification.create({
      data: {
        userId: application.studentId,
        type: 'SYSTEM',
        payload: { message: `Your internship for ${application.opportunity.title} has officially started!` }
      }
    });

    return internship;
  }

  async updateStatus(internshipId: string, status: any, userId: string, role: string, organizationId?: string) {
    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new Error('Internship not found');

    if (role === 'INDUSTRY' && internship.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    const validTransitions: any = {
      NOT_STARTED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    };

    if (!validTransitions[internship.status].includes(status)) {
      throw new Error(`Invalid status transition from ${internship.status} to ${status}`);
    }

    return prisma.internship.update({
      where: { id: internshipId },
      data: { status }
    });
  }

  async addMilestone(internshipId: string, data: { title: string; description?: string; dueDate?: string }, userId: string, role: string, organizationId?: string) {
    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new Error('Internship not found');

    if (role !== 'INDUSTRY' || internship.organizationId !== organizationId) {
      throw new Error('Unauthorized: Only industry mentors can create milestones');
    }

    return prisma.internshipMilestone.create({
      data: {
        internshipId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });
  }

  async updateMilestone(internshipId: string, milestoneId: string, status: any, userId: string, role: string, organizationId?: string) {
    const milestone = await prisma.internshipMilestone.findUnique({ where: { id: milestoneId }, include: { internship: true } });
    if (!milestone || milestone.internshipId !== internshipId) throw new Error('Milestone not found');

    if (role === 'STUDENT' && milestone.internship.studentId !== userId) {
      throw new Error('Unauthorized');
    }
    if (role === 'INDUSTRY' && milestone.internship.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    return prisma.internshipMilestone.update({
      where: { id: milestoneId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });
  }

  async addProgressUpdate(internshipId: string, content: string, userId: string, role: string, organizationId?: string) {
    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new Error('Internship not found');

    if (role === 'STUDENT' && internship.studentId !== userId) throw new Error('Unauthorized');
    if (role === 'INDUSTRY' && internship.organizationId !== organizationId) throw new Error('Unauthorized');

    const update = await prisma.internshipProgressUpdate.create({
      data: {
        internshipId,
        authorId: userId,
        content
      },
      include: { author: { select: { id: true, name: true, role: true } } }
    });

    // Notify the other party
    const targetUserId = role === 'STUDENT' ? null : internship.studentId;
    if (role === 'STUDENT') {
      // Find a recruiter to notify (or leave as is, since notifications are per-user and an organization might have multiple users)
      // We will skip notifying the industry here unless we want to notify all org members
    } else if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'SYSTEM',
          payload: { message: `New progress update posted on your internship.` }
        }
      });
    }

    return update;
  }

  async completeInternship(internshipId: string, data: { feedback: string; summary: string }, userId: string, role: string, organizationId?: string) {
    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new Error('Internship not found');

    if (role !== 'INDUSTRY' || internship.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    if (internship.status !== 'ACTIVE') throw new Error('Only active internships can be completed');

    const updated = await prisma.internship.update({
      where: { id: internshipId },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
        mentorFeedback: data.feedback,
        completionSummary: data.summary
      }
    });

    await prisma.notification.create({
      data: {
        userId: internship.studentId,
        type: 'SYSTEM',
        payload: { message: `Your internship has been marked as completed! View your feedback and add it to your portfolio.` }
      }
    });

    return updated;
  }

  async addToPortfolio(internshipId: string, userId: string) {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { opportunity: true, organization: true }
    });

    if (!internship) throw new Error('Internship not found');
    if (internship.studentId !== userId) throw new Error('Unauthorized');
    if (internship.status !== 'COMPLETED') throw new Error('Internship must be completed to add to portfolio');

    // Check if already in portfolio
    const existing = await prisma.portfolioItem.findFirst({
      where: {
        studentId: userId,
        title: { contains: internship.opportunity.title }
      }
    });

    if (existing) throw new Error('Internship already exists in your portfolio');

    return prisma.portfolioItem.create({
      data: {
        studentId: userId,
        type: 'INTERNSHIP',
        title: `Internship: ${internship.opportunity.title} at ${internship.organization.name}`,
        description: internship.completionSummary || internship.opportunity.description,
        date: new Date(),
        verificationStatus: 'VERIFIED',
        verifiedBy: null // ideally the mentor's user ID, but we just set it VERIFIED
      }
    });
  }
}

export const internshipService = new InternshipService();
