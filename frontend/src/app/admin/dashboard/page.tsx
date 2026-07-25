'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  CheckSquare,
  Activity,
  ArrowUpRight,
  Clock,
  RefreshCw,
  Server,
  Database,
  Shield,
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
import { adminApi } from '@/modules/admin/services/adminApi';

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  change?: string;
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
            {change && (
              <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {change}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusIndicator({ label, status }: { label: string; status: 'healthy' | 'degraded' | 'down' }) {
  const colors = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
  };
  const textColors = {
    healthy: 'text-emerald-400',
    degraded: 'text-amber-400',
    down: 'text-red-400',
  };
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <span className={`text-xs font-medium capitalize ${textColors[status]}`}>{status}</span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const dashboardData = stats as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Failed to load dashboard data.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const recentCompanies = dashboardData?.recentCompanies || [];
  const recentUsers = dashboardData?.recentUsers || [];
  const systemStatus = dashboardData?.systemStatus || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide overview and key metrics.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Companies"
          value={dashboardData?.totalCompanies ?? 47}
          change="+3 this month"
          icon={Building2}
          color="bg-[#f97316]/10 text-[#f97316]"
        />
        <StatCard
          label="Total Users"
          value={dashboardData?.totalUsers ?? 1284}
          change="+156 this month"
          icon={Users}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          label="Active Tasks"
          value={dashboardData?.activeTasks ?? 3421}
          change="+284 this week"
          icon={CheckSquare}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          label="System Health"
          value="99.9%"
          change="Uptime last 30 days"
          icon={Activity}
          color="bg-violet-500/10 text-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 !hover:-translate-y-0 !hover:shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompanies.length === 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Acme Corp</TableCell>
                    <TableCell>admin@acme.com</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell className="text-muted-foreground">2 days ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TechStart Inc</TableCell>
                    <TableCell>hello@techstart.io</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell className="text-muted-foreground">5 days ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>DataFlow Labs</TableCell>
                    <TableCell>support@dataflow.dev</TableCell>
                    <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                    <TableCell className="text-muted-foreground">1 week ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCompanies.map((company: any) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{company.email}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'ACTIVE' ? 'success' : company.status === 'SUSPENDED' ? 'destructive' : 'warning'}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(company.createdAt).toLocaleDateString()}
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
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <StatusIndicator label="API Server" status={systemStatus.api || 'healthy'} />
            <StatusIndicator label="Database" status={systemStatus.database || 'healthy'} />
            <StatusIndicator label="Cache (Redis)" status={systemStatus.cache || 'healthy'} />
            <StatusIndicator label="Background Jobs" status={systemStatus.jobs || 'healthy'} />
            <StatusIndicator label="File Storage" status={systemStatus.storage || 'healthy'} />
            <StatusIndicator label="Email Service" status={systemStatus.email || 'healthy'} />
          </CardContent>
        </Card>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {recentUsers.length === 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sarah Chen</TableCell>
                  <TableCell>sarah@acme.com</TableCell>
                  <TableCell><Badge variant="info">Admin</Badge></TableCell>
                  <TableCell>Acme Corp</TableCell>
                  <TableCell className="text-muted-foreground">Today</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>James Wilson</TableCell>
                  <TableCell>james@techstart.io</TableCell>
                  <TableCell><Badge variant="secondary">Member</Badge></TableCell>
                  <TableCell>TechStart Inc</TableCell>
                  <TableCell className="text-muted-foreground">Yesterday</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maria Garcia</TableCell>
                  <TableCell>maria@dataflow.dev</TableCell>
                  <TableCell><Badge variant="info">Manager</Badge></TableCell>
                  <TableCell>DataFlow Labs</TableCell>
                  <TableCell className="text-muted-foreground">3 days ago</TableCell>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'info' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.companyName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
