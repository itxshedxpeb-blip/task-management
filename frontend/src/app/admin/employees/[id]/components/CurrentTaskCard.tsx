'use client';

import Link from 'next/link';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  PrioritySmartBadge,
  StatusSmartBadge,
} from '@/features/task-management/components/shared/SmartBadge';
import type { EmployeeToday } from '@/modules/admin/types/employeePerformance';

export function CurrentTaskCard({
  today,
  isLoading,
  employeeId,
}: {
  today: EmployeeToday | undefined;
  isLoading: boolean;
  employeeId: string;
}) {
  if (isLoading || !today) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const task = today.currentTask;
  const progress = Math.max(0, Math.min(100, task?.progress ?? 0));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60 bg-primary/[0.04] pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <PlayCircle className="h-4 w-4 text-primary" />
          Current Active Task
        </CardTitle>
        {task && (
          <span className="text-[10px] font-mono font-medium text-muted-foreground">
            TSK-{String(task.taskId).padStart(3, '0')}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {!task ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <PlayCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No task in progress</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The employee is not actively working on a task right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 break-words text-base font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">
                {task.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <StatusSmartBadge status={task.status} />
              <PrioritySmartBadge priority={task.priority} />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold tabular-nums text-foreground">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-primary' : 'bg-amber-500',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button asChild size="sm" className="w-full">
              <Link href={`/app/tasks/${task.id}?from=employee&emp=${employeeId}`}>
                Open Task
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
