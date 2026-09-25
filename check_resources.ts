import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.learningResource.count();
  console.log('Total LearningResources:', count);
  if (count > 0) {
    const resources = await prisma.learningResource.findMany({ take: 5 });
    console.log(resources);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
