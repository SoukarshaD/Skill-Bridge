import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function killStuck() {
  console.log("Checking for stuck transactions...");
  const locks = await prisma.$queryRawUnsafe(`
    SELECT pid, state, query 
    FROM pg_stat_activity 
    WHERE state = 'active' OR state LIKE 'idle in transaction%';
  `);
  console.log("Active/Idle transactions:", locks);
  
  console.log("Terminating stuck transactions...");
  await prisma.$executeRawUnsafe(`
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE state LIKE 'idle in transaction%' 
    AND pid <> pg_backend_pid();
  `);
  console.log("Done.");
}

killStuck().catch(console.error).finally(() => prisma.$disconnect());
