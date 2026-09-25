import { PrismaClient, DemandSourceType, ValidationRelevance, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPortals() {
  console.log('🌱 Seeding specific portal data...');

  // Get necessary users and organizations
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const academician = await prisma.user.findFirst({ where: { role: 'ACADEMICIAN' } });
  const industry = await prisma.user.findFirst({ where: { role: 'INDUSTRY' } });
  const org = await prisma.organization.findFirst({ where: { type: 'INDUSTRY' } });
  const program = await prisma.program.findFirst();
  const assessment = await prisma.assessment.findFirst();
  const opportunity = await prisma.opportunity.findFirst({ where: { type: 'INTERNSHIP' } });
  const skill = await prisma.skillTaxonomy.findFirst({ where: { name: 'Python' } });

  if (!skill) {
    console.error("No skills found. Run main seed first.");
    return;
  }

  // 1. Govt / Admin Portal Data: DemandSignals
  const existingSignal = await prisma.demandSignal.findFirst({ where: { title: 'Q3 Tech Industry Demand' } });
  if (!existingSignal && org) {
    console.log('Seeding DemandSignal...');
    const signal = await prisma.demandSignal.create({
      data: {
        sourceType: 'JOB_POSTING',
        title: 'Q3 Tech Industry Demand',
        description: 'Aggregated demand for tech skills in the region',
        observedAt: new Date(),
        location: 'National',
        organizationId: org.id,
        status: 'PROCESSED',
      }
    });

    await prisma.demandSignalSkill.create({
      data: {
        demandSignalId: signal.id,
        rawSkillName: 'Python Programming',
        skillId: skill.id,
        requiredProficiency: 4,
        confidence: 0.95
      }
    });
  }

  // 2. Industry Portal Data: EmployerValidation
  if (industry && org && program && skill) {
    const existingValidation = await prisma.employerValidation.findFirst({ where: { userId: industry.id, programId: program.id } });
    if (!existingValidation) {
      console.log('Seeding EmployerValidation...');
      await prisma.employerValidation.create({
        data: {
          organizationId: org.id,
          userId: industry.id,
          programId: program.id,
          skillId: skill.id,
          relevance: 'RELEVANT',
          comments: 'Highly relevant for our current hiring pipeline.',
        }
      });
    }

    // Also create a sample Program for the Industry itself so their "Programs" page isn't empty
    const existingIndustryProgram = await prisma.program.findFirst({ where: { organizationId: org.id } });
    if (!existingIndustryProgram) {
      console.log('Seeding Industry Program...');
      await prisma.program.create({
        data: {
          organizationId: org.id,
          organizerId: industry.id,
          title: 'Google Cloud Certification Prep',
          description: 'Official industrial training program for students to get certified in GCP.',
          type: 'INDUSTRIAL_TRAINING',
          status: 'PUBLISHED',
          capacity: 100,
          mode: 'ONLINE',
        }
      });
    }
  }

  // 3. Training Provider Portal Data: Collaboration
  if (academician && org) {
    const existingCollab = await prisma.collaboration.findFirst({ where: { academicianId: academician.id, industryId: org.id } });
    if (!existingCollab) {
      console.log('Seeding Collaboration...');
      await prisma.collaboration.create({
        data: {
          academicianId: academician.id,
          industryId: org.id,
          title: 'Curriculum Alignment for Cloud Computing',
          description: 'Joint effort to align syllabus with industry standards.',
          type: 'RESEARCH_COLLABORATION',
          status: 'ACTIVE'
        }
      });
    }

    const proposedCollab = await prisma.collaboration.findFirst({ where: { title: 'Proposal: Web3 Integration in CS Curriculum' } });
    if (!proposedCollab) {
      console.log('Seeding Proposed Collaboration...');
      await prisma.collaboration.create({
        data: {
          academicianId: academician.id,
          industryId: org.id,
          title: 'Proposal: Web3 Integration in CS Curriculum',
          description: 'Reviewing feasibility of adding blockchain modules.',
          type: 'RESEARCH_COLLABORATION',
          status: 'PROPOSED'
        }
      });
    }
  }

  // 4. Trainee Portal Data: AssessmentAttempt & ProjectWorkspace
  if (student) {
    if (assessment) {
      const existingAttempt = await prisma.assessmentAttempt.findFirst({ where: { studentId: student.id, assessmentId: assessment.id } });
      if (!existingAttempt) {
        console.log('Seeding AssessmentAttempt...');
        await prisma.assessmentAttempt.create({
          data: {
            assessmentId: assessment.id,
            studentId: student.id,
            score: 85,
            maxScore: 100,
            percentage: 85,
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - 3600000),
            submittedAt: new Date()
          }
        });
      }
    }

    if (opportunity && org) {
      const existingWorkspace = await prisma.projectWorkspace.findFirst({ where: { studentId: student.id, opportunityId: opportunity.id } });
      if (!existingWorkspace) {
        console.log('Seeding ProjectWorkspace...');
        // Need to create an application first
        let application = await prisma.application.findFirst({
          where: { opportunityId: opportunity.id, studentId: student.id }
        });
        
        if (!application) {
          application = await prisma.application.create({
            data: {
              opportunityId: opportunity.id,
              studentId: student.id,
              status: 'ACCEPTED'
            }
          });
        }

        await prisma.projectWorkspace.create({
          data: {
            applicationId: application.id,
            studentId: student.id,
            organizationId: org.id,
            opportunityId: opportunity.id,
            status: 'ACTIVE',
            startDate: new Date(),
          }
        });
      }
    }
  }

  console.log('✅ Portal specific sample data seeded.');
}

seedPortals()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
