'use client';

import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import {
  Shield,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/core/api';

const PERMISSION_GROUPS = [
  {
    resource: 'Tasks',
    permissions: [
      { key: 'tasks.create', label: 'Create Tasks', description: 'Create new tasks in the workspace' },
      { key: 'tasks.read', label: 'View Tasks', description: 'View task details and lists' },
      { key: 'tasks.update', label: 'Edit Tasks', description: 'Modify task details, status, and assignments' },
      { key: 'tasks.delete', label: 'Delete Tasks', description: 'Permanently remove tasks' },
      { key: 'tasks.assign', label: 'Assign Tasks', description: 'Assign tasks to team members' },
    ],
  },
  {
    resource: 'Projects',
    permissions: [
      { key: 'projects.create', label: 'Create Projects', description: 'Create new projects' },
      { key: 'projects.read', label: 'View Projects', description: 'View project details and dashboards' },
      { key: 'projects.update', label: 'Edit Projects', description: 'Modify project settings and details' },
      { key: 'projects.delete', label: 'Delete Projects', description: 'Archive or delete projects' },
    ],
  },
  {
    resource: 'Reports',
    permissions: [
      { key: 'reports.view', label: 'View Reports', description: 'Access analytics and reports' },
      { key: 'reports.export', label: 'Export Reports', description: 'Export reports to CSV or PDF' },
      { key: 'reports.create', label: 'Create Reports', description: 'Build custom reports and dashboards' },
    ],
  },
  {
    resource: 'People',
    permissions: [
      { key: 'people.view', label: 'View Members', description: 'See the team member directory' },
      { key: 'people.invite', label: 'Invite Members', description: 'Send invitations to new users' },
      { key: 'people.remove', label: 'Remove Members', description: 'Remove users from the organization' },
    ],
  },
  {
    resource: 'Departments',
    permissions: [
      { key: 'departments.create', label: 'Create Departments', description: 'Create new departments' },
      { key: 'departments.read', label: 'View Departments', description: 'View department structure' },
      { key: 'departments.update', label: 'Edit Departments', description: 'Modify department details' },
      { key: 'departments.delete', label: 'Delete Departments', description: 'Remove departments' },
    ],
  },
  {
    resource: 'Settings',
    permissions: [
      { key: 'settings.company', label: 'Company Settings', description: 'Manage company profile and branding' },
      { key: 'settings.users', label: 'User Management', description: 'Manage users and invitations' },
      { key: 'settings.roles', label: 'Role Management', description: 'Create and modify roles' },
      { key: 'settings.labels', label: 'Label Management', description: 'Create and manage labels' },
    ],
  },
];

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function PermissionSettingsPage() {
  const { data: rolesData, isLoading, error, refetch } = useQuery({
    queryKey: ['org-roles-permissions'],
    queryFn: () => api.get('/organization/roles'),
  });

  const rolesDataResolved = rolesData as any;
  const rolesList = (Array.isArray(rolesDataResolved?.data) ? rolesDataResolved.data : Array.isArray(rolesDataResolved) ? rolesDataResolved : []) as Role[];

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
        <div className="h-60 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load permissions.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const hasPermission = (role: Role, perm: string) => {
    if (role.permissions?.includes('*')) return true;
    return role.permissions?.includes(perm) ?? false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permission Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all permissions and which roles have access to each.
          </p>
        </div>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                {rolesList.map((role) => (
                  <TableHead key={role.id} className="text-center w-[100px]">
                    {role.name}
                  </TableHead>
                ))}
                {rolesList.length === 0 && (
                  <>
                    <TableHead className="text-center w-[100px]">Admin</TableHead>
                    <TableHead className="text-center w-[100px]">Manager</TableHead>
                    <TableHead className="text-center w-[100px]">Member</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSION_GROUPS.map((group) => (
                <Fragment key={group.resource}>
                  <TableRow>
                    <TableCell colSpan={rolesList.length || 3 + 1} className="bg-muted/50 font-semibold text-foreground text-xs uppercase tracking-wider py-2">
                      {group.resource}
                    </TableCell>
                  </TableRow>
                  {group.permissions.map((perm) => (
                    <TableRow key={perm.key}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{perm.label}</p>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </TableCell>
                      {rolesList.length > 0 ? (
                        rolesList.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            {hasPermission(role, perm.key) ? (
                              <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </TableCell>
                        ))
                      ) : (
                        <>
                          <TableCell className="text-center">
                            <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.key.includes('delete') || perm.key.includes('remove') || perm.key === 'settings.roles' ? (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {perm.key.includes('delete') || perm.key.includes('remove') || perm.key.includes('create') || perm.key.includes('export') || perm.key.includes('settings') ? (
                              <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                            ) : (
                              <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                            )}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
