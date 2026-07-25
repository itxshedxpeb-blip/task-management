'use client';

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { cn } from '@/lib/utils';
import { Avatar } from '../shared';
import { formatRelativeDate } from '../../utils';
import type { Task } from '../../types';

interface RecentActivityWidgetProps {
  tasks: Task[];
  loading?: boolean;
  max?: number;
  className?: string;
}

interface ActivityRow {
  id: string;
  description: string;
  performedByName: string;
  taskTitle: string;
  timestamp: Date;
}

/**
 * Lightweight, dark-mode-safe activity feed built from the activity history
 * already present on tasks. No new data source is introduced.
 */
export function RecentActivityWidget({ tasks, loading = false, max = 10, className }: RecentActivityWidgetProps) {
  const rows = useMemo<ActivityRow[]>(() => {
    const all: ActivityRow[] = [];
    for (const task of tasks) {
      for (const activity of task.activityHistory ?? []) {
        all.push({
          id: activity.id,
          description: activity.description,
          performedByName: activity.performedByName,
          taskTitle: task.title,
          timestamp: new Date(activity.timestamp),
        });
      }
    }
    all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return all.slice(0, max);
  }, [tasks, max]);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-start gap-3">
                <Skeleton className="h-7 w-7 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-6 w-6" />}
            title="No recent activity"
            description="Task updates will appear here."
            className="py-6"
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="flex items-start gap-3">
                <Avatar name={row.performedByName} size="sm" className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{row.description}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    <span className="font-medium">{row.performedByName}</span>
                    {' · '}
                    {row.taskTitle}
                    {' · '}
                    {formatRelativeDate(row.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
