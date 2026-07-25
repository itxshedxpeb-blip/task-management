/**
 * Idempotent system bootstrap for one organization:
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
  organizationId: string,
  createdById?: string | null,
) {
  for (const role of SYSTEM_ROLE_DEFS) {
    const existing = await db.role.findFirst({
      where: { organizationId, name: role.name },
    });
    if (existing) {
      await db.role.update({
        where: { id: existing.id },
        data: { permissions: [...role.permissions], isSystem: true },
      });
    } else {
      await db.role.create({
        data: {
          organizationId,
          name: role.name,
          permissions: [...role.permissions],
          isSystem: true,
          createdById: createdById || undefined,
        },
      });
    }
  }
}

export async function replacePipelines(_db: Tx, _organizationId: string) {
  return 0;
}

export async function replaceEventRules(_db: Tx, _organizationId: string) {
  return 0;
}

export async function bootstrapOrganizationSystem(
  db: Tx,
  organizationId: string,
  createdById?: string | null,
) {
  await upsertSystemRoles(db, organizationId, createdById);
  return { pipelineCount: 0, ruleCount: 0 };
}
