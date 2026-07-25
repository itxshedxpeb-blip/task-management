'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Shield,
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/core/api';

const ALL_PERMISSIONS = [
  { resource: 'Tasks', permissions: ['tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete', 'tasks.assign'] },
  { resource: 'Projects', permissions: ['projects.create', 'projects.read', 'projects.update', 'projects.delete'] },
  { resource: 'Reports', permissions: ['reports.view', 'reports.export', 'reports.create'] },
  { resource: 'People', permissions: ['people.view', 'people.invite', 'people.remove'] },
  { resource: 'Departments', permissions: ['departments.create', 'departments.read', 'departments.update', 'departments.delete'] },
  { resource: 'Settings', permissions: ['settings.company', 'settings.users', 'settings.roles', 'settings.labels'] },
];

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

export default function RoleSettingsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [editForm, setEditForm] = useState({ name: '', description: '', permissions: [] as string[] });

  const { data: rolesData, isLoading, error, refetch } = useQuery({
    queryKey: ['org-roles'],
    queryFn: () => api.get('/organization/roles'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/organization/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-roles'] });
      setCreateOpen(false);
      setCreateForm({ name: '', description: '', permissions: [] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/organization/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-roles'] });
      setEditRole(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/organization/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-roles'] });
      setDeleteRole(null);
    },
  });

  const rolesDataResolved = rolesData as any;
  const rolesList = Array.isArray(rolesDataResolved?.data) ? rolesDataResolved.data : Array.isArray(rolesDataResolved) ? rolesDataResolved : [];

  const togglePermission = (perm: string, form: 'create' | 'edit') => {
    if (form === 'create') {
      setCreateForm((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(perm)
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(perm)
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      }));
    }
  };

  const PermissionGrid = ({ permissions, onToggle }: { permissions: string[]; onToggle: (perm: string) => void }) => (
    <div className="space-y-4">
      {ALL_PERMISSIONS.map((group) => (
        <div key={group.resource}>
          <p className="text-sm font-medium text-foreground mb-2">{group.resource}</p>
          <div className="grid grid-cols-2 gap-2">
            {group.permissions.map((perm) => (
              <button
                key={perm}
                type="button"
                onClick={() => onToggle(perm)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  permissions.includes(perm)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {permissions.includes(perm) ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <X className="h-3.5 w-3.5 opacity-40" />
                )}
                <span className="truncate">{perm.split('.').pop()}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load roles.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Role Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define roles and access levels for your team members.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {rolesList.length === 0 ? (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="py-16 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No custom roles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom roles to define granular access levels.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesList.map((role: Role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{role.name}</p>
                          {role.isSystem && <Badge variant="secondary" className="text-[10px] mt-0.5">System</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {role.description || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{role.userCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.permissions?.length ?? 0} permissions</Badge>
                    </TableCell>
                    <TableCell>
                      {!role.isSystem && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditRole(role);
                                setEditForm({ name: role.name, description: role.description, permissions: role.permissions || [] });
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteRole(role)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>Define a new role with specific permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Project Manager"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Textarea
                id="role-desc"
                placeholder="Brief description of this role..."
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-3 block">Permissions</Label>
              <PermissionGrid permissions={createForm.permissions} onToggle={(p) => togglePermission(p, 'create')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.name || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRole} onOpenChange={() => setEditRole(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-desc">Description</Label>
              <Textarea
                id="edit-role-desc"
                rows={2}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-3 block">Permissions</Label>
              <PermissionGrid permissions={editForm.permissions} onToggle={(p) => togglePermission(p, 'edit')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
            <Button
              onClick={() => editRole && updateMutation.mutate({ id: editRole.id, data: editForm })}
              disabled={!editForm.name || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteRole?.name}</strong>? Users assigned to this
              role will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRole(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteRole && deleteMutation.mutate(deleteRole.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
