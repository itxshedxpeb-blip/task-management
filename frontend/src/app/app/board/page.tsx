'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Inbox,
  ChevronRight,
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
import { useTasks, useCreateTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

const STATUS_TABS: { status: TaskStatus; label: string; color: string; bgColor: string }[] = [
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
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-2xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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

function TaskCard({ task }: { task: Task }) {
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
            <Badge variant="outline" className={cn('text-xs', STATUS_TABS.find(t => t.status === task.status)?.color)}>
              {STATUS_TABS.find(t => t.status === task.status)?.label}
            </Badge>
            <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BoardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskStatus>('Todo');
  const { data: allTasks, isLoading, error, refetch } = useTasks({ pageSize: 200 });

  const tasks = allTasks?.rows || [];
  const filteredTasks = tasks.filter((t) => t.status === activeTab);

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="font-medium mb-4">Failed to load board</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Status Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
          {STATUS_TABS.map((tab) => {
            const count = tasks.filter((t) => t.status === tab.status).length;
            const isActive = activeTab === tab.status;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? `${tab.bgColor} ${tab.color} border border-border`
                    : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <BoardSkeleton />
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-4" />
            <p>No tasks in {STATUS_TABS.find(t => t.status === activeTab)?.label}</p>
          </div>
        ) : (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
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
