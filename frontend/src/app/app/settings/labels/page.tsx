'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Tag,
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/core/api';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#14b8a6', '#f43f5e', '#a855f7',
];

interface LabelItem {
  id: string;
  name: string;
  color: string;
  taskCount?: number;
}

export default function LabelSettingsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editLabel, setEditLabel] = useState<LabelItem | null>(null);
  const [deleteLabel, setDeleteLabel] = useState<LabelItem | null>(null);

  const [createForm, setCreateForm] = useState({ name: '', color: '#3b82f6' });
  const [editForm, setEditForm] = useState({ name: '', color: '' });

  const { data: labelsData, isLoading, error, refetch } = useQuery({
    queryKey: ['org-labels'],
    queryFn: () => api.get('/organization/labels'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/organization/labels', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-labels'] });
      setCreateOpen(false);
      setCreateForm({ name: '', color: '#3b82f6' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/organization/labels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-labels'] });
      setEditLabel(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/organization/labels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-labels'] });
      setDeleteLabel(null);
    },
  });

  const labelsDataResolved = labelsData as any;
  const labelsList = Array.isArray(labelsDataResolved?.data) ? labelsDataResolved.data : Array.isArray(labelsDataResolved) ? labelsDataResolved : [];

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load labels.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const LabelForm = ({
    form,
    onChange,
  }: {
    form: { name: string; color: string };
    onChange: (f: { name: string; color: string }) => void;
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label-name">Label Name</Label>
        <Input
          id="label-name"
          placeholder="e.g. Bug, Feature, Urgent"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...form, color })}
              className={`w-8 h-8 rounded-lg transition-all ${
                form.color === color ? 'ring-2 ring-offset-2 ring-offset-background' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: color,
                outlineColor: form.color === color ? color : 'transparent',
                outlineWidth: form.color === color ? '2px' : '0px',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="color"
            value={form.color}
            onChange={(e) => onChange({ ...form, color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <Input
            value={form.color}
            onChange={(e) => onChange({ ...form, color: e.target.value })}
            className="w-32 font-mono text-sm"
          />
        </div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <Badge style={{ backgroundColor: form.color, color: '#fff', borderColor: 'transparent' }}>
            {form.name || 'Label'}
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Label Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage task labels and tags for categorization.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Label
        </Button>
      </div>

      {labelsList.length === 0 ? (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="py-16 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No labels yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create labels to categorize and organize your tasks.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Label
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {labelsList.map((label: LabelItem) => (
            <div
              key={label.id}
              className="relative group rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{label.name}</p>
                  {label.taskCount !== undefined && (
                    <p className="text-xs text-muted-foreground">{label.taskCount} tasks</p>
                  )}
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditLabel(label);
                        setEditForm({ name: label.name, color: label.color });
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteLabel(label)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Label Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>Add a new label for task categorization.</DialogDescription>
          </DialogHeader>
          <LabelForm form={createForm} onChange={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.name || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      <Dialog open={!!editLabel} onOpenChange={() => setEditLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>Update label name and color.</DialogDescription>
          </DialogHeader>
          <LabelForm form={editForm} onChange={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLabel(null)}>Cancel</Button>
            <Button
              onClick={() => editLabel && updateMutation.mutate({ id: editLabel.id, data: editForm })}
              disabled={!editForm.name || updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteLabel} onOpenChange={() => setDeleteLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Label</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteLabel?.name}</strong>? This label will be removed
              from all tasks it is assigned to.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLabel(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteLabel && deleteMutation.mutate(deleteLabel.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
