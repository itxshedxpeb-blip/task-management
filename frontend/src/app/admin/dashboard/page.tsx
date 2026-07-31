'use client';

import { useQuery } from '@tanstack/react-query';
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
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { MobileKPICard } from '@/components/mobile/MobileKPICard';

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
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const d = (stats as any)?.data || stats || {};

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

  const kpiCards = [
    { label: 'Total Employees', value: d.totalEmployees ?? 0, icon: Users, color: 'bg-[#f97316]/10 text-[#f97316]' },
    { label: 'Active Employees', value: d.activeEmployees ?? 0, icon: Users, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Total Tasks', value: d.totalTasks ?? 0, icon: CheckSquare, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Completed Tasks', value: d.completedTasks ?? 0, icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Completed On Time', value: d.completedOnTime ?? 0, icon: Zap, color: 'bg-sky-500/10 text-sky-500' },
    { label: 'Completed Late', value: d.completedLate ?? 0, icon: Timer, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Pending Tasks', value: d.pendingTasks ?? 0, icon: Clock, color: 'bg-amber-500/10 text-amber-500' },
    { label: 'Overdue Tasks', value: d.overdueTasks ?? 0, icon: AlertTriangle, color: 'bg-red-500/10 text-red-500' },
  ];

  const recentEmployees = d.recentEmployees || [];
  const topEmployees = d.topEmployees || [];

  // Mobile View
  if (!isDesktop) {
    return (
      <div className="space-y-4 p-4 pb-24">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <MobileKPICard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                icon={Icon}
                color={kpi.color}
              />
            );
          })}
        </div>

        {/* Recent Employees Section */}
        <Card className="mobile-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No employees yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentEmployees.map((emp: any) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                        <span className="text-[#f97316] text-xs font-semibold">
                          {emp.name
                            ?.split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={emp.isActive ? 'default' : 'secondary'}
                      className="text-[10px] h-5"
                    >
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Employees Section */}
        <Card className="mobile-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {topEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {topEmployees.map((emp: any, idx: number) => (
                  <div
                    key={emp.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                        <span className="text-[#f97316] text-xs font-semibold">
                          {emp.name
                            ?.split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {emp.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.completedTasks ?? 0} tasks completed
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#f97316]">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
                  <div key={emp.id || idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                        <span className="text-[#f97316] text-xs font-semibold">
                          {emp.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.completedTasks ?? 0} tasks completed</p>
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