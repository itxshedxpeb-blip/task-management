'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, User, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { getDaysOverdue } from '@/features/task-management/utils/taskFormatters';
import { CountdownTimer } from '@/features/task-management/components/shared/CountdownTimer';
import { StatusSmartBadge, PrioritySmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  showActions?: boolean;
  className?: string;
}

const TaskCard = memo(function TaskCard({
  task,
  onTaskClick,
  onStatusChange,
  onDelete,
  showActions = true,
  className,
}: TaskCardProps) {
  const router = useRouter();
  const daysOverdue = getDaysOverdue(task.dueDate);
  const isOverdue = daysOverdue !== null && daysOverdue > 0;

  const handleCardPress = () => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      router.push(`/app/tasks/${task.id}`);
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]',
        isOverdue && 'border-l-4 border-l-destructive',
        className
      )}
      onClick={handleCardPress}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground leading-tight mb-1 line-clamp-2">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>

        {/* Meta information row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusSmartBadge status={task.status} />
          <PrioritySmartBadge priority={task.priority} />
          {isOverdue && (
            <Badge variant="destructive" className="text-[10px] h-5">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {daysOverdue}d overdue
            </Badge>
          )}
        </div>

        {/* Due date and assignee */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
          
          {task.assignedUserId && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="max-w-[100px] truncate">{task.assignedUserId}</span>
            </div>
          )}
        </div>

        {/* Countdown timer for urgent tasks */}
        {(task.priority === 'Urgent' || task.priority === 'High') && task.dueDate && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <CountdownTimer dueDate={task.dueDate} />
          </div>
        )}

        {/* Quick actions */}
        {showActions && onStatusChange && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-9 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                // Quick status change logic here
              }}
            >
              Quick Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default TaskCard;