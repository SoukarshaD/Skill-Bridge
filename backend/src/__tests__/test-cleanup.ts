/**
 * Shared database cleanup helper for Vitest tests.
 *
 * Deletes records in dependency-aware order so that RESTRICT foreign-key
 * constraints are never violated.  Every leaf table is cleared before its
 * parent.
 *
 * Dependency order (child → parent):
 *
 *  Notifications
 *  ApplicationStatusHistory
 *  AssessmentResponse
 *  Assessment
 *  StudentLearningResource
 *  StudentSkill
 *  LearningResourceSkill
 *  OpportunitySkill
 *  Collaborations          (references User + Organization + Document)
 *  ApplicationStatusHistory (already above, idempotent)
 *  Applications            (references Opportunity + User + Document)
 *  PortfolioItem           (references User + Document)
 *  Document                (references User)
 *  LearningResource        (references Organization)
 *  Opportunity             (references Organization)
 *  AcademicProfile / StudentProfile (reference User)
 *  User
 *  Organization
 *  SkillTaxonomy
 */

import { prisma } from '../config/database';

export async function cleanupAll(): Promise<void> {
  // 1. Leaf-level join/history tables
  await prisma.notification.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();

  // 2. Student-level associations
  await prisma.studentLearningResource.deleteMany();
  await prisma.studentSkill.deleteMany();

  // 3. Resource skill mappings
  await prisma.learningResourceSkill.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.demandSignalSkill.deleteMany();
  await prisma.demandSignal.deleteMany();

  // 4. Collaboration (references User + Organization)
  await prisma.collaboration.deleteMany();

  // 5. Applications (references Opportunity + User + Document)
  await prisma.application.deleteMany();

  // 6. Portfolio items (references User + Document)
  await prisma.portfolioItem.deleteMany();

  // 7. Documents (references User)
  await prisma.document.deleteMany();

  // 8. Learning resources and Opportunities (reference Organization)
  await prisma.learningResource.deleteMany();
  await prisma.programRegistration.deleteMany();
  await prisma.program.deleteMany();
  await prisma.mentorship.deleteMany();
  await prisma.mentorshipProgram.deleteMany();
  await prisma.opportunity.deleteMany();

  // 9. Profiles (reference User via 1-1 unique)
  await prisma.academicProfile.deleteMany();
  await prisma.studentProfile.deleteMany();

  // 10. Users and Organizations
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 11. Taxonomy (referenced by skills / opportunity skills — already cleared above)
  await prisma.skillTaxonomy.deleteMany();

  // 12. Audit logs
  await prisma.auditLog.deleteMany();
}

/**
 * Targeted cleanup for a specific set of user IDs.
 * Deletes only records owned by / belonging to those users, then the users,
 * still in dependency order.
 */
export async function cleanupUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;

  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.applicationStatusHistory.deleteMany({
    where: { application: { studentId: { in: userIds } } }
  });
  await prisma.assessmentResponse.deleteMany({
    where: { attempt: { studentId: { in: userIds } } }
  });
  await prisma.assessmentAttempt.deleteMany({ where: { studentId: { in: userIds } } });
  await prisma.collaboration.deleteMany({ where: { academicianId: { in: userIds } } });
  await prisma.application.deleteMany({ where: { studentId: { in: userIds } } });
  await prisma.portfolioItem.deleteMany({ where: { studentId: { in: userIds } } });
  await prisma.document.deleteMany({ where: { ownerId: { in: userIds } } });
  await prisma.studentSkill.deleteMany({
    where: { studentProfile: { userId: { in: userIds } } }
  });
  await prisma.studentLearningResource.deleteMany({
    where: { studentProfile: { userId: { in: userIds } } }
  });
  await prisma.academicProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.studentProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
