'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Tag,
  RefreshCw,
  Send,
  Plus,
  Circle,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  XCircle,
  Timer,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useTaskDetail,
  useUpdateTask,
  useAddComment,
  useToggleChecklistItem,
} from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { TaskStatus, TaskPriority, Task, ChecklistItem, Comment, TaskActivity } from '@/features/task-management/types';

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

const STATUS_FLOW: TaskStatus[] = ['Pending', 'In Progress', 'Blocked', 'Review', 'Completed', 'Cancelled'];

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
          <Skeleton className="h-32 w-full" />
        </div>
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
    <Card className="hover-translate-none">
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
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!commentText.trim() || addComment.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{comment.userName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
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
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const handleToggle = async (item: ChecklistItem) => {
    await toggleItem.mutateAsync({
      taskId: task.id,
      itemId: item.id,
      completed: !item.completed,
    });
  };

  return (
    <Card className="hover-translate-none">
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
          <p className="text-sm text-muted-foreground text-center py-4">No checklist items.</p>
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
                      item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
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

  if (activities.length === 0) {
    return (
      <Card className="hover-translate-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No activity recorded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-translate-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity Timeline ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 relative">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                  <Circle className="h-2 w-2 fill-primary text-primary" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.performedByName} · {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AttachmentsSection({ task }: { task: Task }) {
  const attachments = task.attachments || [];

  return (
    <Card className="hover-translate-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Attachments ({attachments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No attachments.</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{att.fileName}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                  {(att.fileSize / 1024).toFixed(0)}KB
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { user } = useAuth();
  const { data: task, isLoading, error, refetch } = useTaskDetail(taskId);
  const updateTask = useUpdateTask();

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load task</p>
            <p className="text-sm text-muted-foreground mb-4">The task may not exist or you may lack access.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
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

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{task.taskId}</p>
        </div>
        <div className="flex items-center gap-2">
          {task.status !== 'Completed' && task.status !== 'Cancelled' && (
            <>
              {task.status === 'Review' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('In Progress')}
                    disabled={updateTask.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('Completed')}
                    disabled={updateTask.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Complete
                  </Button>
                </>
              ) : statusIndex < STATUS_FLOW.indexOf('Completed') ? (
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
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {task.description && (
            <Card className="hover-translate-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          <ChecklistSection task={task} />
          <CommentSection task={task} />
          <ActivityTimeline task={task} />
          <AttachmentsSection task={task} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="hover-translate-none">
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
                  <span className="text-sm text-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              {task.startDate && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Start Date</p>
                  <span className="text-sm text-foreground">{new Date(task.startDate).toLocaleDateString()}</span>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Progress</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{task.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card className="hover-translate-none">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                Time Tracking
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

          {/* Labels */}
          {task.tags && task.tags.length > 0 && (
            <Card className="hover-translate-none">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Tag className="h-3.5 w-3.5" />
                  Labels
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category */}
          {task.category && (
            <Card className="hover-translate-none">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
                <Badge variant="outline">{task.category}</Badge>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="hover-translate-none">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Details
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Created</span>
                  <span className="text-[10px] text-foreground">{new Date(task.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">Updated</span>
                  <span className="text-[10px] text-foreground">{new Date(task.updatedAt).toLocaleString()}</span>
                </div>
                {task.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Completed</span>
                    <span className="text-[10px] text-foreground">{new Date(task.completedAt).toLocaleString()}</span>
                  </div>
                )}
                {task.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Verified</span>
                    <span className="text-[10px] text-foreground">{new Date(task.verifiedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
