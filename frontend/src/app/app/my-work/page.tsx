'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Inbox,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTasks, useUpdateTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  Critical: 'destructive',
  High: 'warning',
  Medium: 'info',
  Low: 'secondary',
};

const STATUS_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'success' | 'secondary'> = {
  'Pending': 'secondary',
  'In Progress': 'info',
  'Review': 'warning',
  'Completed': 'success',
  'Blocked': 'destructive',
  'Cancelled': 'secondary',
  'Reopened': 'warning',
};

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function MyWorkTaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-card-hover transition-colors group">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={(e) => {
          e.preventDefault();
          onComplete(task.id);
        }}
        title="Mark as complete"
      >
        <CheckCircle2 className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
      </Button>
      <div className="flex-1 min-w-0">
        <Link href={`/app/tasks/${task.id}`}>
          <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {task.title}
          </p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground font-mono">{task.taskId}</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={PRIORITY_VARIANT[task.priority] || 'secondary'} className="text-[10px]">
          {task.priority}
        </Badge>
        <Badge variant={STATUS_VARIANT[task.status] || 'secondary'} className="text-[10px]">
          {task.status}
        </Badge>
      </div>
    </div>
  );
}

export default function MyWorkPage() {
  const { user } = useAuth();
  const updateTask = useUpdateTask();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: assignedTasks, isLoading: assignedLoading, error: assignedError, refetch: refetchAssigned } = useTasks({
    pageSize: 100,
    status: statusFilter !== 'all' ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as TaskPriority) : undefined,
  });

  const { data: createdTasks, isLoading: createdLoading, error: createdError, refetch: refetchCreated } = useTasks({
    pageSize: 100,
    status: statusFilter !== 'all' ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter !== 'all' ? (priorityFilter as TaskPriority) : undefined,
  });

  const handleComplete = async (id: string) => {
    await updateTask.mutateAsync({ id, data: { status: 'Completed' } });
  };

  const assigned = (assignedTasks?.rows || []);
  const created = (createdTasks?.rows || []);

  const hasError = assignedError || createdError;
  const isLoading = assignedLoading || createdLoading;

  if (hasError && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Work</h1>
          <p className="text-sm text-muted-foreground mt-1">Your tasks and assignments across all projects.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load tasks</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => { refetchAssigned(); refetchCreated(); }} variant="outline" size="sm">
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Work</h1>
        <p className="text-sm text-muted-foreground mt-1">Your tasks and assignments across all projects.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="assigned">
        <TabsList>
          <TabsTrigger value="assigned" className="gap-2">
            <Briefcase className="h-3.5 w-3.5" />
            Assigned to Me
            {!isLoading && (
              <Badge variant="secondary" className="text-[10px] h-4 min-w-[16px] ml-1">
                {assigned.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="created" className="gap-2">
            <Edit className="h-3.5 w-3.5" />
            Created by Me
            {!isLoading && (
              <Badge variant="secondary" className="text-[10px] h-4 min-w-[16px] ml-1">
                {created.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4">
          <Card className="hover-translate-none">
            <CardContent className="p-4">
              {isLoading ? (
                <TaskListSkeleton />
              ) : assigned.length === 0 ? (
                <div className="py-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">No tasks assigned to you</p>
                  <p className="text-sm text-muted-foreground">
                    Tasks assigned to you will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assigned.map((task) => (
                    <MyWorkTaskItem key={task.id} task={task} onComplete={handleComplete} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="mt-4">
          <Card className="hover-translate-none">
            <CardContent className="p-4">
              {isLoading ? (
                <TaskListSkeleton />
              ) : created.length === 0 ? (
                <div className="py-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">No tasks created by you</p>
                  <p className="text-sm text-muted-foreground">
                    Tasks you create will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {created.map((task) => (
                    <MyWorkTaskItem key={task.id} task={task} onComplete={handleComplete} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
