'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Gauge,
  Loader,
  RefreshCw,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { dayjs, formatDate } from '@/lib/date-utils';
import {
  usePerformanceReport,
  useReportSummary,
  useTaskReport,
} from '@/modules/admin/hooks/useReports';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

type RangePreset = 'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'last30' | 'custom';

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom' },
];

function resolveRange(preset: RangePreset, customFrom?: string, customTo?: string) {
  const today = dayjs();
  switch (preset) {
    case 'today':
      return { dateFrom: today.format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') };
    case 'yesterday': {
      const d = today.subtract(1, 'day');
      return { dateFrom: d.format('YYYY-MM-DD'), dateTo: d.format('YYYY-MM-DD') };
    }
    case 'thisWeek':
      return {
        dateFrom: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD'),
      };
    case 'thisMonth':
      return { dateFrom: today.startOf('month').format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') };
    case 'last30':
      return { dateFrom: today.subtract(29, 'day').format('YYYY-MM-DD'), dateTo: today.format('YYYY-MM-DD') };
    case 'custom':
      return { dateFrom: customFrom || undefined, dateTo: customTo || undefined };
    default:
      return { dateFrom: undefined, dateTo: undefined };
  }
}

function SimpleBarChart({ data, emptyLabel }: { data: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{key}</span>
            <span className="text-xs font-medium text-foreground tabular-nums">{value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-[#f97316] transition-all duration-500"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
          </div>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tone)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsInner() {
  const searchParams = useSearchParams();
  const employeeId = searchParams?.get('employee') || undefined;
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [preset, setPreset] = useState<RangePreset>('all');
  const [customFrom, setCustomFrom] = useState<string | undefined>();
  const [customTo, setCustomTo] = useState<string | undefined>();

  const range = useMemo(
    () => resolveRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  const taskReportQuery = useTaskReport(range.dateFrom, range.dateTo);
  const performanceQuery = usePerformanceReport(range.dateFrom, range.dateTo, employeeId);
  const summaryQuery = useReportSummary();

  const task = (taskReportQuery.data as any)?.data;
  const performance = (performanceQuery.data as any)?.data as
    | { employeeId: string; employeeName: string; tasksAssigned: number; tasksCompleted: number; tasksPending: number; tasksOverdue: number; completionRate: number; onTimeRate: number }[]
    | undefined;
  const summary = (summaryQuery.data as any)?.data;

  const isLoading = taskReportQuery.isLoading || performanceQuery.isLoading;
  const error = taskReportQuery.error || performanceQuery.error;

  const leaderboard = useMemo(() => {
    if (!performance || performance.length === 0) return null;
    const sorted = [...performance].sort((a, b) => b.completionRate - a.completionRate);
    return {
      top: sorted.slice(0, 5),
      lowest: sorted[sorted.length - 1],
    };
  }, [performance]);

  const rangeLabel =
    range.dateFrom && range.dateTo
      ? `${formatDate(range.dateFrom)} – ${formatDate(range.dateTo)}`
      : 'All time';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-2xl" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load reports.</p>
        <Button variant="outline" onClick={() => { taskReportQuery.refetch(); performanceQuery.refetch(); }}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const statRow = (label: string, value: string | number, className: string) => (
    <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-center">
      <p className={cn('text-lg font-bold tabular-nums', className)}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rangeLabel}
            {employeeId && <Badge variant="outline" className="ml-2 text-[10px]">Filtered by employee</Badge>}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { taskReportQuery.refetch(); performanceQuery.refetch(); summaryQuery.refetch(); }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Date range selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.value}
                size="sm"
                variant={preset === p.value ? 'default' : 'outline'}
                className="h-8 text-xs"
                onClick={() => setPreset(p.value)}
              >
                {p.label}
              </Button>
            ))}
            {preset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="h-8 w-auto text-xs"
                  value={customFrom ?? ''}
                  onChange={(e) => setCustomFrom(e.target.value || undefined)}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  className="h-8 w-auto text-xs"
                  value={customTo ?? ''}
                  onChange={(e) => setCustomTo(e.target.value || undefined)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiTile label="Completion Rate" value={`${task?.completionRate ?? 0}%`} icon={<Gauge className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500" />
        <KpiTile label="Total Tasks" value={task?.totalTasks ?? 0} icon={<BarChart3 className="h-4 w-4" />} tone="bg-blue-500/10 text-blue-500" />
        <KpiTile label="Completed" value={task?.completedTasks ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} tone="bg-emerald-500/10 text-emerald-500" />
        <KpiTile label="Pending" value={task?.pendingTasks ?? 0} icon={<Loader className="h-4 w-4" />} tone="bg-amber-500/10 text-amber-500" />
        <KpiTile label="Overdue" value={task?.overdueTasks ?? 0} icon={<AlertTriangle className="h-4 w-4" />} tone="bg-red-500/10 text-red-500" />
        <KpiTile label="High Priority" value={task?.highPriorityTasks ?? 0} icon={<TrendingUp className="h-4 w-4" />} tone="bg-orange-500/10 text-orange-500" />
        <KpiTile label="Avg Completion" value={`${task?.avgCompletionHours ?? 0}h`} icon={<Timer className="h-4 w-4" />} tone="bg-violet-500/10 text-violet-500" />
        <KpiTile label="Active Users" value={summary?.totalUsers ?? 0} icon={<Users className="h-4 w-4" />} tone="bg-[#f97316]/10 text-[#f97316]" />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {statRow('Completed today', summary?.completedToday ?? 0, 'text-emerald-500')}
        {statRow('Open tasks', summary?.openTasks ?? 0, 'text-blue-500')}
        {statRow('Overdue now', summary?.overdueTasks ?? 0, 'text-red-500')}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> Tasks by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={task?.byStatus || {}} emptyLabel="No tasks in this period" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" /> Tasks by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={task?.byPriority || {}} emptyLabel="No tasks in this period" />
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Employee Performance</CardTitle>
            {range.dateFrom && <Badge variant="outline" className="text-[10px]">{rangeLabel}</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.top.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No performance data available</div>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">Top performer</p>
                    <p className="truncate text-sm font-semibold text-foreground">{leaderboard.top[0].employeeName}</p>
                    <p className="text-xs text-muted-foreground">{leaderboard.top[0].completionRate}% · {leaderboard.top[0].tasksCompleted} done</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-red-500">Needs attention</p>
                    <p className="truncate text-sm font-semibold text-foreground">{leaderboard.lowest.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{leaderboard.lowest.completionRate}% · {leaderboard.lowest.tasksPending} pending</p>
                  </div>
                </div>
              </div>

              {!isDesktop ? (
                <div className="space-y-2.5">
                  {leaderboard.top.map((emp, idx) => (
                    <Card key={emp.employeeId} className="mobile-card">
                      <CardContent className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                            idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-muted text-muted-foreground'
                          )}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{emp.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{emp.tasksCompleted} done · {emp.tasksPending} pending · {emp.tasksOverdue} overdue</p>
                          </div>
                          <span className="text-sm font-bold tabular-nums text-[#f97316]">{emp.completionRate}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead>On-Time</TableHead>
                      <TableHead className="text-right">Completion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.top.map((emp, idx) => (
                      <TableRow key={emp.employeeId}>
                        <TableCell>
                          <span className="text-sm font-bold text-[#f97316]">#{idx + 1}</span>
                        </TableCell>
                        <TableCell className="font-medium">{emp.employeeName}</TableCell>
                        <TableCell className="tabular-nums">{emp.tasksAssigned}</TableCell>
                        <TableCell className="tabular-nums text-emerald-500">{emp.tasksCompleted}</TableCell>
                        <TableCell className="tabular-nums text-amber-500">{emp.tasksPending}</TableCell>
                        <TableCell className="tabular-nums text-red-500">{emp.tasksOverdue}</TableCell>
                        <TableCell className="tabular-nums">{emp.onTimeRate}%</TableCell>
                        <TableCell className="text-right font-bold tabular-nums">{emp.completionRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Reports reflect tasks in the selected period.
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <ReportsInner />
    </Suspense>
  );
}
