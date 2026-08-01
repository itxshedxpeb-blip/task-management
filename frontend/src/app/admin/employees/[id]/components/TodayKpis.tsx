'use client';

import {
  AlertOctagon,
  CalendarClock,
  CheckCircle2,
  Loader,
  PlayCircle,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { EmployeePerformance, EmployeeToday } from '@/modules/admin/types/employeePerformance';

export function TodayKpis({
  today,
  employee,
  isLoading,
}: {
  today: EmployeeToday | undefined;
  employee: EmployeePerformance | undefined;
  isLoading: boolean;
}) {
  const c = today?.counts;
  const inProgress = employee?.stats.statusCounts?.InProgress ?? 0;
  const completionRate = employee?.stats.completionRate ?? 0;
  const hasCurrentTask = Boolean(today?.currentTask ?? employee?.stats.currentTask);

  const tiles = [
    {
      label: 'Completed',
      value: String(c?.completedToday ?? 0),
      icon: <CheckCircle2 className="h-4 w-4" />,
      className: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pending',
      value: String(c?.pending ?? 0),
      icon: <Loader className="h-4 w-4" />,
      className: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'In Progress',
      value: String(inProgress),
      icon: <PlayCircle className="h-4 w-4" />,
      className: 'text-sky-500',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'Overdue',
      value: String(c?.overdue ?? 0),
      icon: <AlertOctagon className="h-4 w-4" />,
      className: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Due Today',
      value: String(c?.dueToday ?? 0),
      icon: <CalendarClock className="h-4 w-4" />,
      className: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: <Target className="h-4 w-4" />,
      className: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Current Task',
      value: hasCurrentTask ? '1' : '0',
      icon: <Timer className="h-4 w-4" />,
      className: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      label: "Today's Productivity",
      value: `${today?.productivityToday ?? 0}%`,
      icon: <TrendingUp className="h-4 w-4" />,
      className: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
  ];

  if (isLoading || !today || !employee) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="rounded-2xl border-border/60">
          <CardContent className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
                {tile.label}
              </span>
              <span
                className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                  tile.bg,
                  tile.className,
                )}
              >
                {tile.icon}
              </span>
            </div>
            <p className={cn('mt-1.5 text-2xl font-bold leading-none tabular-nums', tile.className)}>
              {tile.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
