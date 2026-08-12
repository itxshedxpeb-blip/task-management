'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, Suspense } from 'react';
import {
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Timer,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useTaskSocket } from '@/modules/tasks/hooks/useTasks';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { MobileAdminDashboard } from '@/components/mobile/MobileAdminDashboard';
import { useDashboardTaskKPIs } from '@/features/task-management/hooks/useTaskManagement';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <Card className="!hover:-translate-y-0 !hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const socket = useTaskSocket();
  
  // Parallel API calls for dashboard data
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
  });
  const { data: kpis } = useDashboardTaskKPIs();

  const d = (stats as any)?.data || stats || {};
  const dKpis = (kpis as any)?.data || kpis || null;

  // Set up Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskEvent = () => {
      refetch();
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
  }, [socket, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load dashboard data.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const completedTasks = dKpis?.completedTasks ?? d.completedTasks ?? 0;
  const completedOnTime = dKpis?.completedOnTime ?? d.completedOnTime ?? 0;
  const onTimeRate = completedTasks > 0 ? Math.round((completedOnTime / completedTasks) * 100) : 0;

  const kpiCards = [
    { label: 'Total Employees', value: d.totalEmployees ?? 0, icon: Users, color: 'bg-[#f97316]/10 text-[#f97316]' },
    { label: 'Active Tasks', value: d.activeTasks ?? 0, icon: CheckSquare, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Completed Tasks', value: completedTasks, icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'On-Time Rate', value: `${onTimeRate}%`, icon: Zap, color: 'bg-sky-500/10 text-sky-500' },
    { label: 'Completed Late', value: dKpis?.completedLate ?? d.completedLate ?? 0, icon: Timer, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Completed Today', value: dKpis?.completedToday ?? 0, icon: CheckSquare, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Open Tasks', value: dKpis?.openTasks ?? 0, icon: Clock, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Overdue Tasks', value: dKpis?.overdueTasks ?? d.overdueTasks ?? 0, icon: AlertTriangle, color: 'bg-red-500/10 text-red-500' },
  ];

  const recentEmployees = d.recentEmployees || [];
  const topEmployees = dKpis?.topPerformers || d.topEmployees || [];

  // Mobile View (Today-first)
  if (!isDesktop) {
    return (
      <MobileAdminDashboard
        stats={d}
        kpis={dKpis}
        isLoading={isLoading}
        onRefresh={() => {
          refetch();
        }}
      />
    );
  }

  // Desktop View (original)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System-wide overview and key metrics.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="!hover:-translate-y-0 !hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmployees.length === 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No employees yet</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmployees.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{emp.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-[10px]">
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {topEmployees.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No data available</div>
            ) : (
              <div className="space-y-3">
                {topEmployees.map((emp: any, idx: number) => (
                  <div key={emp.id || emp.employeeId || idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                        <span className="text-[#f97316] text-xs font-semibold">
                          {(emp.name || emp.employeeName)?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{emp.name || emp.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{(emp.completedTasks ?? emp.tasksCompleted ?? 0)} tasks completed</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#f97316]">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}