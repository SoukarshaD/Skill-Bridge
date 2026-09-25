import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';

export class InternshipService {
  async getInternships(userId: string, role: string, organizationId?: string) {
    if (role === 'STUDENT') {
      return prisma.internship.findMany({
        where: { studentId: userId },
        include: {
          opportunity: true,
          organization: true
        }
      });
    } else if (role === 'INDUSTRY' && organizationId) {
      return prisma.internship.findMany({
        where: { organizationId },
        include: {
          opportunity: true,
          student: { select: { id: true, name: true, email: true } }
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
        organization: true
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
