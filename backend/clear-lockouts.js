const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.loginAttempt.deleteMany();
  await p.user.updateMany({ data: { failedLoginAttempts: 0, isLocked: false, lockedUntil: null } });
  console.log('Lockouts cleared, users unlocked');
  await p.$disconnect();
})();
