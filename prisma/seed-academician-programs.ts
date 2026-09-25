import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAcademicianPrograms() {
  console.log('🌱 Seeding Academician specific data...');

  const academicians = await prisma.user.findMany({ where: { role: 'ACADEMICIAN' } });
  const org = await prisma.organization.findFirst({ where: { type: 'INDUSTRY' } });
  const skill = await prisma.skillTaxonomy.findFirst({ where: { name: 'Python' } });
  
  if (academicians.length === 0 || !org || !skill) {
    console.error("Missing required base data. Run main seed first.");
    return;
  }

  let university = await prisma.organization.findFirst({ where: { name: 'Stanford University (Demo)' } });
  
  if (!university) {
    university = await prisma.organization.create({
      data: {
        name: 'Stanford University (Demo)',
        domain: 'stanford.edu',
        type: 'INSTITUTION',
        isVerified: true
      }
    });
  }

  for (const academician of academicians) {
    // Update academician to belong to this university
    await prisma.user.update({
      where: { id: academician.id },
      data: { organizationId: university.id }
    });

    // 1. Seed a Program created by Academician
    const existingProgram = await prisma.program.findFirst({
      where: { organizerId: academician.id, title: 'Advanced Web Development Bootcamp' }
    });

  if (!existingProgram) {
    console.log('Seeding Academician Program...');
    const newProg = await prisma.program.create({
      data: {
        title: 'Advanced Web Development Bootcamp',
        description: 'A comprehensive 2-week bootcamp for final year students covering modern web frameworks.',
        type: 'WORKSHOP',
        mode: 'HYBRID',
        status: 'PUBLISHED',
        capacity: 50,
        organizerId: academician.id,
        organizationId: university.id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      }
    });

    await prisma.programSkill.create({
      data: {
        programId: newProg.id,
        skillId: skill.id,
        requiredProficiency: 3
      }
    });
  }

  // Ensure there's a PROPOSED and an ACTIVE collaboration
  const activeCollab = await prisma.collaboration.findFirst({
    where: { academicianId: academician.id, status: 'ACTIVE' }
  });

  if (!activeCollab) {
    console.log('Seeding ACTIVE Collaboration...');
    await prisma.collaboration.create({
      data: {
        academicianId: academician.id,
        industryId: org.id,
        title: 'Joint AI Curriculum Review',
        description: 'Collaborative review of the new Artificial Intelligence curriculum.',
        type: 'RESEARCH_COLLABORATION',
        status: 'ACTIVE'
      }
    });
  }

  } // end of for loop
}

seedAcademicianPrograms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
