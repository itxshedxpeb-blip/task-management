'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Clock,
  MoreVertical,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/dashboard/KPICard';
import { ErrorState } from '@/components/states/ErrorState';
import { Breadcrumbs } from '@/layouts/Breadcrumbs';
import type { KPICard as KPICardType } from '@/types';
import { useTasks, useTaskStats } from '../../hooks/useTaskManagement';
import type { Task, TaskPriority } from '../../types';
import { DashboardTaskListWidget } from './DashboardTaskListWidget';
import { TeamSummaryStrip } from './TeamSummaryStrip';
import { RecentActivityWidget } from './RecentActivityWidget';

/**
 * Mock signed-in manager/admin. Replaced by the real auth/session user once
 * the backend lands — this dashboard is for Manager / Admin / Super Admin.
 */
const CURRENT_USER = { id: 'admin-1', name: 'Admin User' } as const;

/** Frozen workspace routes (built in later phases). */
const ROUTES = {
  taskDetail: (id: string) => `/dashboard/task-management/${id}`,
  createTask: '/dashboard/tasks/create',
  myTasks: '/dashboard/tasks/my-tasks',
  verificationQueue: '/dashboard/tasks/verification',
} as const;

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  None: 4,
};

const ACTIVE_LIST_STATUSES = new Set(['Completed', 'Cancelled']);

export function TaskDashboardWorkspace() {
  const router = useRouter();

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refetchTasks,
  } = useTasks();
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useTaskStats();

  const isLoading = tasksLoading || statsLoading;
  const isError = tasksError || statsError;
  const allTasks = useMemo(() => tasks ?? [], [tasks]);

  const myTasks = useMemo(
    () => allTasks.filter((t) => t.assignedUserId === CURRENT_USER.id),
    [allTasks]
  );

  const criticalTasks = useMemo(
    () =>
      allTasks
        .filter(
          (t) =>
            (t.priority === 'Urgent' || t.priority === 'High') &&
            !ACTIVE_LIST_STATUSES.has(t.status)
        )
        // Priority first, then earliest due date — overdue work naturally rises
        // to the top without reading the clock during render.
        .sort((a, b) => {
          const weight = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
          if (weight !== 0) return weight;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }),
    [allTasks]
  );

  const pendingVerification = useMemo(
    () => allTasks.filter((t) => t.status === 'Review'),
    [allTasks]
  );

  const kpis = useMemo<KPICardType[]>(
    () => [
      {
        title: 'Open Tasks',
        value: stats?.openTasks ?? 0,
        change: 0,
        icon: <CheckSquare className="h-full w-full" />,
        color: 'text-blue-600',
      },
      {
        title: 'Overdue',
        value: stats?.overdueTasks ?? 0,
        change: 0,
        icon: <AlertTriangle className="h-full w-full" />,
        color: 'text-red-600',
      },
      {
        title: 'Completed Today',
        value: stats?.completedToday ?? 0,
        change: 0,
        icon: <CheckCircle2 className="h-full w-full" />,
        color: 'text-green-600',
      },
      {
        title: 'Pending Verification',
        value: stats?.pendingVerification ?? 0,
        change: 0,
        icon: <Clock className="h-full w-full" />,
        color: 'text-amber-600',
      },
    ],
    [stats]
  );

  const handleRefresh = () => {
    void refetchTasks();
    void refetchStats();
  };

  const openTaskDetail = (task: Task) => router.push(ROUTES.taskDetail(task.id));

  return (
    <div className="space-y-6">
      {/* Header: breadcrumb + primary actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumbs />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} aria-label="Refresh dashboard">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => router.push(ROUTES.createTask)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(ROUTES.myTasks)}>
                <User className="mr-2 h-4 w-4" />
                My Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(ROUTES.verificationQueue)}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verification Queue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Unable to load the dashboard"
          message="We couldn't fetch task data. Please try again."
          onRetry={handleRefresh}
          className="rounded-lg border border-border"
        />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px] rounded-xl" />
                ))
              : kpis.map((kpi) => <KPICard key={kpi.title} data={kpi} />)}
          </div>

          {/* Team pulse */}
          <TeamSummaryStrip stats={stats} loading={isLoading} />

          {/* Widget grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DashboardTaskListWidget
              title="My Assigned Tasks"
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              tasks={myTasks}
              loading={isLoading}
              onTaskClick={openTaskDetail}
              emptyIcon={<User className="h-6 w-6" />}
              emptyTitle="Nothing assigned to you"
              emptyDescription="Tasks assigned to you will show up here."
            />

            <DashboardTaskListWidget
              title="Critical Tasks"
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              tasks={criticalTasks}
              loading={isLoading}
              onTaskClick={openTaskDetail}
              emptyIcon={<AlertTriangle className="h-6 w-6" />}
              emptyTitle="No critical tasks"
              emptyDescription="High-priority and critical work will surface here."
            />

            <DashboardTaskListWidget
              title="Pending Verification"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              tasks={pendingVerification}
              loading={isLoading}
              onTaskClick={openTaskDetail}
              emptyIcon={<ShieldCheck className="h-6 w-6" />}
              emptyTitle="Verification queue is clear"
              emptyDescription="Completed tasks awaiting review will appear here."
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(ROUTES.verificationQueue)}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Open Verification Queue
                </Button>
              }
            />

            <RecentActivityWidget tasks={allTasks} loading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
}
