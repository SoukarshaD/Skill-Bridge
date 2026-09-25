const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log("Running API validation script...");
  
  // 1. Get a test Academician
  const academician = await prisma.user.findFirst({
    where: { role: 'ACADEMICIAN' }
  });
  
  // 2. Get a test Industry
  const industryUser = await prisma.user.findFirst({
    where: { role: 'INDUSTRY' },
    include: { organization: true }
  });
  
  const organization = industryUser?.organization;

  console.log("Academician:", academician?.email);
  console.log("Industry:", organization?.name);

  // 3. Directly create a collaboration to verify schema accepts it
  if (academician && organization) {
    const collab = await prisma.collaboration.create({
      data: {
        academicianId: academician.id,
        industryId: organization.id,
        title: "AI Test Proposal",
        description: "Test description",
        type: "RESEARCH_COLLABORATION",
        expertise: ["AI"],
        status: "PROPOSED"
      }
    });
    console.log("Successfully created Collaboration ID:", collab.id);
    
    // Update status to ACCEPTED
    const updated = await prisma.collaboration.update({
      where: { id: collab.id },
      data: { status: "ACCEPTED" }
    });
    console.log("Successfully updated Collaboration Status to:", updated.status);
    
    // Cleanup
    await prisma.collaboration.delete({ where: { id: collab.id } });
    console.log("Cleaned up test collaboration.");
  }
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
