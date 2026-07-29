/**
 * Seed Super Admin user.
 * Idempotent — safe to run multiple times.
 *
 * Usage: npx ts-node prisma/seed-admin.ts
 */
import { PrismaClient, UserType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding super admin...');

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`✓ Super admin already exists (${ADMIN_EMAIL}), skipping.`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: 'Super Admin',
      userType: UserType.SUPER_ADMIN,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  console.log(`✓ Super admin created: ${admin.email} (${admin.userType} / ${admin.role})`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
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
