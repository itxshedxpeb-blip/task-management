'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CalendarDays,
  Eye,
  User,
  RefreshCw,
  ArrowRight,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDashboardStats, useDashboardKPIs, useTodayTasks, useRecentActivity } from '@/modules/dashboard/hooks/useDashboard';
import { useCreateTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { TaskPriority, TaskStatus } from '@/features/task-management/types';

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-500/15 text-red-400 border-red-500/25',
  High: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Low: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-muted text-muted-foreground border-border',
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Review': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'Completed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Blocked': 'bg-red-500/15 text-red-400 border-red-500/25',
  'Cancelled': 'bg-muted text-muted-foreground border-border',
  'Reopened': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

function KPICardSkeleton() {
  return (
    <Card className="hover-translate-none">
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickCreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(user?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      assignedUserId: assignedUserId || user?.id || '',
      incentiveValue: 0,
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Quick Create Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qc-title">Title *</Label>
          <Input
            id="qc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qc-desc">Description</Label>
          <Textarea
            id="qc-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qc-due">Due Date</Label>
            <Input
              id="qc-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={createTask.isPending || !title.trim()}>
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useDashboardKPIs();
  const { data: todayTasks, isLoading: todayLoading, error: todayError, refetch: refetchToday } = useTodayTasks();
  const { data: activities, isLoading: actLoading, error: actError, refetch: refetchAct } = useRecentActivity();
  const [createOpen, setCreateOpen] = useState(false);

  const isLoading = statsLoading || kpisLoading || todayLoading || actLoading;
  const hasError = statsError || kpisError || todayError || actError;

  const handleRetry = () => {
    refetchStats();
    refetchKpis();
    refetchToday();
    refetchAct();
  };

  const kpiCards = [
    {
      label: 'Open Tasks',
      value: stats?.openTasks ?? 0,
      icon: ListTodo,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks ?? 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Completed Today',
      value: stats?.completedToday ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Due This Week',
      value: stats?.dueThisWeek ?? 0,
      icon: CalendarDays,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Pending Reviews',
      value: stats?.pendingVerification ?? 0,
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'My Tasks',
      value: kpis?.openTasks ?? 0,
      icon: User,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  if (hasError && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back. Here is what is happening today.</p>
          </div>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={handleRetry} variant="outline" size="sm">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here is what is happening today.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Quick Create
            </Button>
          </DialogTrigger>
          <QuickCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
          : kpiCards.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="hover-translate-none">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', kpi.bgColor)}>
                        <Icon className={cn('h-4 w-4', kpi.color)} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card className="hover-translate-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
                <Link href="/app/tasks">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {todayLoading ? (
                <ActivitySkeleton />
              ) : todayTasks && todayTasks.length > 0 ? (
                <div className="space-y-2">
                  {todayTasks.slice(0, 8).map((task) => (
                    <Link
                      key={task.id}
                      href={`/app/tasks/${task.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {task.taskId} · {task.assignedUserName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn('text-[10px] border', PRIORITY_COLORS[task.priority])}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px] border', STATUS_COLORS[task.status])}>
                          {task.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks due today. Great work!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="hover-translate-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {actLoading ? (
                <ActivitySkeleton />
              ) : activities && activities.length > 0 ? (
                <div className="space-y-1">
                  {activities.slice(0, 8).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">
                          <span className="font-medium">{task.assignedUserName}</span>{' '}
                          updated <span className="font-medium">{task.title}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {task.taskId} · {new Date(task.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
