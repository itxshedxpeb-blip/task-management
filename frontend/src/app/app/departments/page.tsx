'use client';

import { useState } from 'react';
import {
  Plus,
  Building2,
  Users,
  FolderOpen,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { api } from '@/core/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  teamCount: number;
  createdAt: string;
}

function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const res = await api.get<BackendResponse<Department[]>>('/departments');
        // Handle both wrapped and unwrapped responses
        return (res.data as any).data || res.data || [];
      } catch {
        return [] as Department[];
      }
    },
  });
}

function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<BackendResponse<Department>>('/departments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<BackendResponse<void>>(`/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });
}

function DeptSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="hover-translate-none">
          <CardContent className="p-6">
            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-full mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateDeptDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const createDept = useCreateDepartment();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createDept.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create Department</DialogTitle>
        <DialogDescription>Add a new department to organize your team.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dept-name">Name *</Label>
          <Input
            id="dept-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Department name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dept-desc">Description</Label>
          <Textarea
            id="dept-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={createDept.isPending || !name.trim()}>
            {createDept.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function DepartmentsPage() {
  const { data: departments, isLoading, error, refetch } = useDepartments();
  const deleteDept = useDeleteDepartment();
  const [createOpen, setCreateOpen] = useState(false);

  const depts = departments || [];

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your team into departments and groups.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load departments</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your team into departments and groups.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Department
            </Button>
          </DialogTrigger>
          <CreateDeptDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      {isLoading ? (
        <DeptSkeleton />
      ) : depts.length === 0 ? (
        <Card className="hover-translate-none">
          <CardContent className="py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No departments yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first department to organize your team.</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map((dept: Department) => (
            <Card key={dept.id} className="hover-translate-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => deleteDept.mutate(dept.id)}
                      disabled={deleteDept.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">{dept.name}</h3>
                {dept.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{dept.description}</p>
                )}
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{dept.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{dept.teamCount} teams</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
