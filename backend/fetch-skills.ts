import { prisma } from './src/config/database';
async function run() {
  const skills = await prisma.skillTaxonomy.findMany();
  console.log(JSON.stringify(skills, null, 2));
}
run().finally(() => prisma.$disconnect());
