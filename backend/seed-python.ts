import { prisma } from './src/config/database';
async function run() {
  await prisma.skillTaxonomy.create({
    data: {
      name: 'Python',
      normalizedName: 'python',
      category: 'Backend',
      domain: 'IT',
    }
  });
  console.log('Python skill created');
}
run().finally(() => prisma.$disconnect());
