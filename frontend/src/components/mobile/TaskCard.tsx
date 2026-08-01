'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  ChevronRight,
  CalendarClock,
  ListChecks,
  Trash2,
  Clock,
  User,
} from 'lucide-react';
import { StatusSmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import {
  getDueMeta,
  formatTaskAge,
} from '@/features/task-management/utils/taskFormatters';
import type { Task, TaskStatus } from '@/features/task-management/types';

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
  className?: string;
}

const PRIORITY_TONE: Record<string, string> = {
  Urgent: 'text-red-600 bg-red-500/10 border-red-500/30',
  High: 'text-orange-600 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  Low: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  None: 'text-muted-foreground bg-muted border-border/60',
};

const TaskCard = memo(function TaskCard({
  task,
  onTaskClick,
  onStatusChange,
  onDelete,
  showActions = true,
  className,
}: TaskCardProps) {
  const router = useRouter();
  const due = getDueMeta(task.dueDate, {
    completed: task.status === 'Completed' || task.status === 'Archived',
  });
  const progress = Math.max(0, Math.min(100, task.progress ?? 0));
  const ref = task.taskId !== undefined ? `TSK-${String(task.taskId).padStart(3, '0')}` : null;

  const checklist = task.checklist ?? [];
  const checklistDone = checklist.filter((c) => c.completed).length;

  const handleCardPress = () => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      router.push(`/app/tasks/${task.id}`);
    }
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
      onClick={handleCardPress}
    >
      <CardContent className="p-3.5 sm:p-4">
        {/* Meta row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {ref && (
            <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
              {ref}
            </span>
          )}
          {task.category && (
            <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-medium text-muted-foreground bg-muted border border-border/60">
              {task.category}
            </span>
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
          <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span
            className={cn(
              'inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border',
              PRIORITY_TONE[task.priority] ?? PRIORITY_TONE.None
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
          {task.createdByName && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[45%]">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">by {task.createdByName}</span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground flex-shrink-0">
            {checklist.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                {checklistDone}/{checklist.length}
              </span>
            )}
            {onDelete && showActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Quick status change */}
        {showActions && onStatusChange && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task.id, task.status === 'Completed' ? 'Todo' : 'Completed');
            }}
            className="mt-2.5 w-full h-9 rounded-xl border border-primary/30 text-primary text-xs font-semibold bg-primary/5 active:scale-[0.99] transition-transform"
          >
            {task.status === 'Completed' ? 'Mark as Incomplete' : 'Mark Complete'}
          </button>
        )}
      </CardContent>
    </Card>
  );
});

export default TaskCard;
