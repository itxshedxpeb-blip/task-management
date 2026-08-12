'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/date-utils';
import {
  useEmployeePerformance,
  useEmployeeTasks,
  useEmployeeTimeline,
} from '@/modules/admin/hooks/useEmployeePerformance';
import { useTaskSocket } from '@/modules/tasks/hooks/useTasks';
import type {
  EmployeePerformance,
  EmployeeTaskRow,
} from '@/modules/admin/types/employeePerformance';
import type { TaskStatus, TaskPriority } from '@/features/task-management/types';

const PENDING_STATUSES: TaskStatus[] = ['Draft', 'Todo', 'InProgress', 'OnHold'];

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom';

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>() ?? {};
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const socket = useTaskSocket();

  const { data, isLoading, error, refetch } = useEmployeePerformance(id);
  const timelineQuery = useEmployeeTimeline(id);

  const tasksQuery = useEmployeeTasks(id, {
    page: 1,
    pageSize: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const employee = (data as any)?.data as EmployeePerformance | undefined;
  const timeline = (timelineQuery.data as any)?.data ?? [];
  const allTasks = ((tasksQuery.data as any)?.data?.rows || []) as EmployeeTaskRow[];

  useEffect(() => {
    if (!socket) return;

    const handleTaskEvent = () => {
      refetch();
      tasksQuery.refetch();
      timelineQuery.refetch();
    };

    socket.on('task:created', handleTaskEvent);
    socket.on('task:updated', handleTaskEvent);
    socket.on('task:completed', handleTaskEvent);
    socket.on('task:deleted', handleTaskEvent);

    return () => {
      socket.off('task:created', handleTaskEvent);
      socket.off('task:updated', handleTaskEvent);
      socket.off('task:completed', handleTaskEvent);
      socket.off('task:deleted', handleTaskEvent);
    };
  }, [socket, refetch, tasksQuery, timelineQuery]);

  if (error && !isLoading) {
    return (
      <div className="p-4">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <p className="mb-4 font-medium text-slate-800">Failed to load employee</p>
          <Button onClick={() => refetch()} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !employee) {
    return <PageSkeleton />;
  }

  // Filter tasks based on date filter
  const filterTasksByDate = (tasks: EmployeeTaskRow[], filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      switch (filter) {
        case 'today':
          return taskDate >= today;
        case 'yesterday':
          return taskDate >= yesterday && taskDate < today;
        case 'week':
          return taskDate >= weekStart;
        case 'month':
          return taskDate >= monthStart;
        case 'custom':
          return true; // TODO: Implement custom range
        default:
          return true;
      }
    });
  };

  const filteredTasks = filterTasksByDate(allTasks, dateFilter);
  
  // Calculate daily summary
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');
  const completedLateTasks = filteredTasks.filter((t) => t.status === 'CompletedLate');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'InProgress');
  const incompleteTasks = filteredTasks.filter((t) => t.status === 'Incomplete');
  const overdueTasks = filteredTasks.filter((t) => t.status === 'Overdue');

  // Filter timeline for meaningful events only
  const meaningfulEvents = timeline.filter((event: any) => {
    const desc = event.description?.toLowerCase() || '';
    return (
      desc.includes('created') ||
      desc.includes('started') ||
      desc.includes('progress') ||
      desc.includes('completed') ||
      desc.includes('late') ||
      desc.includes('overdue')
    );
  });

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'None': return 'text-slate-400 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // Get status color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'CompletedLate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Incomplete': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'InProgress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'OnHold': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Cancelled': return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'Draft':
      case 'Todo':
      case 'Archived':
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Employee Header */}
      <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {employee.name?.charAt(0).toUpperCase()}
            </div>
            <div className={cn(
              "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white",
              employee.isActive ? "bg-green-500" : "bg-slate-400"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 truncate">{employee.name}</h1>
            <p className="text-sm text-slate-500">{employee.role || 'Employee'}</p>
            <Badge variant={employee.isActive ? "default" : "secondary"} className="text-xs mt-1">
              {employee.isActive ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Task History - Date Filter */}
      <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Task History</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 -mx-1">
          {(
            [
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'custom', label: 'Custom' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={cn(
                "flex-shrink-0 min-w-[90px] h-12 px-4 rounded-2xl text-sm font-medium transition-all duration-200",
                "relative overflow-hidden",
                dateFilter === filter.value
                  ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active:bg-slate-100"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {filter.label}
                {dateFilter === filter.value && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {dateFilter === filter.value && (
                <div className="absolute inset-0 bg-blue-600 opacity-0 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Daily Summary - Mobile */}
      <Card className="lg:hidden p-5 rounded-3xl shadow-sm border-0 bg-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Daily Summary</h2>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short' })}
          </p>
        </div>

        {totalTasks === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-base font-medium text-slate-600">Nothing pending today</p>
            <p className="text-sm text-slate-400">Enjoy your day!</p>
          </div>
        ) : (
          <>
            {/* Progress Ring */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - completedTasks.length / totalTasks)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-800">
                    {Math.round((completedTasks.length / totalTasks) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600">Today&apos;s Progress</p>
              <p className="text-xs text-slate-400">Completed {completedTasks.length} / {totalTasks} Tasks</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Completed */}
              <div className="p-5 rounded-3xl bg-green-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-green-600 mb-1">{completedTasks.length}</p>
                <p className="text-xs font-medium text-green-700">Completed</p>
              </div>

              {/* In Progress */}
              <div className="p-5 rounded-3xl bg-blue-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-blue-600 mb-1">{inProgressTasks.length}</p>
                <p className="text-xs font-medium text-blue-700">In Progress</p>
              </div>

              {/* Late */}
              <div className="p-5 rounded-3xl bg-orange-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '300ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-orange-600 mb-1">{completedLateTasks.length}</p>
                <p className="text-xs font-medium text-orange-700">Late</p>
              </div>

              {/* Incomplete */}
              <div className="p-5 rounded-3xl bg-red-50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '400ms' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-red-600 mb-1">{incompleteTasks.length}</p>
                <p className="text-xs font-medium text-red-700">Incomplete</p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Daily Summary - Desktop */}
      <Card className="hidden lg:block p-4 rounded-2xl shadow-sm border-0 bg-white">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Daily Summary</h2>
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center p-2 rounded-lg bg-slate-50">
            <p className="text-xl font-bold text-slate-800">{totalTasks}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50">
            <p className="text-xl font-bold text-green-600">{completedTasks.length}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50">
            <p className="text-xl font-bold text-blue-600">{inProgressTasks.length}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50">
            <p className="text-xl font-bold text-red-600">{overdueTasks.length}</p>
            <p className="text-xs text-slate-500">Overdue</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50">
            <p className="text-xl font-bold text-amber-600">{incompleteTasks.length}</p>
            <p className="text-xs text-slate-500">Incomplete</p>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">
          Tasks ({filteredTasks.length})
        </h2>
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => router.push(`/app/tasks/${task.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-800 line-clamp-2 flex-1 mr-2">
                  {task.title}
                </h3>
                <Badge className={cn("text-xs whitespace-nowrap", getPriorityColor(task.priority))}>
                  {task.priority}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={cn("text-xs", getStatusColor(task.status))}>
                  {task.status}
                </Badge>
                <span className="text-xs text-slate-500">
                  Progress: {task.progress}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDateTime(task.createdAt)}</span>
                </div>
                {task.startDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Started: {formatDateTime(task.startDate)}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span>Updated: {formatDateTime(task.updatedAt)}</span>
              </div>
              {task.completedAt && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Completed: {formatDateTime(task.completedAt)}</span>
                </div>
              )}
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No tasks for this period</p>
          )}
        </div>
      </Card>

      {/* Activity Log */}
      <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Activity Log</h2>
        <div className="space-y-3">
          {meaningfulEvents.slice(0, 10).map((event: any, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{event.description}</p>
                <p className="text-xs text-slate-500">{event.performedByName}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {event.createdAt ? formatDateTime(event.createdAt) : ''}
              </span>
            </div>
          ))}
          {meaningfulEvents.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No activity</p>
          )}
        </div>
      </Card>

      {/* End-of-Day Status */}
      <Card className="p-4 rounded-2xl shadow-sm border-0 bg-white">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">End-of-Day Status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
            <span className="text-sm text-slate-700">Completed</span>
            <span className="text-sm font-semibold text-green-600">{completedTasks.length}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
            <span className="text-sm text-slate-700">Completed Late</span>
            <span className="text-sm font-semibold text-amber-600">{completedLateTasks.length}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
            <span className="text-sm text-slate-700">Incomplete</span>
            <span className="text-sm font-semibold text-red-600">{incompleteTasks.length}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
            <span className="text-sm text-slate-700">Overdue</span>
            <span className="text-sm font-semibold text-orange-600">{overdueTasks.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
