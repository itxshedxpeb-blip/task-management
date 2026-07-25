'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ProgressBar } from './ProgressBar';
import { DateDisplay } from './DateDisplay';
import type { Task } from '../../types';

interface TaskCardProps {
  task?: Task;
  onClick?: (task: Task) => void;
  selected?: boolean;
  loading?: boolean;
  showProgress?: boolean;
  showAssignee?: boolean;
  className?: string;
}

const TERMINAL_STATUSES = new Set(['Completed', 'Cancelled']);

/**
 * Single, props-driven task card used across My Tasks, Team Tasks, Dashboard and
 * Task Views. There is intentionally no per-screen variant — behaviour is
 * controlled entirely through props.
 */
export function TaskCard({
  task,
  onClick,
  selected = false,
  loading = false,
  showProgress = true,
  showAssignee = true,
  className,
}: TaskCardProps) {
  if (loading || !task) {
    return (
      <Card className={cn('hover:translate-y-0 hover:shadow-sm', className)}>
        <CardContent className="space-y-3 p-3">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const interactive = typeof onClick === 'function';
  const isCompleted = TERMINAL_STATUSES.has(task.status);

  const handleActivate = () => onClick?.(task);

  return (
    <Card
      className={cn(
        'transition-shadow',
        interactive && 'cursor-pointer',
        selected && 'ring-2 ring-ring',
        className,
      )}
      onClick={interactive ? handleActivate : undefined}
      {...(interactive
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-label': `Open task ${task.title}`,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleActivate();
              }
            },
          }
        : {})}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 flex-1 text-sm font-medium">{task.title}</p>
          {task.taskId && (
            <span className="shrink-0 text-[10px] font-mono text-muted-foreground">{task.taskId}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {task.linkedModule && task.linkedModule !== 'General' && (
            <Badge variant="secondary" className="text-[10px]">
              {task.linkedModule}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {showAssignee ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar name={task.assignedUserName} size="xs" />
              <span className="truncate text-xs text-muted-foreground">{task.assignedUserName}</span>
            </div>
          ) : (
            <span />
          )}
          <DateDisplay date={task.dueDate} mode="due" completed={isCompleted} />
        </div>

        {showProgress && typeof task.progress === 'number' && task.progress > 0 && (
          <ProgressBar value={task.progress} size="sm" showLabel label={`${task.title} progress`} />
        )}
      </CardContent>
    </Card>
  );
}
