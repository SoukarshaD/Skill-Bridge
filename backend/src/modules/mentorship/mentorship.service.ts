import { prisma } from '../../config/database';

export class MentorshipService {
  // Programs
  async getPrograms() {
    return prisma.mentorshipProgram.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        mentor: {
          select: { id: true, name: true, organization: { select: { name: true } } }
        }
      }
    });
  }

  async getProgramById(id: string) {
    return prisma.mentorshipProgram.findUnique({
      where: { id },
      include: {
        mentor: { select: { id: true, name: true, organization: { select: { name: true } } } }
      }
    });
  }

  async createProgram(mentorId: string, data: { title: string; description: string; maxMentees: number; expertise: string[] }) {
    return prisma.mentorshipProgram.create({
      data: {
        ...data,
        mentorId,
        status: 'PUBLISHED'
      }
    });
  }

  // Student Actions
  async applyForMentorship(studentId: string, programId: string, objectives: string) {
    const program = await prisma.mentorshipProgram.findUnique({ where: { id: programId } });
    if (!program) throw new Error('Program not found');
    
    // Check existing
    const existing = await prisma.mentorship.findUnique({
      where: { programId_studentId: { programId, studentId } }
    });
    if (existing) throw new Error('Already applied for this program');

    return prisma.mentorship.create({
      data: {
        programId,
        studentId,
        objectives,
        status: 'PENDING'
      }
    });
  }

  // Mentor Actions
  async getMentorRequests(mentorId: string) {
    return prisma.mentorship.findMany({
      where: {
        program: { mentorId },
        status: 'PENDING'
      },
      include: {
        student: { select: { id: true, name: true } },
        program: { select: { title: true } }
      }
    });
  }

  async acceptRequest(mentorId: string, mentorshipId: string) {
    // Verify ownership
    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      include: { program: true }
    });
    if (!mentorship || mentorship.program.mentorId !== mentorId) {
      throw new Error('Unauthorized or not found');
    }

    return prisma.mentorship.update({
      where: { id: mentorshipId },
      data: { status: 'ACTIVE' }
    });
  }

  async rejectRequest(mentorId: string, mentorshipId: string) {
    const mentorship = await prisma.mentorship.findUnique({
      where: { id: mentorshipId },
      include: { program: true }
    });
    if (!mentorship || mentorship.program.mentorId !== mentorId) {
      throw new Error('Unauthorized or not found');
    }

    return prisma.mentorship.update({
      where: { id: mentorshipId },
      data: { status: 'REJECTED' }
    });
  }

  // General Mentorship fetching
  async getMyMentorships(userId: string, role: string) {
    if (role === 'STUDENT') {
      return prisma.mentorship.findMany({
        where: { studentId: userId },
        include: { program: { include: { mentor: { select: { name: true } } } } }
      });
    } else if (role === 'INDUSTRY') {
      return prisma.mentorship.findMany({
        where: { program: { mentorId: userId } },
        include: { student: { select: { name: true } }, program: { select: { title: true } } }
      });
    }
    return [];
  }

  async getMentorshipById(id: string, userId: string) {
    const m = await prisma.mentorship.findUnique({
      where: { id },
      include: {
        program: { include: { mentor: { select: { id: true, name: true } } } },
        student: { select: { id: true, name: true } },
        goals: true,
        sessions: { orderBy: { date: 'asc' } }
      }
    });
    
    if (!m) throw new Error('Not found');
    
    // Auth check
    if (m.studentId !== userId && m.program.mentorId !== userId) {
      throw new Error('Unauthorized');
    }

    return m;
  }

  // Goals & Sessions
  async addGoal(mentorshipId: string, userId: string, title: string) {
    const m = await this.getMentorshipById(mentorshipId, userId);
    return prisma.mentorshipGoal.create({
      data: { mentorshipId, title }
    });
  }

  async toggleGoal(goalId: string, userId: string) {
    const goal = await prisma.mentorshipGoal.findUnique({ where: { id: goalId } });
    if (!goal) throw new Error('Not found');
    await this.getMentorshipById(goal.mentorshipId, userId); // check auth

    return prisma.mentorshipGoal.update({
      where: { id: goalId },
      data: { isCompleted: !goal.isCompleted }
    });
  }

  async addSession(mentorshipId: string, mentorId: string, data: { date: Date, notes: string, nextSteps?: string }) {
    const m = await prisma.mentorship.findUnique({ where: { id: mentorshipId }, include: { program: true } });
    if (!m || m.program.mentorId !== mentorId) throw new Error('Unauthorized');

    return prisma.mentorshipSession.create({
      data: {
        mentorshipId,
        date: new Date(data.date),
        notes: data.notes,
        nextSteps: data.nextSteps
      }
    });
  }

  async completeMentorship(mentorshipId: string, mentorId: string, feedback: string) {
    const m = await prisma.mentorship.findUnique({ where: { id: mentorshipId }, include: { program: true } });
    if (!m || m.program.mentorId !== mentorId) throw new Error('Unauthorized');

    return prisma.mentorship.update({
      where: { id: mentorshipId },
      data: { status: 'COMPLETED', mentorFeedback: feedback }
    });
  }
}
