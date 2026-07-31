'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Tag,
  RefreshCw,
  Send,
  Circle,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
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
  useAddComment,
  useToggleChecklistItem,
  useDeleteTask,
} from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { Task, ChecklistItem, Comment, TaskActivity, TaskStatus } from '@/features/task-management/types';
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

function CommentSection({ task }: { task: Task }) {
  const { user } = useAuth();
  const addComment = useAddComment();
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment.mutateAsync({ id: task.id, text: commentText.trim() });
    setCommentText('');
  };

  const comments: Comment[] = task.comments || [];

  return (
    <Card className="mobile-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 h-10"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full"
            disabled={!commentText.trim() || addComment.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 rounded-xl bg-muted/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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

function ActivityTimeline({ task }: { task: Task }) {
  const activities: TaskActivity[] = task.activityHistory || [];

  return (
    <Card className="mobile-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity recorded.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 relative"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                    <Circle className="h-2 w-2 fill-primary text-primary" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm text-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.performedByName} ·{' '}
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MobileTaskDetail() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;
  const { user } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { data: task, isLoading, error, refetch } = useTaskDetail(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // If desktop, use original detail page
  if (isDesktop) {
    const TaskDetailPage = require('@/app/app/tasks/[id]/page').default;
    return <TaskDetailPage />;
  }

  const handleDelete = async () => {
    if (task) {
      await deleteTask.mutateAsync(task.id);
      router.back();
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* App Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground flex-1 truncate">
              Task Details
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
      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
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
                {isOverdue && (
                  <Badge variant="destructive" className="text-[10px] h-5">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {daysOverdue}d overdue
                  </Badge>
                )}
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider">Due Date</p>
                    <p className="font-medium text-foreground">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </div>

                {task.assignedUserId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider">
                        Assigned To
                      </p>
                      <p className="font-medium text-foreground truncate">
                        {task.assignedUserId}
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

        {/* Comments */}
        <CommentSection task={task} />

        {/* Activity Timeline */}
        <ActivityTimeline task={task} />
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Select a new status for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                  task.status === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    option.color
                  )}
                />
                <span className="font-medium">{option.label}</span>
                {task.status === option.value && (
                  <CheckCircle2 className="h-4 w-4 ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}