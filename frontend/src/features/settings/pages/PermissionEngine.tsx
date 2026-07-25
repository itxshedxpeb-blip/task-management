'use client';

import { useState } from 'react';
import { useRoles, useUpdateRole } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, X, Lock } from 'lucide-react';
import type { Role } from '../types';

const MODULES = {
  settings: { name: 'Settings', permissions: ['SETTINGS_VIEW', 'SETTINGS_EDIT', 'SETTINGS_MANAGE_USERS', 'SETTINGS_MANAGE_ROLES'] },
  'task-management': { name: 'Task Management', permissions: ['TASK_VIEW', 'TASK_CREATE', 'TASK_EDIT', 'TASK_DELETE'] },
};

export function PermissionEngine() {
  const { data: roles, isLoading } = useRoles();
  const updateRole = useUpdateRole();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleTogglePermission = (role: Role, permission: string) => {
    const currentPermissions = (role.permissions as unknown as string[]) || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    updateRole.mutate({
      id: role.id,
      data: { permissions: newPermissions as any },
    });
  };

  const handleToggleModule = (role: Role, modulePermissions: string[]) => {
    const currentPermissions = (role.permissions as unknown as string[]) || [];
    const hasAllPermissions = modulePermissions.every(p => currentPermissions.includes(p));
    const newPermissions = hasAllPermissions
      ? currentPermissions.filter(p => !modulePermissions.includes(p))
      : [...new Set([...currentPermissions, ...modulePermissions])];

    updateRole.mutate({
      id: role.id,
      data: { permissions: newPermissions as any },
    });
  };

  const safeRoles = (roles as Role[] | undefined) || [];

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Permission Engine</h2>
          <Badge variant="outline" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            Enterprise RBAC
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Role-Based Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Configure granular permissions for each role. Permissions control what users can view, create, edit, delete, and export across all modules.
              System roles (Owner, Admin) have all permissions by default.
            </p>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {safeRoles.map((role, index) => (
                <Button
                  key={`${role.id}-${index}`}
                  variant={selectedRole?.id === role.id ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(role)}
                  disabled={role.isSystem}
                >
                  {role.isSystem && <Lock className="h-4 w-4 mr-2" />}
                  {role.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        {selectedRole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Permissions for {selectedRole.name}
                {selectedRole.isSystem && <Badge variant="destructive" className="ml-2">System Role</Badge>}
              </h3>
              <div className="text-sm text-muted-foreground">
                {selectedRole.permissions?.length || 0} permissions assigned
              </div>
            </div>

            {Object.entries(MODULES).map(([moduleKey, module]) => (
              <Card key={moduleKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleModule(selectedRole, module.permissions)}
                      disabled={selectedRole.isSystem}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Toggle All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {module.permissions.map((permission, index) => {
                      const hasPermission = (selectedRole.permissions as unknown as string[])?.includes(permission);
                      return (
                        <button
                          key={`${permission}-${index}`}
                          onClick={() => handleTogglePermission(selectedRole, permission)}
                          disabled={selectedRole.isSystem}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            hasPermission
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-50 text-gray-500'
                          } ${selectedRole.isSystem ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {hasPermission ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                            <span className="text-xs font-medium">{permission.replace(/_/g, ' ')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!selectedRole && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a role to view and configure its permissions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </SettingsLayout>
  );
}
