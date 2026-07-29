/**
 * Fresh-install system seed.
 * Ensures system roles exist.
 *
 * Usage: npm run seed:system
 */
import { PrismaClient } from '@prisma/client';
import { bootstrapSystem } from '../src/common/system-bootstrap';

const prisma = new PrismaClient();

async function main() {
  const result = await bootstrapSystem(prisma);
  console.log(`✓ System seed complete: roles upserted`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
