'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Building2,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { adminApi } from '@/modules/admin/services/adminApi';

interface Company {
  id: string;
  name: string;
  email: string;
  status: string;
  userCount: number;
  createdAt: string;
}

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  const { data: companiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-companies', search, statusFilter],
    queryFn: () => adminApi.getCompanies({ search, status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setEditCompany(null);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminApi.suspendCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
      setDeleteCompany(null);
    },
  });

  const companies = (companiesData as any)?.data || (companiesData as any) || [];
  const companyList = Array.isArray(companies) ? companies : [];

  const filteredCompanies = companyList.filter((c: Company) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load companies.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered companies on the platform.
          </p>
        </div>
        <Button
          className="bg-[#f97316] hover:bg-[#f97316]/90 text-white"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {companyList.length === 0 ? (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No companies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first company.
            </p>
            <Button className="bg-[#f97316] hover:bg-[#f97316]/90 text-white" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company: Company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-muted-foreground">{company.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.status === 'ACTIVE'
                            ? 'success'
                            : company.status === 'SUSPENDED'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{company.userCount ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditCompany(company);
                              setEditForm({ name: company.name, email: company.email });
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => suspendMutation.mutate(company.id)}
                          >
                            {company.status === 'SUSPENDED' ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteCompany(company)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Company Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company</DialogTitle>
            <DialogDescription>
              Add a new company to the platform. An invitation will be sent to the owner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Company Name</Label>
              <Input
                id="create-name"
                placeholder="Acme Corp"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Owner Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="admin@acme.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Owner Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="Set a password for the owner"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
            </div>
            {createMutation.isError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Failed to create company. Please try again.</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              className="bg-[#f97316] hover:bg-[#f97316]/90 text-white"
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.name || !createForm.email || !createForm.password || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={!!editCompany} onOpenChange={() => setEditCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCompany(null)}>Cancel</Button>
            <Button
              className="bg-[#f97316] hover:bg-[#f97316]/90 text-white"
              onClick={() => editCompany && updateMutation.mutate({ id: editCompany.id, data: editForm })}
              disabled={!editForm.name || !editForm.email || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCompany} onOpenChange={() => setDeleteCompany(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteCompany?.name}</strong>? This action cannot be undone
              and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCompany(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteCompany && deleteMutation.mutate(deleteCompany.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
