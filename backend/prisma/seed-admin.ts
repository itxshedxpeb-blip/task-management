/**
 * Seed Super Admin user and system organization.
 * Idempotent — safe to run multiple times.
 *
 * Usage: npx ts-node prisma/seed-admin.ts
 */
import { PrismaClient, UserType, UserRole, OrganizationType, OrganizationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding super admin...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`✓ Super admin already exists (${ADMIN_EMAIL}), skipping.`);
    return;
  }

  // Create system organization (optional, for SUPER_ADMIN context)
  const systemOrg = await prisma.organization.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'System',
      slug: 'system',
      email: ADMIN_EMAIL,
      status: OrganizationStatus.Active,
      organizationType: 'SYSTEM' as any,
      maxUsers: 9999,
      subscriptionTier: 'enterprise',
    },
  });

  // Create super admin user
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Super Admin',
      userType: UserType.SYSTEM_ADMIN,
      role: UserRole.SUPER_ADMIN,
      organizationType: OrganizationType.SYSTEM,
      isActive: true,
      isVerified: true,
      organizationId: systemOrg.id,
    },
  });

  console.log(`✓ Super admin created: ${admin.email} (${admin.userType} / ${admin.role})`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log(`  Organization: ${systemOrg.name} (${systemOrg.id})`);
}

main()
  .then(() => {
    console.log('\nAdmin seed complete.');
  })
  .catch((e) => {
    console.error('Admin seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
