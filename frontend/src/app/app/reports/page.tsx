'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTasks } from '@/modules/tasks/hooks/useTasks';
import { dayjs } from '@/lib/date-utils';

const STATUS_COLORS: Record<string, string> = {
  Todo: 'text-blue-400 bg-blue-500/10',
  InProgress: 'text-orange-400 bg-orange-500/10',
  Completed: 'text-emerald-400 bg-emerald-500/10',
  CompletedLate: 'text-emerald-400 bg-emerald-500/10',
  OnHold: 'text-yellow-400 bg-yellow-500/10',
  Draft: 'text-gray-400 bg-gray-500/10',
};

export default function ReportsPage() {
  const { data, isLoading, error, refetch } = useTasks({ pageSize: 500, showAll: true });

  const tasks = data?.rows || [];
  const todayKey = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD');

  // Auto-refresh when page gains focus
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Completed' || t.status === 'CompletedLate').length,
    inProgress: tasks.filter((t) => t.status === 'InProgress').length,
    todo: tasks.filter((t) => t.status === 'Todo').length,
    onHold: tasks.filter((t) => t.status === 'OnHold').length,
    draft: tasks.filter((t) => t.status === 'Draft').length,
    overdue: tasks.filter((t) => {
      if (!t.dueDate || (typeof t.dueDate === 'object' && Object.keys(t.dueDate).length === 0)) return false;
      const dueDateIST = dayjs(new Date(t.dueDate)).tz('Asia/Kolkata').format('YYYY-MM-DD');
      return dueDateIST < todayKey && t.status !== 'Completed' && t.status !== 'CompletedLate';
    }).length,
    dueToday: tasks.filter((t) => {
      if (!t.dueDate || (typeof t.dueDate === 'object' && Object.keys(t.dueDate).length === 0)) return false;
      const dueDateIST = dayjs(new Date(t.dueDate)).tz('Asia/Kolkata').format('YYYY-MM-DD');
      return dueDateIST === todayKey;
    }).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="font-medium mb-4">Failed to load reports</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">Task performance overview</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Completion Rate Card */}
            <Card className="p-4 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Completion Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{completionRate}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{stats.total}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">{stats.completed}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">{stats.inProgress}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold text-destructive">{stats.overdue}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">Todo</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{stats.todo}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">On Hold</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">{stats.onHold}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-muted-foreground">Draft</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-400">{stats.draft}</span>
                </CardContent>
              </Card>

              <Card className="p-4 rounded-2xl border border-border">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-muted-foreground">Due Today</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-400">{stats.dueToday}</span>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card className="p-4 rounded-2xl border border-border">
              <CardContent className="p-0">
                <h3 className="text-base font-semibold text-foreground mb-4">Status Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(STATUS_COLORS).map(([status, colorClass]) => {
                    const count = tasks.filter((t) => t.status === status).length;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{status}</span>
                          <span className="text-sm text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn('h-full rounded-full transition-all duration-500', colorClass)}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
