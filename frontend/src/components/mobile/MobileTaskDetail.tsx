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
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Task, ChecklistItem, TaskStatus } from '@/features/task-management/types';
import { ActivityFollowUpTimeline } from '@/features/task-management/components/ActivityFollowUpTimeline';
import { AddFollowUpForm } from '@/features/task-management/components/AddFollowUpForm';
import { StatusSmartBadge, PrioritySmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import { CountdownTimer } from '@/features/task-management/components/shared/CountdownTimer';
import { getDaysOverdue } from '@/features/task-management/utils/taskFormatters';

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'Draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'Todo', label: 'Todo', color: 'bg-blue-500' },
  { value: 'InProgress', label: 'In Progress', color: 'bg-orange-500' },
  { value: 'OnHold', label: 'On Hold', color: 'bg-yellow-500' },
  { value: 'Completed', label: 'Completed', color: 'bg-emerald-500' },
];

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function ChecklistSection({ task }: { task: Task }) {
  const toggleItem = useToggleChecklistItem();
  const checklist: ChecklistItem[] = task.checklist || [];
  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPct =
    checklist.length > 0
      ? Math.round((completedCount / checklist.length) * 100)
      : 0;

  const handleToggle = async (item: ChecklistItem) => {
    await toggleItem.mutateAsync({
      taskId: task.id,
      itemId: item.id,
      completed: !item.completed,
    });
  };

  return (
    <Card className="mobile-card">
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
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {checklist.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No checklist items.
          </p>
        ) : (
          <div className="space-y-1">
            {checklist
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggle(item)}
                  />
                  <span
                    className={cn(
                      'text-sm transition-all',
                      item.completed
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    )}
                  >
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
    <div className="space-y-3">
      {activitiesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <ActivityFollowUpTimeline activities={activities} />
      )}

      <Button
        variant="outline"
        className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 h-11"
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

export default function MobileTaskDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = params?.id as string;
  const { user } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { data: task, isLoading, error, refetch } = useTaskDetail(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const backToEmployee = searchParams?.get('from') === 'employee' ? searchParams?.get('emp') : null;

  const handleBack = () => {
    if (backToEmployee) {
      router.push(`/admin/employees/${backToEmployee}`);
    } else {
      router.back();
    }
  };

  // If desktop, use original detail page
  if (isDesktop) {
    const TaskDetailPage = require('@/app/app/tasks/[id]/page').default;
    return <TaskDetailPage />;
  }

  const handleDelete = async () => {
    if (task) {
      await deleteTask.mutateAsync(task.id);
      if (backToEmployee) {
        router.push(`/admin/employees/${backToEmployee}`);
      } else {
        router.back();
      }
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (task) {
      await updateTask.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });
      setShowStatusMenu(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-muted-foreground mb-4 text-center">
          Failed to load task details.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const daysOverdue = getDaysOverdue(task.dueDate);
  const isOverdue = daysOverdue !== null && daysOverdue > 0 && task.status !== 'Completed';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* App Bar */}
      <header className="flex-shrink-0 sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground flex-1 truncate">
              {backToEmployee ? 'Task' : 'Task Details'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost" className="h-10 w-10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowStatusMenu(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Task Header Card */}
        <Card className="mobile-card border-l-4 border-l-transparent">
          {isOverdue && (
            <div className="border-l-4 border-l-destructive rounded-l-xl" />
          )}
          <CardContent className="p-5">
            <div className="space-y-3">
              {/* Title */}
              <h2 className="text-xl font-bold text-foreground leading-tight">
                {task.title}
              </h2>

              {/* Description */}
              {task.description && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              )}

              {/* Status and Priority */}
              <div className="flex flex-wrap gap-2">
                <StatusSmartBadge status={task.status} />
                <PrioritySmartBadge priority={task.priority} />
                {task.taskId !== undefined && (
                  <Badge variant="outline" className="text-[10px] h-5 font-mono">
                    TSK-{String(task.taskId).padStart(3, '0')}
                  </Badge>
                )}
                {task.category && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    {task.category}
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive" className="text-[10px] h-5">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {daysOverdue}d overdue
                  </Badge>
                )}
              </div>

              {/* Progress */}
              {(task.status === 'InProgress' ||
                task.status === 'Todo' ||
                task.status === 'OnHold' ||
                task.status === 'Draft') && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {Math.max(0, Math.min(100, task.progress ?? 0))}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        (task.progress ?? 0) >= 100
                          ? 'bg-emerald-500'
                          : (task.progress ?? 0) >= 60
                            ? 'bg-primary'
                            : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.max(0, Math.min(100, task.progress ?? 0))}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider">Due Date</p>
                    <p className="font-medium text-foreground truncate">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>

                {task.assignedUserName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider">
                        Assigned To
                      </p>
                      <p className="font-medium text-foreground truncate">
                        {task.assignedUserName}
                      </p>
                    </div>
                  </div>
                )}

                {task.createdByName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider">
                        Created By
                      </p>
                      <p className="font-medium text-foreground truncate">
                        {task.createdByName}
                      </p>
                    </div>
                  </div>
                )}

                {task.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider">
                        Created
                      </p>
                      <p className="font-medium text-foreground truncate">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              {(task.priority === 'Urgent' || task.priority === 'High') &&
                task.dueDate && (
                  <div className="pt-3 border-t border-border/50">
                    <CountdownTimer dueDate={task.dueDate} />
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        {task.checklist && task.checklist.length > 0 && (
          <ChecklistSection task={task} />
        )}

        {/* Activity & Follow-up */}
        <ActivitySection task={task} />
      </main>

      {/* Sticky bottom action bar */}
      <footer className="sticky bottom-0 z-40 bg-background border-t border-border px-4 py-3 safe-area-bottom">
        {task.status === 'Completed' || task.status === 'Archived' ? (
          <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Task Completed
          </div>
        ) : task.status === 'Cancelled' ? (
          <div className="flex items-center justify-center h-11 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">
            Task Cancelled
          </div>
        ) : (
          <Button
            className="w-full h-11 text-sm font-semibold rounded-xl"
            onClick={() => handleStatusChange('Completed')}
            disabled={updateTask.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {updateTask.isPending ? 'Updating...' : 'Mark Complete'}
          </Button>
        )}
      </footer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{task.title}&rdquo;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
            >
              {deleteTask.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusMenu} onOpenChange={setShowStatusMenu}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg">Change Status</DialogTitle>
            <DialogDescription className="text-sm">
              Select a new status for this task
            </DialogDescription>
          </DialogHeader>
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                  task.status === option.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0',
                    task.status === option.value
                      ? 'bg-white/90'
                      : option.color.replace('bg-', 'bg-')
                  )}
                />
                <span className="font-medium text-sm flex-1">{option.label}</span>
                {task.status === option.value && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}