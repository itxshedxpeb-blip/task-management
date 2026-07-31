'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/features/task-management/components/shared/ProgressBar';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EmployeeReport } from '@/modules/admin/types/employeePerformance';

const CREATED_COLOR = '#6366f1';
const COMPLETED_COLOR = '#10b981';
const OVERDUE_COLOR = '#ef4444';

const STATUS_COLORS: Record<string, string> = {
  Draft: '#64748b',
  Todo: '#6366f1',
  InProgress: '#f59e0b',
  OnHold: '#eab308',
  Completed: '#10b981',
  Archived: '#475569',
  Cancelled: '#ef4444',
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
  None: '#94a3b8',
};

const CATEGORY_PALETTE = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#ec4899',
  '#8b5cf6',
  '#84cc16',
  '#14b8a6',
  '#64748b',
];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-3">{children}</CardContent>
    </Card>
  );
}

function DistributionBars({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const colorMap = title.includes('Status')
    ? STATUS_COLORS
    : title.includes('Priority')
      ? PRIORITY_COLORS
      : undefined;

  return (
    <ChartCard title={`${title} Distribution`}>
      {entries.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={entries.map(([name, value]) => ({ name, value }))} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ fill: 'var(--muted)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {entries.map((entry) => (
                <Cell key={entry[0]} fill={colorMap?.[entry[0]] ?? CATEGORY_PALETTE[0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function PerformanceCharts({ report }: { report: EmployeeReport }) {
  const charts = report.charts;

  const statCards = [
    { label: 'Completion Rate', value: `${report.summary?.completionRate ?? 0}%` },
    { label: 'On-Time Rate', value: `${report.onTimeCompletionRate}%` },
    { label: 'Productivity Score', value: `${report.productivityScore}%` },
    { label: 'Avg Completion', value: `${report.summary?.avgCompletionHours ?? 0}h` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ProgressBar value={report.summary?.completionRate ?? 0} size="lg" showLabel />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Activity (Last 30 Days)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.dailyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CREATED_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CREATED_COLOR} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COMPLETED_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COMPLETED_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="created" name="Created" stroke={CREATED_COLOR} fill="url(#gradCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke={COMPLETED_COLOR} fill="url(#gradCompleted)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Trend (Last 12 Weeks)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.weeklyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="created" name="Created" fill={CREATED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={COMPLETED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill={OVERDUE_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Trend (Last 12 Months)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="created" name="Created" fill={CREATED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={COMPLETED_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <DistributionBars title="Category" data={charts.byCategory} />
        <DistributionBars title="Status" data={charts.byStatus} />
        <DistributionBars title="Priority" data={charts.byPriority} />
      </div>
    </div>
  );
}

export function PerformanceChartsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
