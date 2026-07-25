'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MapPin,
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
  Phone,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  employeeCount: number;
  isHeadquarters: boolean;
  status: string;
}

export default function BranchSettingsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [deleteBranch, setDeleteBranch] = useState<Branch | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', address: '', phone: '' });
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '' });

  const { data: branchesData, isLoading, error, refetch } = useQuery({
    queryKey: ['org-branches'],
    queryFn: () => api.get('/organization/branches'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/organization/branches', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-branches'] });
      setCreateOpen(false);
      setCreateForm({ name: '', address: '', phone: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/organization/branches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-branches'] });
      setEditBranch(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/organization/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-branches'] });
      setDeleteBranch(null);
    },
  });

  const branchesDataResolved = branchesData as any;
  const branchesList = Array.isArray(branchesDataResolved?.data) ? branchesDataResolved.data : Array.isArray(branchesDataResolved) ? branchesDataResolved : [];

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
            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load branches.</p>
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
          <h1 className="text-2xl font-bold text-foreground">Branch Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage office locations and branch offices for your organization.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {branchesList.length === 0 ? (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No branches configured</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add branch offices and office locations for your organization.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchesList.map((branch: Branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{branch.name}</p>
                          {branch.isHeadquarters && (
                            <Badge variant="info" className="text-[10px] mt-0.5">HQ</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{branch.address || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{branch.phone || '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{branch.employeeCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={branch.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {branch.status || 'Active'}
                      </Badge>
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
                              setEditBranch(branch);
                              setEditForm({ name: branch.name, address: branch.address, phone: branch.phone });
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteBranch(branch)}
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

      {/* Create Branch Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
            <DialogDescription>Add a new office location or branch.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                placeholder="e.g. Downtown Office"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-address">Address</Label>
              <Textarea
                id="branch-address"
                placeholder="Full address"
                rows={2}
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-phone">Phone</Label>
              <Input
                id="branch-phone"
                placeholder="+1 (555) 000-0000"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.name || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={!!editBranch} onOpenChange={() => setEditBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-branch-name">Branch Name</Label>
              <Input
                id="edit-branch-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-branch-address">Address</Label>
              <Textarea
                id="edit-branch-address"
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-branch-phone">Phone</Label>
              <Input
                id="edit-branch-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBranch(null)}>Cancel</Button>
            <Button
              onClick={() => editBranch && updateMutation.mutate({ id: editBranch.id, data: editForm })}
              disabled={!editForm.name || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteBranch} onOpenChange={() => setDeleteBranch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteBranch?.name}</strong>? Users assigned to this
              branch will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBranch(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteBranch && deleteMutation.mutate(deleteBranch.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
