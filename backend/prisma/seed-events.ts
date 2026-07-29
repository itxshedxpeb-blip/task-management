/**
 * Event rules seed — EventRule model removed from schema.
 * This file is a no-op placeholder.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠ Event rules seed skipped — EventRule model removed from schema.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
