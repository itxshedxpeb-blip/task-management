'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/states/EmptyState';
import { cn } from '@/lib/utils';
import { TaskCard } from '../shared';
import type { Task } from '../../types';

interface DashboardTaskListWidgetProps {
  title: string;
  icon?: ReactNode;
  tasks: Task[];
  loading?: boolean;
  /** Maximum number of cards to render. */
  max?: number;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onTaskClick: (task: Task) => void;
  /** Optional footer (e.g. a shortcut button). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Reusable dashboard widget that renders a titled list of compact task cards.
 * Used by My Assigned, Critical, and Pending Verification widgets so the
 * dashboard never duplicates list markup.
 */
export function DashboardTaskListWidget({
  title,
  icon,
  tasks,
  loading = false,
  max = 5,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onTaskClick,
  footer,
  className,
}: DashboardTaskListWidgetProps) {
  const visible = tasks.slice(0, max);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            {icon}
            {title}
          </CardTitle>
          {!loading && tasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {loading ? (
          <div className="space-y-2">
            <TaskCard loading />
            <TaskCard loading />
            <TaskCard loading />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} className="py-6" />
        ) : (
          <div className="space-y-2">
            {visible.map((task) => (
              <TaskCard key={task.id} task={task} onClick={onTaskClick} showProgress={false} />
            ))}
          </div>
        )}
        {footer && !loading && <div className="mt-auto pt-2">{footer}</div>}
      </CardContent>
    </Card>
  );
}
