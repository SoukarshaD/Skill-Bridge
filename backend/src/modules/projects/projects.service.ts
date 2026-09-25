import { prisma } from '../../config/database';
import { ProjectStatus, ProjectMilestoneStatus } from '@prisma/client';
import { issueCertificateFromSource } from '../certificates/certificates.service';

export const projectService = {
  async getProjects(userId: string, role: string, organizationId?: string) {
    if (role === 'STUDENT') {
      return prisma.projectWorkspace.findMany({
        where: { studentId: userId },
        include: { opportunity: true, organization: true, mentor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'INDUSTRY' || role === 'ACADEMICIAN' || role === 'ADMIN') {
      return prisma.projectWorkspace.findMany({
        where: role === 'ADMIN' ? {} : { organizationId },
        include: { student: { select: { name: true, email: true } }, opportunity: true, mentor: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
    return [];
  },

  async getProjectById(projectId: string, userId: string, role: string, organizationId?: string) {
    const project = await prisma.projectWorkspace.findUnique({
      where: { id: projectId },
      include: {
        student: { select: { id: true, name: true, email: true, studentProfile: true } },
        opportunity: true,
        organization: true,
        mentor: { select: { id: true, name: true, email: true } },
        milestones: {
          orderBy: { createdAt: 'asc' },
          include: { deliverableDocument: true }
        }
      }
    });

    if (!project) throw new Error('Project not found');

    if (role === 'STUDENT' && project.studentId !== userId) {
      throw new Error('Unauthorized');
    }
    if ((role === 'INDUSTRY' || role === 'ACADEMICIAN') && project.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    return project;
  },

  async startProject(applicationId: string, userId: string, role: string, organizationId?: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { opportunity: true }
    });

    if (!application) throw new Error('Application not found');
    if (application.status !== 'ACCEPTED') throw new Error('Application must be accepted to start project');
    if ((role === 'INDUSTRY' || role === 'ACADEMICIAN') && application.opportunity.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    // Check if already exists
    const existing = await prisma.projectWorkspace.findUnique({ where: { applicationId } });
    if (existing) throw new Error('Project workspace already exists for this application');

    return prisma.projectWorkspace.create({
      data: {
        applicationId,
        studentId: application.studentId,
        organizationId: application.opportunity.organizationId,
        opportunityId: application.opportunityId,
        status: 'ACTIVE',
        startDate: new Date(),
        mentorId: userId // Set starter as mentor initially, can be changed later
      }
    });
  },

  async updateStatus(projectId: string, data: any, userId: string, role: string, organizationId?: string) {
    const project = await prisma.projectWorkspace.findUnique({ where: { id: projectId }, include: { opportunity: true, organization: true } });
    if (!project) throw new Error('Project not found');

    if ((role === 'INDUSTRY' || role === 'ACADEMICIAN') && project.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    const isCompleting = data.status === 'COMPLETED' && project.status !== 'COMPLETED';

    const updated = await prisma.projectWorkspace.update({
      where: { id: projectId },
      data: {
        status: data.status,
        completionSummary: data.completionSummary,
        mentorFeedback: data.mentorFeedback,
        actualEndDate: isCompleting ? new Date() : undefined
      }
    });

    if (isCompleting) {
      await prisma.notification.create({
        data: {
          userId: project.studentId,
          type: 'SYSTEM',
          payload: {
            title: `Project Completed`,
            message: `Your project ${project.opportunity.title} has been marked as completed!`,
            actionUrl: `/student/projects/${project.id}`
          }
        }
      });

      if (project.opportunity.certificateAvailable) {
        const skills = await prisma.opportunitySkill.findMany({ where: { opportunityId: project.opportunityId } });
        await issueCertificateFromSource(
          project.studentId,
          'INTERNSHIP', // Using INTERNSHIP/PROGRAM/EXTERNAL. We'll use INTERNSHIP for now as it maps closest to Live Project for certificates
          project.opportunityId,
          `${project.opportunity.title} Live Project`,
          project.organization.name,
          `Awarded for successfully completing the Live Project: ${project.opportunity.title}`,
          skills.map(s => s.skillId),
          'INTERNAL_COMPLETION'
        );
      }
    }

    return updated;
  },

  async addMilestone(projectId: string, data: any, userId: string, role: string, organizationId?: string) {
    const project = await prisma.projectWorkspace.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    if ((role === 'INDUSTRY' || role === 'ACADEMICIAN') && project.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING'
      }
    });

    await prisma.notification.create({
      data: {
        userId: project.studentId,
        type: 'SYSTEM',
        payload: {
          title: `New Project Milestone`,
          message: `A new milestone "${data.title}" has been added to your project.`,
          actionUrl: `/student/projects/${project.id}`
        }
      }
    });

    return milestone;
  },

  async updateMilestone(projectId: string, milestoneId: string, data: any, userId: string, role: string, organizationId?: string) {
    const project = await prisma.projectWorkspace.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    if (role === 'STUDENT' && project.studentId !== userId) throw new Error('Unauthorized');
    if ((role === 'INDUSTRY' || role === 'ACADEMICIAN') && project.organizationId !== organizationId) throw new Error('Unauthorized');

    const isCompleting = data.status === 'COMPLETED';
    
    // Students can only submit deliverables
    if (role === 'STUDENT') {
      if (['REVIEWED', 'COMPLETED'].includes(data.status)) {
        throw new Error('Students cannot mark milestones as reviewed or completed');
      }
    }

    const updated = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        status: data.status,
        deliverableUrl: data.deliverableUrl !== undefined ? data.deliverableUrl : undefined,
        deliverableDocumentId: data.deliverableDocumentId !== undefined ? data.deliverableDocumentId : undefined,
        feedback: data.feedback !== undefined ? data.feedback : undefined,
        completedAt: isCompleting ? new Date() : undefined
      }
    });

    // Notify appropriately
    if (role === 'STUDENT' && data.status === 'SUBMITTED') {
      // Notify mentor/organizer
      const orgUsers = await prisma.user.findMany({ where: { organizationId: project.organizationId } });
      for (const u of orgUsers) {
         await prisma.notification.create({
           data: {
             userId: u.id,
             type: 'SYSTEM',
             payload: {
               title: `Milestone Submitted`,
               message: `Student submitted deliverables for milestone ${updated.title}.`,
               actionUrl: `/admin/projects/${project.id}`
             }
           }
         });
      }
    } else if (role !== 'STUDENT' && data.status === 'COMPLETED') {
       await prisma.notification.create({
           data: {
             userId: project.studentId,
             type: 'SYSTEM',
             payload: {
               title: `Milestone Completed`,
               message: `Your milestone "${updated.title}" was marked as completed.`,
               actionUrl: `/student/projects/${project.id}`
             }
           }
         });
    }

    return updated;
  }
};
