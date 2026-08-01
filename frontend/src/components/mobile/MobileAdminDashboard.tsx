'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Users,
  ListTodo,
  AlertTriangle,
  TrendingUp,
  Zap,
  Timer,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarTone } from '@/features/task-management/utils/taskFormatters';
import type { DashboardTaskKPIs } from '@/features/task-management/types';

interface MobileAdminDashboardProps {
  stats: Record<string, any>;
  kpis?: DashboardTaskKPIs | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function KpiTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: any;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-muted/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('h-7 w-7 rounded-lg flex items-center justify-center', tone)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="text-xl font-bold text-foreground leading-tight tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function SkeletonTile() {
  return <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />;
}

export function MobileAdminDashboard({
  stats,
  kpis,
  isLoading = false,
  onRefresh,
}: MobileAdminDashboardProps) {
  const router = useRouter();
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const completedToday = kpis?.completedToday ?? 0;
  const openTasks = kpis?.openTasks ?? 0;
  const overdue = kpis?.overdueTasks ?? stats.overdueTasks ?? 0;
  const totalEmployees = stats.totalEmployees ?? 0;
  const activeTasks = stats.activeTasks ?? 0;
  const completedTasks = kpis?.completedTasks ?? stats.completedTasks ?? 0;
  const completedOnTime = kpis?.completedOnTime ?? stats.completedOnTime ?? 0;
  const completedLate = kpis?.completedLate ?? stats.completedLate ?? 0;
  const totalDepartments = stats.totalDepartments ?? 0;
  const topPerformers = kpis?.topPerformers ?? stats.topPerformers ?? [];

  const todayProgress = completedToday + openTasks > 0
    ? Math.round((completedToday / (completedToday + openTasks)) * 100)
    : 0;

  const onTimeRate = completedTasks > 0
    ? Math.round((completedOnTime / completedTasks) * 100)
    : 0;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs font-medium text-primary px-3 h-9 rounded-full bg-primary/5 active:scale-95 transition-transform"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Today's Summary hero */}
      <div className="px-4 mb-4">
        <Card className="overflow-hidden border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Today&apos;s Progress</h2>
              </div>
              <span className="text-sm font-bold text-primary tabular-nums">{todayProgress}%</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-center">
                <p className="text-xl font-bold text-emerald-600 tabular-nums">{completedToday}</p>
                <p className="text-[10px] text-emerald-700/70 font-medium">Completed Today</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-center">
                <p className="text-xl font-bold text-blue-600 tabular-nums">{openTasks}</p>
                <p className="text-[10px] text-blue-700/70 font-medium">Open Tasks</p>
              </div>
              <div className="rounded-xl bg-red-500/10 p-2.5 text-center">
                <p className="text-xl font-bold text-red-600 tabular-nums">{overdue}</p>
                <p className="text-[10px] text-red-700/70 font-medium">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI grid */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-2.5 px-1">Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            <>
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
              <SkeletonTile />
            </>
          ) : (
            <>
              <KpiTile label="Total Employees" value={totalEmployees} icon={Users} tone="bg-[#f97316]/10 text-[#f97316]" />
              <KpiTile label="Active Tasks" value={activeTasks} icon={ListTodo} tone="bg-blue-500/10 text-blue-500" />
              <KpiTile label="Completed Tasks" value={completedTasks} icon={CheckCircle2} tone="bg-emerald-500/10 text-emerald-500" />
              <KpiTile label="On-Time Rate" value={`${onTimeRate}%`} icon={Zap} tone="bg-sky-500/10 text-sky-500" />
              <KpiTile label="Completed Late" value={completedLate} icon={Timer} tone="bg-orange-500/10 text-orange-500" />
              <KpiTile label="Departments" value={totalDepartments} icon={Layers} tone="bg-violet-500/10 text-violet-500" />
            </>
          )}
        </div>
      </div>

      {/* Top performers */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            Top Performers
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : topPerformers.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No performance data available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {topPerformers.map((emp: any, idx: number) => {
              const rate = Math.max(0, Math.min(100, Math.round(emp.completionRate ?? 0)));
              return (
                <Card
                  key={emp.employeeId ?? idx}
                  className="mobile-card cursor-pointer active:scale-[0.985] transition-transform"
                  onClick={() => router.push(`/admin/employees/${emp.employeeId}`)}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                          idx === 0
                            ? 'bg-amber-500 text-white'
                            : idx === 1
                              ? 'bg-slate-400 text-white'
                              : idx === 2
                                ? 'bg-orange-600 text-white'
                                : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                          getAvatarTone(emp.employeeName)
                        )}
                      >
                        {getInitials(emp.employeeName)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {emp.employeeName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.tasksCompleted ?? 0} completed
                        </p>
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-1.5">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              rate >= 70 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                        {rate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Overdue alert banner */}
      {overdue > 0 && (
        <div className="px-4 mt-4">
          <button
            onClick={() => router.push('/admin/tasks')}
            className="w-full flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 text-left active:scale-[0.985] transition-transform"
          >
            <span className="h-9 w-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-red-700">
                {overdue} task{overdue !== 1 ? 's' : ''} overdue
              </span>
              <span className="block text-xs text-red-600/70">Review and take action</span>
            </span>
            <ChevronRight className="h-4 w-4 text-red-500 flex-shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
}
