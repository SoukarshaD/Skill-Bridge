import { prisma } from '../../config/database';
import { ProgramStatus, RegistrationStatus, ProgramType } from '@prisma/client';
import { calculateMatchScore } from '../matching/matching.utils';

export class ProgramsService {
  async getPrograms(status?: ProgramStatus, type?: ProgramType) {
    return prisma.program.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type })
      },
      include: {
        organization: true,
        organizer: { select: { id: true, name: true, email: true } },
        requiredSkills: { include: { skill: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProgramById(id: string) {
    const p = await prisma.program.findUnique({
      where: { id },
      include: {
        organization: true,
        organizer: { select: { id: true, name: true, email: true } },
        requiredSkills: { include: { skill: true } }
      }
    });
    if (!p) throw new Error('Program not found');
    return p;
  }

  async getProgramsByOrganization(organizationId: string) {
    return prisma.program.findMany({
      where: { organizationId },
      include: {
        organization: true,
        organizer: { select: { id: true, name: true, email: true } },
        requiredSkills: { include: { skill: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProgramsByOrganizer(organizerId: string) {
    return prisma.program.findMany({
      where: { organizerId },
      include: {
        organization: true,
        requiredSkills: { include: { skill: true } },
        _count: { select: { registrations: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createProgram(organizerId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || !user.organizationId) throw new Error('User does not belong to an organization');

    const { requiredSkills, ...programData } = data;

    return prisma.program.create({
      data: {
        ...programData,
        organizerId,
        organizationId: user.organizationId,
        requiredSkills: requiredSkills ? {
          create: requiredSkills
        } : undefined
      },
      include: {
        requiredSkills: { include: { skill: true } }
      }
    });
  }

  async updateProgram(id: string, organizerId: string, data: any) {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new Error('Program not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (program.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized to update this program');
    }

    const { requiredSkills, ...programData } = data;

    if (requiredSkills) {
      await prisma.programSkill.deleteMany({ where: { programId: id } });
    }

    return prisma.program.update({
      where: { id },
      data: {
        ...programData,
        requiredSkills: requiredSkills ? {
          create: requiredSkills
        } : undefined
      },
      include: {
        requiredSkills: { include: { skill: true } }
      }
    });
  }

  async deleteProgram(id: string, organizerId: string) {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) throw new Error('Program not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (program.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized to delete this program');
    }

    return prisma.program.delete({ where: { id } });
  }

  async registerForProgram(programId: string, studentId: string) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { _count: { select: { registrations: { where: { status: { in: ['REGISTERED', 'ATTENDED', 'COMPLETED'] } } } } } }
    });
    if (!program) throw new Error('Program not found');
    if (program.status !== 'PUBLISHED') throw new Error('Program is not open for registration');
    
    if (program.registrationDeadline && new Date() > program.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }
    
    if (program.capacity && program._count.registrations >= program.capacity) {
      throw new Error('Program is full');
    }

    const existing = await prisma.programRegistration.findUnique({
      where: { programId_participantId: { programId, participantId: studentId } }
    });
    if (existing) throw new Error('Already registered');

    // Create registration
    const registration = await prisma.programRegistration.create({
      data: {
        programId,
        participantId: studentId,
        status: 'REGISTERED'
      }
    });

    // Notify
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        payload: {
          title: `Registered for ${program.title}`,
          message: `You have successfully registered for ${program.title}.`
        }
      }
    });

    return registration;
  }

  async cancelRegistration(programId: string, studentId: string) {
    const reg = await prisma.programRegistration.findUnique({
      where: { programId_participantId: { programId, participantId: studentId } }
    });
    if (!reg) throw new Error('Registration not found');
    if (reg.status === 'COMPLETED' || reg.status === 'ATTENDED') throw new Error('Cannot cancel after attending');

    return prisma.programRegistration.update({
      where: { id: reg.id },
      data: { status: 'CANCELLED' }
    });
  }

  async getMyRegistrations(studentId: string) {
    return prisma.programRegistration.findMany({
      where: { participantId: studentId },
      include: {
        program: {
          include: { organization: true, organizer: { select: { name: true } } }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });
  }

  async getProgramParticipants(programId: string, organizerId: string) {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (program.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    return prisma.programRegistration.findMany({
      where: { programId },
      include: {
        participant: {
          select: { id: true, name: true, email: true, studentProfile: { include: { studentSkills: { include: { skill: true } } } }, academicProfile: true }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });
  }

  async updateRegistration(programId: string, participantId: string, organizerId: string, data: { status: RegistrationStatus; feedback?: string }) {
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');

    const user = await prisma.user.findUnique({ where: { id: organizerId } });
    if (!user || (program.organizationId !== user.organizationId && user.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    const reg = await prisma.programRegistration.findUnique({
      where: { programId_participantId: { programId, participantId } }
    });
    if (!reg) throw new Error('Registration not found');

    const completionDate = data.status === 'COMPLETED' ? new Date() : reg.completionDate;

    const updated = await prisma.programRegistration.update({
      where: { id: reg.id },
      data: {
        status: data.status,
        feedback: data.feedback !== undefined ? data.feedback : reg.feedback,
        completionDate
      }
    });

    if (data.status === 'COMPLETED') {
      let message = `You have successfully completed ${program.title}.`;
      let actionUrl = `/student/portfolio`;

      // If program has certificates enabled, issue one automatically
      if (program.certificateAvailable) {
        const { issueCertificateFromSource } = await import('../certificates/certificates.service');
        const org = await prisma.organization.findUnique({ where: { id: program.organizationId } });
        const skills = await prisma.programSkill.findMany({ where: { programId } });

        const cert = await issueCertificateFromSource(
          participantId,
          'PROGRAM',
          programId,
          `${program.title} Certificate`,
          org?.name || 'SkillBridge',
          `Awarded for successfully completing the ${program.type.replace(/_/g, ' ')}: ${program.title}`,
          skills.map(s => s.skillId),
          'INTERNAL_COMPLETION'
        );
        message += ` A certificate has been automatically issued and added to your profile!`;
        actionUrl = `/student/certifications/${cert.id}`;
      } else {
         message += ` You can now add it to your portfolio manually.`;
      }

      await prisma.notification.create({
        data: {
          userId: participantId,
          type: 'SYSTEM',
          payload: {
            title: `Completed ${program.title}`,
            message,
            actionUrl
          }
        }
      });
    }

    return updated;
  }

  async getRecommendations(studentId: string) {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: { studentSkills: { include: { skill: true } } }
        },
        academicProfile: true
      }
    });

    if (!student) throw new Error('User not found');

    const programs = await prisma.program.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        requiredSkills: { include: { skill: true } },
        organization: true
      }
    });

    const recommendations = [];
    for (const p of programs) {
      if (student.studentProfile) {
        const eligibility = (p as any).eligibility as any;
        if (eligibility) {
          const profile = student.studentProfile as any;
          if (eligibility.minYear && profile.year && parseInt(profile.year) < eligibility.minYear) continue;
          if (eligibility.departments?.length && (!profile.department || !eligibility.departments.includes(profile.department))) continue;
        }
      }

      let matchResult = null;
      if (student.studentProfile && p.requiredSkills.length > 0) {
        matchResult = calculateMatchScore(student.studentProfile.studentSkills, p.requiredSkills as any);
      }

      recommendations.push({
        program: p,
        match: matchResult
      });
    }

    recommendations.sort((a, b) => {
      const aGaps = a.match?.missingSkills?.length || 0;
      const bGaps = b.match?.missingSkills?.length || 0;
      return bGaps - aGaps;
    });

    return recommendations;
  }
}

export const programsService = new ProgramsService();
