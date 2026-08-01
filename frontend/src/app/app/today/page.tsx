'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, dayjs } from '@/lib/date-utils';
import { useTasks, useCreateTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { Task, TaskPriority } from '@/features/task-management/types';

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

const STATUS_COLORS: Record<string, string> = {
  Todo: 'text-blue-400 bg-blue-500/10',
  InProgress: 'text-orange-400 bg-orange-500/10',
  Completed: 'text-emerald-400 bg-emerald-500/10',
  OnHold: 'text-yellow-400 bg-yellow-500/10',
  Draft: 'text-gray-400 bg-gray-500/10',
};

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Completed';
  
  return (
    <Link href={`/app/tasks/${task.id}`}>
      <Card className="p-4 rounded-2xl border border-border bg-card hover:bg-card-hover hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-3">
            <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-2">
              {task.title}
            </p>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[task.status] || '')}>
                {task.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">Late</Badge>
              )}
            </div>
            <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedUserId: user?.id,
    });
    setTitle(''); setDescription(''); setPriority('Medium');
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

export default function TodayPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const today = dayjs();
  const { data, isLoading, error, refetch } = useTasks({ pageSize: 500 });

  const tasks = data?.rows || [];

  const todayKey = `${today.year()}-${String(today.month() + 1).padStart(2, '0')}-${String(today.date()).padStart(2, '0')}`;
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = dayjs(t.dueDate);
    return d.year() === today.year() && d.month() === today.month() && d.date() === today.date();
  });

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = dayjs(t.dueDate);
    return d.isBefore(today, 'day') && t.status !== 'Completed';
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="font-medium mb-4">Failed to load tasks</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
        <h2 className="text-lg font-semibold text-foreground">
          {today.format('dddd, MMMM D')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} due today
        </p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-destructive mb-3">Overdue</h3>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Today's Tasks */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Today</h3>
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today.</p>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <button
          onClick={() => setCreateOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        >
          <Plus className="h-6 w-6" />
        </button>
        <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
      </Dialog>
    </div>
  );
}
