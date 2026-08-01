'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  CalendarClock,
  MessageSquare,
  Paperclip,
  ListChecks,
  User,
  Trash2,
  Clock,
} from 'lucide-react';
import { StatusSmartBadge, PrioritySmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import {
  getDueMeta,
  getInitials,
  getAvatarTone,
  formatTaskAge,
} from '@/features/task-management/utils/taskFormatters';
import type { Task, TaskPriority } from '@/features/task-management/types';

interface RichTask {
  id: string;
  taskId?: number | string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: Task['status'];
  category?: string | null;
  progress?: number;
  dueDate?: Date | string | null;
  createdAt?: Date | string | null;
  completedAt?: Date | string | null;
  assignedUserName?: string | null;
  createdByName?: string | null;
  comments?: { id: string }[];
  attachments?: { id: string }[];
  checklist?: { id: string; completed: boolean }[];
}

interface MobileRichTaskCardProps {
  task: RichTask;
  href?: string;
  onDelete?: (task: RichTask) => void;
  onStatusChange?: (task: RichTask) => void;
  statusActionLabel?: string;
  showAssignee?: boolean;
  showCreatedBy?: boolean;
  compact?: boolean;
  className?: string;
}

const PRIORITY_TONE: Record<string, string> = {
  Urgent: 'text-red-600 bg-red-500/10 border-red-500/30',
  High: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  Low: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  None: 'text-muted-foreground bg-muted border-border/60',
};

const MobileRichTaskCard = memo(function MobileRichTaskCard({
  task,
  href,
  onDelete,
  onStatusChange,
  statusActionLabel,
  showAssignee = true,
  showCreatedBy = true,
  compact = false,
  className,
}: MobileRichTaskCardProps) {
  const router = useRouter();
  const due = getDueMeta(task.dueDate, {
    completed: task.status === 'Completed' || task.status === 'Archived',
  });
  const progress = Math.max(0, Math.min(100, task.progress ?? 0));
  const ref = task.taskId !== undefined ? `TSK-${String(task.taskId).padStart(3, '0')}` : null;

  const commentCount = task.comments?.length ?? 0;
  const attachmentCount = task.attachments?.length ?? 0;
  const checklist = task.checklist ?? [];
  const checklistDone = checklist.filter((c) => c.completed).length;

  const handlePress = () => {
    if (href) router.push(href);
  };

  const dueChipTone =
    due.state === 'overdue'
      ? 'text-red-600 bg-red-500/10 border-red-500/30'
      : due.state === 'due-today'
        ? 'text-orange-600 bg-orange-500/10 border-orange-500/30'
        : due.state === 'due-tomorrow' || due.state === 'due-soon'
          ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
          : 'text-muted-foreground bg-muted border-border/60';

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.985]',
        due.state === 'overdue' && 'border-l-4 border-l-red-500',
        due.state === 'due-today' && 'border-l-4 border-l-orange-500',
        className
      )}
      onClick={handlePress}
    >
      <CardContent className={cn('p-3.5', compact ? 'p-3' : 'p-3.5 sm:p-4')}>
        {/* Meta row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {ref && (
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {ref}
            </span>
          )}
          {task.category && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
              {task.category}
            </Badge>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <StatusSmartBadge
              status={task.status}
              dueDate={task.dueDate}
              completedAt={task.completedAt}
            />
          </div>
        </div>

        {/* Title + description */}
        <div className="mb-2.5">
          <h3
            className={cn(
              'font-semibold text-foreground leading-snug line-clamp-2',
              compact ? 'text-[15px]' : 'text-base'
            )}
          >
            {task.title}
          </h3>
          {task.description && !compact && (
            <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        {/* Chips row: priority + due */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span
            className={cn(
              'inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border',
              PRIORITY_TONE[task.priority ?? 'None'] ?? PRIORITY_TONE.None
            )}
          >
            {task.priority ?? 'None'}
          </span>
          <span
            className={cn(
              'inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-medium border gap-1',
              dueChipTone
            )}
          >
            <CalendarClock className="h-3 w-3" />
            {due.label}
          </span>
          {task.createdAt && (
            <span className="inline-flex items-center h-5 px-1 text-[10px] text-muted-foreground gap-1">
              <Clock className="h-3 w-3" />
              {formatTaskAge(task.createdAt)}
            </span>
          )}
        </div>

        {/* Progress */}
        {(task.status === 'InProgress' ||
          task.status === 'Todo' ||
          task.status === 'OnHold' ||
          task.status === 'Draft') && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  progress === 100
                    ? 'bg-emerald-500'
                    : progress >= 60
                      ? 'bg-primary'
                      : 'bg-amber-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2.5 border-t border-border/50">
          {showAssignee && task.assignedUserName && (
            <span className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                  getAvatarTone(task.assignedUserName)
                )}
              >
                {getInitials(task.assignedUserName)}
              </span>
              <span className="text-[11px] text-muted-foreground truncate max-w-[110px]">
                {task.assignedUserName}
              </span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground flex-shrink-0">
            {checklist.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                {checklistDone}/{checklist.length}
              </span>
            )}
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {commentCount}
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {attachmentCount}
              </span>
            )}
            {showCreatedBy && task.createdByName && !showAssignee && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="max-w-[90px] truncate">{task.createdByName}</span>
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Actions */}
        {(onDelete || onStatusChange) && (
          <div className="flex items-center gap-2 mt-2.5">
            {onStatusChange && (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task);
                }}
              >
                {statusActionLabel ?? 'Mark Complete'}
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default MobileRichTaskCard;
