/**
 * Reset database to a clean testing state for existing modules.
 *
 * Removes: tasks, notifications, labels, templates, automations,
 * departments, refresh tokens, sessions.
 * Keeps: users.
 *
 * Usage: npm run seed:reset
 */
import { PrismaClient } from '../src/prisma/client';
import { bootstrapSystem } from '../src/common/system-bootstrap';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting transactional data (keeping users)...');

  await prisma.notification.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.session.deleteMany({});

  await prisma.taskLabel.deleteMany({});
  await prisma.taskWatcher.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.taskTemplate.deleteMany({});

  await prisma.task.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.automationRule.deleteMany({});

  await prisma.departmentMember.deleteMany({});
  await prisma.department.deleteMany({});

  await prisma.auditLog.deleteMany({});

  console.log('✓ Cleared transactional data');

  const result = await bootstrapSystem(prisma);
  console.log(`✓ Rebuilt system roles`);

  console.log('\n✅ Database reset to clean testing state (system seed only).');
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
