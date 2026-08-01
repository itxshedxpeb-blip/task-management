'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PrioritySmartBadge, StatusSmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import type { TaskPriority, TaskStatus } from '@/features/task-management/types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import MobileRichTaskCard from '@/components/mobile/MobileRichTaskCard';

export interface BucketTask {
  id: string;
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress?: number;
  completedAt?: string | null;
}

export function TaskBucket({
  title,
  icon,
  emptyText,
  accent,
  tasks,
  isLoading,
  employeeId,
  maxCount = 8,
}: {
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  accent: string;
  tasks: BucketTask[];
  isLoading?: boolean;
  employeeId: string;
  maxCount?: number;
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const visible = tasks.slice(0, maxCount);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', accent)}>{icon}</span>
          {title}
        </CardTitle>
        <Badge variant="outline" className="text-[10px] font-semibold tabular-nums text-muted-foreground">
          {tasks.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted/40" />
          ))
        ) : visible.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map((task) => (
              <div key={task.id}>
                {isDesktop ? (
                  <Link
                    href={`/app/tasks/${task.id}?from=employee&emp=${employeeId}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <span className="w-[62px] flex-shrink-0 text-[10px] font-mono font-semibold text-muted-foreground">
                      TSK-{String(task.taskId).padStart(3, '0')}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {task.title}
                    </span>
                    {task.progress !== undefined && task.status !== 'Completed' && task.status !== 'Archived' && (
                      <span className="hidden w-24 items-center gap-2 md:flex">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(0, Math.min(100, task.progress ?? 0))}%` }}
                          />
                        </span>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {Math.max(0, Math.min(100, task.progress ?? 0))}%
                        </span>
                      </span>
                    )}
                    <StatusSmartBadge status={task.status} className="hidden sm:inline-flex" />
                    <PrioritySmartBadge priority={task.priority} className="hidden sm:inline-flex" />
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <MobileRichTaskCard
                    task={{
                      id: task.id,
                      taskId: task.taskId,
                      title: task.title,
                      status: task.status,
                      priority: task.priority,
                      progress: task.progress,
                      completedAt: task.completedAt,
                    }}
                    href={`/app/tasks/${task.id}?from=employee&emp=${employeeId}`}
                    showAssignee={false}
                    showCreatedBy={false}
                    compact
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
