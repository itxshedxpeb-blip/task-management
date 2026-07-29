'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  Calendar,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/date-utils';
import { useTasks, useCreateTask, useUpdateTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

interface Quadrant {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  filter: (task: Task) => boolean;
}

const QUADRANTS: Quadrant[] = [
  {
    id: 'urgent-important',
    title: 'Do First',
    subtitle: 'Urgent + Important',
    color: 'text-red-500',
    bgColor: 'bg-red-500/5',
    borderColor: 'border-red-500/20',
    filter: (t) => (t.priority === 'Urgent' || t.priority === 'High') && isOverdueOrDueSoon(t.dueDate),
  },
  {
    id: 'not-urgent-important',
    title: 'Schedule',
    subtitle: 'Not Urgent + Important',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    filter: (t) => (t.priority === 'Urgent' || t.priority === 'High') && !isOverdueOrDueSoon(t.dueDate),
  },
  {
    id: 'urgent-not-important',
    title: 'Delegate',
    subtitle: 'Urgent + Not Important',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    filter: (t) => (t.priority === 'Medium' || t.priority === 'Low') && isOverdueOrDueSoon(t.dueDate),
  },
  {
    id: 'not-urgent-not-important',
    title: 'Eliminate',
    subtitle: 'Not Urgent + Not Important',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/5',
    borderColor: 'border-slate-500/20',
    filter: (t) => (t.priority === 'Medium' || t.priority === 'Low' || t.priority === 'None') && !isOverdueOrDueSoon(t.dueDate),
  },
];

function isOverdueOrDueSoon(dueDate?: Date | string): boolean {
  if (!dueDate) return false;
  const d = dayjs(dueDate);
  const now = dayjs();
  const threeDays = now.add(3, 'day');
  return d.isSame(threeDays) || d.isBefore(threeDays);
}

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status: 'Todo',
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      assignedUserId: user?.id || '',
    });
    setTitle(''); setDescription(''); setPriority('Medium'); setDueDate('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={createTask.isPending || !title.trim()}>
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export default function PriorityMatrixPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, error, refetch } = useTasks({ pageSize: 500 });

  const tasks = data?.rows || [];

  const quadrantTasks = (q: Quadrant) => tasks.filter(q.filter);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Priority Matrix</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load tasks</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
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
          <h1 className="text-2xl font-bold text-foreground">Priority Matrix</h1>
          <p className="text-sm text-muted-foreground mt-1">Eisenhower matrix for task prioritization.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Task</Button>
          </DialogTrigger>
          <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUADRANTS.map((quadrant) => {
            const qTasks = quadrantTasks(quadrant);
            return (
              <Card key={quadrant.id} className={cn('border', quadrant.borderColor, quadrant.bgColor)}>
                <CardHeader className="pb-2">
                  <CardTitle className={cn('text-base', quadrant.color)}>{quadrant.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{quadrant.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {qTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No tasks in this quadrant</p>
                  ) : (
                    qTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/app/tasks/${task.id}`}
                        className="flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-card-hover transition-colors group"
                      >
                        <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{task.assignedUserName}</span>
                            {task.dueDate && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
