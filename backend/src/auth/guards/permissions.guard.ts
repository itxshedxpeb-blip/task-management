import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const ROLE_NAME_ALIASES: Record<string, string[]> = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'Super Admin', 'SuperAdmin'],
  ADMIN: ['ADMIN', 'Admin'],
  MANAGER: ['MANAGER', 'Manager'],
  EMPLOYEE: ['EMPLOYEE', 'Employee'],
};

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [
    'task:list', 'task:read', 'task:create', 'task:update', 'task:delete', 'task:approve',
    'user:list', 'user:read', 'user:create', 'user:update', 'user:delete',
    'role:list', 'role:read', 'role:create', 'role:update',
    'department:list', 'department:create', 'department:update', 'department:delete',
    'label:list', 'label:create', 'label:update', 'label:delete',
    'template:list', 'template:create', 'template:update', 'template:delete',
    'automation:list', 'automation:create', 'automation:update', 'automation:delete',
    'report:view', 'report:export',
    'salary:read', 'salary:create', 'salary:update', 'salary:delete', 'salary:approve',
    'tracking:read', 'tracking:update',
    'settings:read', 'settings:update',
    'auth:read', 'auth:update',
    'note:list', 'note:create', 'note:update', 'note:delete',
  ],
  MANAGER: [
    'task:list', 'task:read', 'task:create', 'task:update', 'task:approve',
    'user:list', 'user:read',
    'department:list', 'label:list', 'template:list',
    'report:view', 'salary:read',
    'tracking:read', 'tracking:update',
    'settings:read', 'auth:read',
    'note:list', 'note:create', 'note:update',
  ],
  EMPLOYEE: [
    'task:list', 'task:read', 'task:create', 'task:update',
    'label:list', 'template:list',
    'settings:read', 'auth:read', 'salary:read',
    'note:list', 'note:create', 'note:update',
  ],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userRecord = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    if (!userRecord) {
      throw new ForbiddenException('User not found');
    }

    const roleNames = ROLE_NAME_ALIASES[userRecord.role] || [userRecord.role];

    const roles = await this.prisma.role.findMany({
      where: {
        name: { in: roleNames },
      },
    });

    const userPermissions = roles.flatMap((r) => r.permissions);
    const effectivePermissions =
      userPermissions.length > 0 ? userPermissions : DEFAULT_PERMISSIONS[userRecord.role] || [];

    if (effectivePermissions.includes('*')) {
      return true;
    }

    const hasAllRequired = requiredPermissions.every((perm) => effectivePermissions.includes(perm));

    if (!hasAllRequired) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
