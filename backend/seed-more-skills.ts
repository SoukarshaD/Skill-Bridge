import { prisma } from './src/config/database';
async function run() {
  await prisma.skillTaxonomy.createMany({
    data: [
      { name: 'SQL', normalizedName: 'sql', category: 'Database', domain: 'IT' },
      { name: 'JavaScript', normalizedName: 'javascript', category: 'Frontend', domain: 'IT' }
    ]
  });
  console.log('Seeded SQL and JS');
}
run().finally(() => prisma.$disconnect());
