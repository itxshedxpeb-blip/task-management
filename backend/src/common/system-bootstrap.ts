/**
 * Idempotent system bootstrap:
 * roles, status pipelines, event rules.
 */
import { PrismaClient } from '@prisma/client';
import { SYSTEM_ROLE_DEFS } from './system-seed.constants';

type Tx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends' | '$use'
>;

export async function upsertSystemRoles(
  db: Tx,
  createdById?: string | null,
) {
  for (const role of SYSTEM_ROLE_DEFS) {
    const existing = await db.role.findFirst({
      where: { name: role.name },
    });
    if (existing) {
      await db.role.update({
        where: { id: existing.id },
        data: { permissions: [...role.permissions], isSystem: true },
      });
    } else {
      await db.role.create({
        data: {
          name: role.name,
          permissions: [...role.permissions],
          isSystem: true,
          createdById: createdById || undefined,
        },
      });
    }
  }
}

export async function bootstrapSystem(db: Tx, createdById?: string | null) {
  await upsertSystemRoles(db, createdById);
}
