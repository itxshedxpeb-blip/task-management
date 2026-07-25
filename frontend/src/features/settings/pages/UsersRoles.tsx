'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Shield, Key, Lock, Unlock, Mail, Phone } from 'lucide-react';
import type { User, Role } from '../types';
import { Column } from '@/components/data-table/DataTable';

export function UsersRoles() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  
  const [activeTab, setActiveTab] = useState('users');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({});
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({});

  const userColumns: Column<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile', label: 'Mobile', sortable: true },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'isLocked',
      label: 'Locked',
      render: (value: boolean) => value ? <Lock className="h-4 w-4 text-red-500" /> : '-',
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value: Date) => value ? new Date(value).toLocaleDateString() : 'Never',
    },
  ];

  const roleColumns: Column<Role>[] = [
    { key: 'name', label: 'Role Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 3).map((perm, index) => (
            <span key={`${perm}-${index}`} className="px-2 py-1 rounded text-xs bg-gray-100">
              {perm}
            </span>
          ))}
          {value.length > 3 && (
            <span className="px-2 py-1 rounded text-xs bg-gray-200">
              +{value.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'userCount',
      label: 'Users',
      render: (value: number) => value || 0,
    },
    {
      key: 'isSystem',
      label: 'System',
      render: (value: boolean) => value ? <Shield className="h-4 w-4 text-blue-500" /> : '-',
    },
  ];

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ isActive: true, isLocked: false });
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      deleteUser.mutate(user.id);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleFormData({ permissions: [], isSystem: false });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleFormData(role);
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      alert('System roles cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete ${role.name}?`)) {
      deleteRole.mutate(role.id);
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, data: userFormData });
    } else {
      createUser.mutate(userFormData as Omit<User, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsUserDialogOpen(false);
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, data: roleFormData });
    } else {
      createRole.mutate(roleFormData as Omit<Role, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsRoleDialogOpen(false);
  };

  const userRowActions = (user: User) => (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const roleRowActions = (role: Role) => (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => handleEditRole(role)} disabled={role.isSystem}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDeleteRole(role)} disabled={role.isSystem}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-semibold">User Management</h2>
              <Button onClick={handleCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <DataTable
              data={(users as User[]) || []}
              columns={userColumns}
              loading={usersLoading}
              rowActions={userRowActions}
              emptyMessage="No users found"
            />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-semibold">Role Management</h2>
              <Button onClick={handleCreateRole}>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </div>

            <DataTable
              data={(roles as Role[]) || []}
              columns={roleColumns}
              loading={rolesLoading}
              rowActions={roleRowActions}
              emptyMessage="No roles found"
            />
          </TabsContent>
        </Tabs>

        {/* User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUserSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={userFormData.name || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userFormData.email || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      value={userFormData.mobile || ''}
                      onChange={(e) => setUserFormData({ ...userFormData, mobile: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={userFormData.role || ''}
                      onValueChange={(value) => setUserFormData({ ...userFormData, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map((role, index) => (
                          <SelectItem key={`${role.id}-${index}`} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userFormData.isActive !== false}
                      onChange={(e) => setUserFormData({ ...userFormData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isLocked"
                      checked={userFormData.isLocked || false}
                      onChange={(e) => setUserFormData({ ...userFormData, isLocked: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isLocked">Locked</Label>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRoleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={roleFormData.name || ''}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={roleFormData.description || ''}
                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                    {['TASK_VIEW', 'TASK_CREATE', 'TASK_EDIT', 'TASK_DELETE',
                      'SETTINGS_VIEW', 'SETTINGS_EDIT'].map((perm, index) => (
                      <div key={`${perm}-${index}`} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={perm}
                          checked={roleFormData.permissions?.includes(perm as any) || false}
                          onChange={(e) => {
                            const perms = roleFormData.permissions || [];
                            if (e.target.checked) {
                              setRoleFormData({ ...roleFormData, permissions: [...perms, perm as any] });
                            } else {
                              setRoleFormData({ ...roleFormData, permissions: perms.filter(p => p !== perm as any) });
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={perm} className="text-sm">{perm}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRole.isPending || updateRole.isPending}>
                  {editingRole ? 'Update' : 'Create'} Role
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
}
