'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeCardGrid } from '@/modules/admin/components/employee-cards/EmployeeCardGrid';
import { useEmployeeList } from '@/modules/admin/hooks/useEmployeePerformance';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from '@/modules/admin/hooks/useAdmin';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { MobileEmployeeList } from '@/components/mobile/MobileEmployeeList';
import type { EmployeeListItem } from '@/modules/admin/types/employeePerformance';

const PAGE_SIZE = 12;

function CreateEmployeeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createEmployee = useCreateEmployee();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    await createEmployee.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      userType: 'EMPLOYEE',
    });
    setName(''); setEmail(''); setPassword(''); setRole('EMPLOYEE');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Employee</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emp-name">Name *</Label>
          <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-email">Email *</Label>
          <Input id="emp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emp-password">Password *</Label>
          <Input id="emp-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={createEmployee.isPending || !name.trim() || !email.trim() || !password.trim()}>
            {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function EditEmployeeDialog({ open, onOpenChange, employee }: { open: boolean; onOpenChange: (v: boolean) => void; employee: EmployeeListItem }) {
  const updateEmployee = useUpdateEmployee();
  const [name, setName] = useState(employee?.name || '');
  const [role, setRole] = useState(employee?.role || 'EMPLOYEE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateEmployee.mutateAsync({
      id: employee.id,
      data: { name: name.trim(), role },
    });
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Employee</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={updateEmployee.isPending || !name.trim()}>
            {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export default function AdminEmployeesPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeListItem | null>(null);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      status: statusFilter !== 'all' ? (statusFilter as 'active' | 'inactive') : undefined,
    }),
    [page, search, roleFilter, statusFilter],
  );

  const { data, isLoading, error, refetch } = useEmployeeList(params);

  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();

  const employees = (data as any)?.data?.rows || [];
  const pagination = (data as any)?.data?.pagination;

  const handleToggleStatus = (emp: EmployeeListItem) => {
    updateEmployee.mutate({ id: emp.id, data: { isActive: !emp.isActive } });
  };

  // Mobile View
  if (!isDesktop) {
    return (
      <>
        <MobileEmployeeList
          employees={employees}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          onCreateEmployee={() => setCreateOpen(true)}
          onEditEmployee={(emp) => setEditEmployee(emp)}
          onToggleStatus={handleToggleStatus}
          onDeleteEmployee={(emp) => {
            if (window.confirm(`Delete employee "${emp.name || emp.email}"? This will deactivate their account.`)) {
              deleteEmployee.mutate(emp.id);
            }
          }}
          total={pagination?.total}
        />
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
        
        {editEmployee && (
          <EditEmployeeDialog
            open={!!editEmployee}
            onOpenChange={(open) => {
              if (!open) setEditEmployee(null);
            }}
            employee={editEmployee}
          />
        )}
      </>
    );
  }

  const handleDelete = (emp: EmployeeListItem) => {
    if (window.confirm(`Delete employee "${emp.name || emp.email}"? This will deactivate their account.`)) {
      deleteEmployee.mutate(emp.id);
    }
  };

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="mb-1 font-medium">Failed to load employees</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop View (original)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee performance dashboard · {pagination?.total ?? 0} employees
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
          </DialogTrigger>
          <CreateEmployeeDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, ID, department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {employees.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="mb-1 font-medium">No employees found</p>
            <p className="mb-4 text-sm text-muted-foreground">
              {search || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first employee to get started.'}
            </p>
            {!search && roleFilter === 'all' && statusFilter === 'all' && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmployeeCardGrid
          employees={employees}
          isLoading={isLoading}
          skeletonCount={8}
          onEdit={setEditEmployee}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {editEmployee && (
        <Dialog open={!!editEmployee} onOpenChange={(v) => !v && setEditEmployee(null)}>
          <EditEmployeeDialog open={!!editEmployee} onOpenChange={(v) => !v && setEditEmployee(null)} employee={editEmployee} />
        </Dialog>
      )}
    </div>
  );
}
