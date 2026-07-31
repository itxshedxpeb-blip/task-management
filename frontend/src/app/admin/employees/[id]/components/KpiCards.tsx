import {
  Activity,
  AlertOctagon,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ListChecks,
  ListX,
  Loader,
  ShieldX,
  Timer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EmployeeTaskSummary } from '@/modules/admin/types/employeePerformance';

type NumericKeyOf<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T];

interface KpiDef {
  key: NumericKeyOf<EmployeeTaskSummary>;
  label: string;
  icon: React.ReactNode;
  className: string;
}

const KPIS: KpiDef[] = [
  { key: 'completedTasks', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, className: 'text-emerald-500' },
  { key: 'activeTasks', label: 'In Progress', icon: <Activity className="h-4 w-4" />, className: 'text-blue-500' },
  { key: 'pendingTasks', label: 'Pending', icon: <Loader className="h-4 w-4" />, className: 'text-yellow-500' },
  { key: 'overdueTasks', label: 'Overdue', icon: <AlertOctagon className="h-4 w-4" />, className: 'text-red-500' },
  { key: 'cancelledTasks', label: 'Cancelled', icon: <ListX className="h-4 w-4" />, className: 'text-gray-400' },
  { key: 'rejectedTasks', label: 'Rejected', icon: <ShieldX className="h-4 w-4" />, className: 'text-rose-500' },
  { key: 'dueToday', label: 'Due Today', icon: <CalendarCheck2 className="h-4 w-4" />, className: 'text-indigo-500' },
  { key: 'dueThisWeek', label: 'Due This Week', icon: <CalendarDays className="h-4 w-4" />, className: 'text-cyan-500' },
  { key: 'dueThisMonth', label: 'Due This Month', icon: <CalendarRange className="h-4 w-4" />, className: 'text-violet-500' },
  { key: 'totalTasks', label: 'Total Tasks', icon: <ListChecks className="h-4 w-4" />, className: 'text-slate-500' },
];

export function KpiCards({ stats }: { stats: EmployeeTaskSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {KPIS.map((kpi) => (
        <Card key={kpi.key}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {kpi.label}
              </span>
              <span className={kpi.className}>{kpi.icon}</span>
            </div>
            <p className={cn('mt-2 text-2xl font-bold tabular-nums', kpi.className)}>
              {stats?.[kpi.key] ?? 0}
            </p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Avg Completion
            </span>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
            {stats?.avgCompletionHours ?? 0}
            <span className="ml-1 text-sm font-medium text-muted-foreground">hrs</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
