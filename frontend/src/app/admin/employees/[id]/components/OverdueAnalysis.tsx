'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertOctagon, CheckCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/features/task-management/components/shared/StatusBadge';
import { useEmployeeTasks } from '@/modules/admin/hooks/useEmployeePerformance';
import type { EmployeeTaskRow, EmployeeTaskSummary } from '@/modules/admin/types/employeePerformance';

export function OverdueAnalysis({
  employeeId,
  stats,
}: {
  employeeId: string;
  stats: EmployeeTaskSummary | null;
}) {
  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 5,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    }),
    [],
  );
  const { data, isLoading } = useEmployeeTasks(employeeId, params);

  const overdueTasks: EmployeeTaskRow[] = (data as any)?.data?.rows?.filter(
    (task: EmployeeTaskRow) => task.status === 'Overdue' || task.status === 'CompletedLate'
  ) || [];
  const overdueCount = stats?.overdueTasks ?? 0;
  const hasOverdue = overdueCount > 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">Late Tasks</CardTitle>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            hasOverdue ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400',
          )}
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          {overdueCount} late
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdueCount === 0 ? (
          <div className="py-6 text-center">
            <CheckCheck className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-xs text-muted-foreground">No late tasks right now.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs text-muted-foreground">Daily deadline impact</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {stats?.workloadLevel === 'high'
                  ? 'High — late tasks are driving workload beyond safe capacity.'
                  : 'Moderate — keep an eye on pending daily deadlines.'}
              </p>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : overdueTasks.length === 0 ? (
                <p className="py-2 text-center text-xs text-muted-foreground">No late tasks listed.</p>
              ) : (
                overdueTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/app/tasks/${task.id}`}
                    className="block rounded-md border border-border/60 bg-muted/30 p-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-xs font-medium text-foreground">{task.title}</p>
                      <StatusBadge status={task.status} className="shrink-0 text-[10px]" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
