'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../constants/taskConfig';
import { isCompletedLate, getDaysOverdue, getCountdownLabel } from '../../utils/taskFormatters';
import type { TaskStatus, TaskPriority } from '../../types';
import { AlertTriangle, Clock } from 'lucide-react';

interface StatusSmartBadgeProps {
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  className?: string;
}

/**
 * Smart status badge that overlays Overdue/Late indicators.
 * Never hides lateness — if a task is overdue, the badge shows it.
 */
export function StatusSmartBadge({ status, priority, dueDate, completedAt, className }: StatusSmartBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const };
  const daysOverdue = getDaysOverdue(dueDate);
  const completedLate = isCompletedLate(dueDate, completedAt, status);
  const isOverdue = status !== 'Completed' && status !== 'Archived' && status !== 'Cancelled' && daysOverdue !== null && daysOverdue > 0;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Badge variant={config.variant} className={cn(config.className, 'text-[10px]')}>
        {config.label}
      </Badge>
      {isOverdue && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
          <AlertTriangle className="h-2.5 w-2.5" />
          {daysOverdue}d
        </span>
      )}
      {completedLate && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-500">
          <Clock className="h-2.5 w-2.5" />
          Late
        </span>
      )}
    </span>
  );
}

interface PrioritySmartBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PrioritySmartBadge({ priority, className }: PrioritySmartBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? { label: priority, variant: 'outline' as const };
  return (
    <Badge variant={config.variant} className={cn(config.className, 'text-[10px]', className)}>
      {config.label}
    </Badge>
  );
}
