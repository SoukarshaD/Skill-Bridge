import { prisma } from "../config/database";
export async function cleanupUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  await prisma.notification.deleteMany({
    where: { userId: { in: userIds } }
  });

  await prisma.applicationStatusHistory.deleteMany({
    where: { application: { studentId: { in: userIds } } }
  });

  await prisma.assessmentResponse.deleteMany({
    where: { attempt: { studentId: { in: userIds } } }
  });

  await prisma.assessmentAttempt.deleteMany({
    where: { studentId: { in: userIds } }
  });

  await prisma.collaboration.deleteMany({
    where: { academicianId: { in: userIds } }
  });

  await prisma.application.deleteMany({
    where: { studentId: { in: userIds } }
  });

  await prisma.portfolioItem.deleteMany({
    where: { studentId: { in: userIds } }
  });

  await prisma.document.deleteMany({
    where: { ownerId: { in: userIds } }
  });

  await prisma.studentSkill.deleteMany({
    where: { studentProfile: { userId: { in: userIds } } }
  });

  await prisma.studentLearningResource.deleteMany({
    where: { studentProfile: { userId: { in: userIds } } }
  });

  // Programs organized by these users must be deleted
  // before deleting the users because organizerId is RESTRICT.
  await prisma.programRegistration.deleteMany({
    where: {
      program: {
        organizerId: { in: userIds }
      }
    }
  });

  await prisma.programSkill.deleteMany({
    where: {
      program: {
        organizerId: { in: userIds }
      }
    }
  });

  await prisma.program.deleteMany({
    where: {
      organizerId: { in: userIds }
    }
  });

  await prisma.academicProfile.deleteMany({
    where: { userId: { in: userIds } }
  });

  await prisma.studentProfile.deleteMany({
    where: { userId: { in: userIds } }
  });

  await prisma.user.deleteMany({
    where: { id: { in: userIds } }
  });
}


export async function cleanupAll(): Promise<void> {
  await prisma.notification.deleteMany();

  await prisma.applicationStatusHistory.deleteMany();

  await prisma.assessmentResponse.deleteMany();

  await prisma.assessmentAttempt.deleteMany();

  await prisma.assessmentQuestion.deleteMany();

  await prisma.assessment.deleteMany();

  await prisma.trainingOutcome.deleteMany();

  await prisma.employerValidation.deleteMany();

  await prisma.districtTrainingPlan.deleteMany();

  await prisma.studentLearningResource.deleteMany();

  await prisma.studentSkill.deleteMany();

  await prisma.learningResourceSkill.deleteMany();

  await prisma.demandSignalSkill.deleteMany();

  await prisma.demandSignal.deleteMany();

  await prisma.collaboration.deleteMany();

  await prisma.application.deleteMany();

  await prisma.portfolioItem.deleteMany();

  await prisma.document.deleteMany();

  await prisma.learningResource.deleteMany();

  await prisma.programRegistration.deleteMany();

  await prisma.programSkill.deleteMany();

  await prisma.program.deleteMany();

  await prisma.mentorship.deleteMany();

  await prisma.mentorshipProgram.deleteMany();

  await prisma.opportunitySkill.deleteMany();

  await prisma.opportunity.deleteMany();

  await prisma.academicProfile.deleteMany();

  await prisma.studentProfile.deleteMany();

  await prisma.user.deleteMany();

  await prisma.organization.deleteMany();

  await prisma.skillTaxonomy.deleteMany();

  await prisma.auditLog.deleteMany();
}