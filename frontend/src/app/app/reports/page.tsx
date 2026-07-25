'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTaskStats, useEmployeePerformance } from '@/features/task-management/hooks/useTaskManagement';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4', '#f97316'];

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="hover-translate-none">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover-translate-none">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="hover-translate-none">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useTaskStats();
  const { data: performance, isLoading: perfLoading, error: perfError, refetch: refetchPerf } = useEmployeePerformance();

  const isLoading = statsLoading || perfLoading;

  const statusChartData = useMemo(() => {
    if (!stats?.tasksByStatus) return [];
    return Object.entries(stats.tasksByStatus).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [stats]);

  const priorityChartData = useMemo(() => {
    if (!stats?.tasksByPriority) return [];
    return Object.entries(stats.tasksByPriority).map(([priority, count]) => ({
      name: priority,
      value: count,
    }));
  }, [stats]);

  const leaderboard = useMemo(() => {
    if (!performance) return [];
    return [...performance]
      .sort((a, b) => b.totalPerformanceScore - a.totalPerformanceScore)
      .slice(0, 10);
  }, [performance]);

  if ((statsError || perfError) && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Analytics and reports for your workspace.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load reports</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => { refetchStats(); refetchPerf(); }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Analytics and reports for your workspace.</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {isLoading ? (
        <ReportSkeleton />
      ) : (
        <>
          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-translate-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Tasks</p>
                  <Target className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalTasks || 0}</p>
              </CardContent>
            </Card>
            <Card className="hover-translate-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.completedTasks || 0}</p>
              </CardContent>
            </Card>
            <Card className="hover-translate-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overdue</p>
                  <Clock className="h-4 w-4 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.overdueTasks || 0}</p>
              </CardContent>
            </Card>
            <Card className="hover-translate-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Review</p>
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.pendingVerification || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="hover-translate-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tasks by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {statusChartData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="hover-translate-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tasks by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                {priorityChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {priorityChartData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Employee Leaderboard */}
          <Card className="hover-translate-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Employee Leaderboard
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No performance data available</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((person, idx) => (
                    <div
                      key={person.employeeId}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                        idx === 0 ? 'bg-amber-500/15 text-amber-400' :
                        idx === 1 ? 'bg-slate-300/15 text-slate-400' :
                        idx === 2 ? 'bg-orange-500/15 text-orange-400' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{person.employeeName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {person.tasksCompleted}/{person.tasksAssigned} completed
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(person.completionRate)}% rate
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{person.totalPerformanceScore}</p>
                        <p className="text-[10px] text-muted-foreground">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
