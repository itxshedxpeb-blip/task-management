'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tag,
  RefreshCw,
  Circle,
  XCircle,
  Timer,
  BarChart3,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/date-utils';
import {
  useTaskDetail,
  useUpdateTask,
  useToggleChecklistItem,
  useDeleteTask,
  useTaskActivities,
  useCreateActivity,
} from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { TaskStatus, Task, ChecklistItem } from '@/features/task-management/types';
import MobileTaskDetail from '@/components/mobile/MobileTaskDetail';
import { ActivityFollowUpTimeline } from '@/features/task-management/components/ActivityFollowUpTimeline';
import { AddFollowUpForm } from '@/features/task-management/components/AddFollowUpForm';

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'secondary'> = {
  Urgent: 'destructive',
  High: 'warning',
  Medium: 'info',
  Low: 'secondary',
  None: 'secondary',
};

const STATUS_VARIANT: Record<string, 'destructive' | 'warning' | 'info' | 'success' | 'secondary'> = {
  'Draft': 'secondary',
  'Todo': 'secondary',
  'InProgress': 'info',
  'OnHold': 'warning',
  'Completed': 'success',
  'Archived': 'secondary',
  'Cancelled': 'destructive',
};

const STATUS_FLOW: TaskStatus[] = ['Draft', 'Todo', 'InProgress', 'OnHold', 'Completed'];

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

function ChecklistSection({ task }: { task: Task }) {
  const toggleItem = useToggleChecklistItem();
  const checklist: ChecklistItem[] = task.checklist || [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleToggle = async (item: ChecklistItem) => {
    await toggleItem.mutateAsync({
      taskId: task.id,
      itemId: item.id,
      completed: !item.completed,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Checklist ({completedCount}/{checklist.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">{progressPct}%</span>
        </div>
        {checklist.length > 0 && (
          <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {checklist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No checklist items.</p>
        ) : (
          <div className="space-y-1">
            {checklist.sort((a, b) => a.order - b.order).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox checked={item.completed} onCheckedChange={() => handleToggle(item)} />
                <span className={cn('text-sm transition-all', item.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivitySection({ task }: { task: Task }) {
  const { data: activitiesData, isLoading: activitiesLoading } = useTaskActivities(task.id);
  const createActivity = useCreateActivity();
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);

  const activities = activitiesData?.rows || [];

  const handleCreateActivity = async (data: {
    activityType: string;
    description: string;
    nextFollowUpDate?: string;
    nextFollowUpTime?: string;
    nextFollowUpAction?: string;
    status?: TaskStatus;
    progress?: number;
  }) => {
    await createActivity.mutateAsync({
      taskId: task.id,
      data: {
        activityType: data.activityType,
        description: data.description,
        ...(data.nextFollowUpDate && { nextFollowUpDate: data.nextFollowUpDate }),
        ...(data.nextFollowUpTime && { nextFollowUpTime: data.nextFollowUpTime }),
        ...(data.nextFollowUpAction && { nextFollowUpAction: data.nextFollowUpAction }),
        ...(data.status && { status: data.status }),
        ...(data.progress !== undefined && { progress: data.progress }),
      },
    });
  };

  return (
    <div className="space-y-4">
      {activitiesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ActivityFollowUpTimeline activities={activities} />
      )}

      <Button
        variant="outline"
        className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5"
        onClick={() => setShowFollowUpForm(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Follow-up
      </Button>

      <AddFollowUpForm
        open={showFollowUpForm}
        onOpenChange={setShowFollowUpForm}
        onSubmit={handleCreateActivity}
        currentStatus={task.status}
        currentProgress={task.progress ?? 0}
      />
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = params?.id as string;
  const { user } = useAuth();
  const { data: task, isLoading, error, refetch } = useTaskDetail(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDelete, setShowDelete] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const backToEmployee = searchParams?.get('from') === 'employee' ? searchParams?.get('emp') : null;

  const handleBack = () => {
    if (backToEmployee) {
      router.push(`/admin/employees/${backToEmployee}`);
    } else {
      router.back();
    }
  };

  // Use mobile version for mobile devices
  if (!isDesktop) {
    return <MobileTaskDetail />;
  }

  // Desktop version (original)

  if (isLoading) return <DetailSkeleton />;

  if (error || !task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load task</p>
            <p className="text-sm text-muted-foreground mb-3">
              {error instanceof Error ? error.message : 'Task not found or you do not have permission to view it'}
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusIndex = STATUS_FLOW.indexOf(task.status);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateTask.mutateAsync({ id: task.id, data: { status: newStatus } });
  };

  const handleDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    router.push('/app/tasks');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> {backToEmployee ? 'Back to Employee' : 'Back'}
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">TSK-{String(task.taskId).padStart(3, '0')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
          {task.status !== 'Completed' && task.status !== 'Cancelled' && task.status !== 'Archived' && (
            <>
              {task.status === 'OnHold' ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange('InProgress')} disabled={updateTask.isPending}>
                    <XCircle className="h-3.5 w-3.5 mr-1.5" /> Resume
                  </Button>
                  <Button size="sm" onClick={() => handleStatusChange('Completed')} disabled={updateTask.isPending}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Complete
                  </Button>
                </>
              ) : statusIndex >= 0 && statusIndex < STATUS_FLOW.indexOf('Completed') ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const next = STATUS_FLOW[Math.min(statusIndex + 1, STATUS_FLOW.length - 1)];
                    handleStatusChange(next);
                  }}
                  disabled={updateTask.isPending}
                >
                  Move Forward
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('InProgress')}
                  disabled={updateTask.isPending}
                >
                  Start Task
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {task.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          <ChecklistSection task={task} />
          <ActivitySection task={task} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Status</p>
                <Badge variant={STATUS_VARIANT[task.status] || 'secondary'}>{task.status}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Priority</p>
                <Badge variant={PRIORITY_VARIANT[task.priority] || 'secondary'}>{task.priority}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Assignee</p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{task.assignedUserName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Created By</p>
                <span className="text-sm text-foreground">{task.createdByName}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Due Date</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{task.progress}%</span>
                </div>
              </div>
              {task.status === 'Completed' && task.completedAt && (
                <>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Completed At</p>
                    <span className="text-sm text-foreground">{formatDateTime(task.completedAt)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" /> Time Tracking
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Estimated</p>
                  <p className="text-sm font-medium text-foreground">{task.estimatedHours ? `${task.estimatedHours}h` : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Time Spent</p>
                  <p className="text-sm font-medium text-foreground">{task.timeSpent ? `${task.timeSpent}h` : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {task.tags && task.tags.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Tag className="h-3.5 w-3.5" /> Labels
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Details
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Created</span>
                  <span className="text-[10px] text-foreground">{formatDateTime(task.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Updated</span>
                  <span className="text-[10px] text-foreground">{formatDateTime(task.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}