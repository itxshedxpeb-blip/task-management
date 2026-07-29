'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';
import { useTasks, useCreateTask, useMoveTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

const BOARD_COLUMNS: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { status: 'Draft', label: 'Draft', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
  { status: 'Todo', label: 'Todo', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { status: 'InProgress', label: 'In Progress', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  { status: 'OnHold', label: 'On Hold', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { status: 'Completed', label: 'Completed', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
];

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {BOARD_COLUMNS.map((col) => (
        <div key={col.status} className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

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

function TaskCard({ task }: { task: Task }) {
  return (
    <Link href={`/app/tasks/${task.id}`}>
      <div
        className="p-3 rounded-lg border border-border bg-card hover:bg-card-hover hover:shadow-md transition-all cursor-pointer group"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('taskId', task.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-2">
            {task.title}
          </p>
          <div className={cn('h-2 w-2 rounded-full shrink-0 mt-1.5', PRIORITY_DOT[task.priority])} />
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[8px] font-medium text-primary">
                {task.assignedUserName?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
              {task.assignedUserName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BoardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const moveTask = useMoveTask();
  const { data: allTasks, isLoading, error, refetch } = useTasks({ pageSize: 200 });

  const tasks = allTasks?.rows || [];
  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.priority === filter);
  const columnTasks = (status: TaskStatus) => filteredTasks.filter((t) => t.status === status);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (status: TaskStatus) => async (e: React.DragEvent) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) {
        await moveTask.mutateAsync({ id: taskId, status });
      }
    },
    [moveTask]
  );

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Board</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load board</p>
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
          <h1 className="text-2xl font-bold text-foreground">Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Kanban board view for your tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Task</Button>
            </DialogTrigger>
            <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <BoardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[calc(100vh-200px)]">
          {BOARD_COLUMNS.map((col) => {
            const colTasks = columnTasks(col.status);
            return (
              <div key={col.status} className="flex flex-col" onDragOver={handleDragOver} onDrop={handleDrop(col.status)}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn('h-2.5 w-2.5 rounded-full', col.bgColor)} />
                  <h3 className="text-sm font-medium text-foreground">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px]">{colTasks.length}</Badge>
                </div>
                <div className={cn('flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors bg-muted/30 border border-dashed border-transparent hover:border-border')}>
                  {colTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-muted-foreground/40">
                      <Inbox className="h-6 w-6" />
                    </div>
                  ) : (
                    colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
