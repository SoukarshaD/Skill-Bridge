import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLMI() {
  console.log('🌱 Seeding LMI / District Intelligence data...');

  const org = await prisma.organization.findFirst({ where: { type: 'INDUSTRY' } });
  
  const skillPython = await prisma.skillTaxonomy.findFirst({ where: { name: 'Python' } });
  const skillReact = await prisma.skillTaxonomy.findFirst({ where: { name: 'React' } });
  const skillAWS = await prisma.skillTaxonomy.findFirst({ where: { name: 'AWS' } });
  const skillSQL = await prisma.skillTaxonomy.findFirst({ where: { name: 'SQL' } });

  if (!skillPython || !skillReact || !skillAWS || !org) {
    console.error("Missing required base data. Run main seed first.");
    return;
  }

  // Define some mock districts
  const districts = ['Bengaluru', 'Pune', 'Hyderabad'];

  for (const district of districts) {
    const existing = await prisma.demandSignal.findFirst({ 
      where: { title: `Aggregated Demand - ${district} Q4` } 
    });

    if (!existing) {
      console.log(`Seeding LMI for ${district}...`);
      
      // Seed 1: Job Postings Aggregation (High Demand)
      const signal1 = await prisma.demandSignal.create({
        data: {
          sourceType: 'JOB_POSTING',
          title: `Aggregated Demand - ${district} Q4`,
          description: `Analysis of 5,000+ job postings in ${district} region`,
          observedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          location: district,
          normalizedLocation: district.toLowerCase(),
          organizationId: org.id,
          status: 'PROCESSED',
          confidence: 0.95
        }
      });

      await prisma.demandSignalSkill.createMany({
        data: [
          { demandSignalId: signal1.id, rawSkillName: 'Python', skillId: skillPython.id, requiredProficiency: 3 },
          { demandSignalId: signal1.id, rawSkillName: 'Amazon Web Services', skillId: skillAWS.id, requiredProficiency: 4 },
          { demandSignalId: signal1.id, rawSkillName: 'SQL Database', skillId: skillSQL?.id || skillPython.id, requiredProficiency: 3 },
        ]
      });

      // Seed 2: Employer Survey (Specific Needs)
      const signal2 = await prisma.demandSignal.create({
        data: {
          sourceType: 'EMPLOYER_SURVEY',
          title: `Top Tech Employers Survey - ${district}`,
          description: `Direct survey feedback from top 50 tech employers in ${district}`,
          observedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          location: district,
          normalizedLocation: district.toLowerCase(),
          organizationId: org.id,
          status: 'PROCESSED',
          confidence: 0.88
        }
      });

      await prisma.demandSignalSkill.createMany({
        data: [
          { demandSignalId: signal2.id, rawSkillName: 'React.js', skillId: skillReact.id, requiredProficiency: 4 },
          { demandSignalId: signal2.id, rawSkillName: 'Python Backend', skillId: skillPython.id, requiredProficiency: 4 },
        ]
      });
      
      // Update the previous dummy "National" one if it exists to be normalized to a district so it shows up.
      await prisma.demandSignal.updateMany({
        where: { location: 'National', normalizedLocation: null },
        data: { normalizedLocation: 'bengaluru' }
      });
    }
  }

  console.log('✅ LMI / District Intelligence sample data seeded.');
}

seedLMI()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
