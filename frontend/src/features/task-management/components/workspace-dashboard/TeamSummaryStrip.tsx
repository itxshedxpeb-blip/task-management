'use client';

import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { TaskStats } from '../../types';

interface TeamSummaryStripProps {
  stats?: TaskStats;
  loading?: boolean;
  className?: string;
}

interface SummaryItem {
  label: string;
  value: number;
  tone: string;
}

function buildItems(stats?: TaskStats): SummaryItem[] {
  const byStatus = stats?.tasksByStatus;
  return [
    { label: 'Assigned', value: stats?.totalTasks ?? 0, tone: 'text-foreground' },
    { label: 'In Progress', value: byStatus?.['In Progress'] ?? stats?.inProgressTasks ?? 0, tone: 'text-blue-500' },
    { label: 'Review', value: byStatus?.['Review'] ?? 0, tone: 'text-amber-500' },
    { label: 'Completed', value: byStatus?.['Completed'] ?? stats?.completedTasks ?? 0, tone: 'text-green-500' },
    { label: 'Blocked', value: byStatus?.['Blocked'] ?? 0, tone: 'text-red-500' },
  ];
}

/** Lightweight team pulse — simple counters, no charts. */
export function TeamSummaryStrip({ stats, loading = false, className }: TeamSummaryStripProps) {
  const items = buildItems(stats);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Team Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-center"
            >
              {loading ? (
                <Skeleton className="mx-auto h-7 w-10" />
              ) : (
                <p className={cn('text-2xl font-bold tabular-nums', item.tone)}>{item.value}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
