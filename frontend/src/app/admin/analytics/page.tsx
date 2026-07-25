'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckSquare,
  Clock,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { adminApi } from '@/modules/admin/services/adminApi';

function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
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
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartPlaceholder({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">{title}</p>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{d.value}</span>
            <div
              className="w-full bg-[#f97316]/20 rounded-t-md transition-all"
              style={{ height: `${max > 0 ? (d.value / max) * 100 : 0}%`, minHeight: '4px' }}
            >
              <div
                className="w-full bg-[#f97316] rounded-t-md"
                style={{ height: '100%' }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  const data = analyticsData as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-60 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load analytics.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const tasksByMonth = data?.tasksByMonth || [
    { label: 'Jan', value: 320 },
    { label: 'Feb', value: 410 },
    { label: 'Mar', value: 380 },
    { label: 'Apr', value: 520 },
    { label: 'May', value: 490 },
    { label: 'Jun', value: 610 },
  ];

  const usersByMonth = data?.usersByMonth || [
    { label: 'Jan', value: 80 },
    { label: 'Feb', value: 120 },
    { label: 'Mar', value: 95 },
    { label: 'Apr', value: 156 },
    { label: 'May', value: 140 },
    { label: 'Jun', value: 180 },
  ];

  const topCompanies = data?.topCompanies || [
    { name: 'Acme Corp', tasks: 342, users: 45 },
    { name: 'TechStart Inc', tasks: 278, users: 32 },
    { name: 'DataFlow Labs', tasks: 195, users: 18 },
    { name: 'InnovateCo', tasks: 156, users: 12 },
    { name: 'GlobalTech', tasks: 134, users: 22 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide analytics and usage insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tasks Created"
          value={data?.totalTasks ?? '3,421'}
          change="+12.5% from last month"
          trend="up"
          icon={CheckSquare}
          color="bg-[#f97316]/10 text-[#f97316]"
        />
        <MetricCard
          label="Active Users"
          value={data?.activeUsers ?? '1,284'}
          change="+8.3% from last month"
          trend="up"
          icon={Users}
          color="bg-blue-500/10 text-blue-500"
        />
        <MetricCard
          label="Avg. Task Duration"
          value={data?.avgTaskDuration ?? '3.2 days'}
          change="-0.5 days from last month"
          trend="up"
          icon={Clock}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <MetricCard
          label="Completion Rate"
          value={data?.completionRate ?? '87.4%'}
          change="+2.1% from last month"
          trend="up"
          icon={TrendingUp}
          color="bg-violet-500/10 text-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-6">
            <BarChartPlaceholder data={tasksByMonth} title="Tasks Created (Last 6 Months)" />
          </CardContent>
        </Card>
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-6">
            <BarChartPlaceholder data={usersByMonth} title="New Users (Last 6 Months)" />
          </CardContent>
        </Card>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top Companies by Activity</CardTitle>
          <CardDescription>Companies with the most tasks and users</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Activity Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCompanies.map((company: any, index: number) => (
                <TableRow key={company.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{company.tasks}</TableCell>
                  <TableCell className="text-muted-foreground">{company.users}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#f97316] rounded-full"
                          style={{ width: `${(company.tasks / 342) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round((company.tasks / 342) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
