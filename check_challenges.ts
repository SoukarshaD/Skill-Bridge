import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const challenge = await prisma.opportunity.findFirst({
    where: { type: 'INNOVATION_CHALLENGE' },
    include: { requiredSkills: true, organization: true }
  });

  if (challenge) {
    console.log("CHALLENGE FOUND:");
    console.log(`Title: ${challenge.title}`);
    console.log(`Organization: ${challenge.organization?.name}`);
    console.log(`Skills: ${challenge.requiredSkills.length}`);
  } else {
    console.log("NO CHALLENGE FOUND");
  }

  const liveProject = await prisma.opportunity.findFirst({
    where: { type: 'LIVE_PROJECT' },
    include: { requiredSkills: true, organization: true }
  });

  if (liveProject) {
    console.log("LIVE PROJECT FOUND:");
    console.log(`Title: ${liveProject.title}`);
    console.log(`Organization: ${liveProject.organization?.name}`);
    console.log(`Skills: ${liveProject.requiredSkills.length}`);
  } else {
    console.log("NO LIVE PROJECT FOUND");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
