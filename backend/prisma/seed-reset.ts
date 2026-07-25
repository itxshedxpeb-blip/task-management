/**
 * Reset database to a clean testing state for existing modules.
 *
 * Removes: tasks, notifications, labels, templates, automations,
 * departments, teams, OTP challenges, refresh tokens, sessions.
 * Keeps: organizations, users, then re-applies system roles / pipelines / event rules.
 *
 * Usage: npm run seed:reset
 */
import { PrismaClient } from '@prisma/client';
import { bootstrapOrganizationSystem } from '../src/common/system-bootstrap';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting transactional data (keeping orgs + users)...');

  // Order: dependents first
  await prisma.notification.deleteMany({});
  await prisma.activityFeed.deleteMany({});
  await prisma.otpChallenge.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.session.deleteMany({});

  // Task children
  await prisma.taskLabel.deleteMany({});
  await prisma.taskWatcher.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.taskTemplate.deleteMany({});

  await prisma.task.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.automationRule.deleteMany({});
  await prisma.savedFilter.deleteMany({});
  await prisma.customView.deleteMany({});

  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.departmentMember.deleteMany({});
  await prisma.department.deleteMany({});

  await prisma.auditLog.deleteMany({});

  console.log('✓ Cleared transactional data');

  const orgs = await prisma.organization.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
  });

  for (const org of orgs) {
    const owner = await prisma.user.findFirst({
      where: { organizationId: org.id, role: 'OWNER' },
      select: { id: true },
    });
    const result = await bootstrapOrganizationSystem(prisma, org.id, owner?.id);
    console.log(`✓ Rebuilt system config for ${org.name} (pipelines=${result.pipelineCount}, rules=${result.ruleCount})`);
  }

  console.log('\n✅ Database reset to clean testing state (system seed only).');
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
