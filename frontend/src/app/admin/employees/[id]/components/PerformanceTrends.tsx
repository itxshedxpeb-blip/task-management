'use client';

import { CalendarRange, CalendarX2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
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

function SummaryStrip({ items }: { items: { label: string; value: number; className: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border/50 bg-muted/30 px-2.5 py-2 text-center">
          <p className={item.className}>+{item.value}</p>
          <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function WeeklyPerformance({ report }: { report: EmployeeReport }) {
  const trend = report.charts.weeklyTrend;
  const last = trend[trend.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarRange className="h-4 w-4 text-primary" />
          Weekly Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <SummaryStrip
          items={[
            { label: 'Created this week', value: last?.created ?? 0, className: 'text-lg font-bold tabular-nums text-indigo-500' },
            { label: 'Completed this week', value: last?.completed ?? 0, className: 'text-lg font-bold tabular-nums text-emerald-500' },
            { label: 'Overdue this week', value: last?.overdue ?? 0, className: 'text-lg font-bold tabular-nums text-red-500' },
          ]}
        />
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="created" name="Created" fill={CREATED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={COMPLETED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill={OVERDUE_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">Last 12 weeks</p>
      </CardContent>
    </Card>
  );
}

export function MonthlyPerformance({ report }: { report: EmployeeReport }) {
  const trend = report.charts.monthlyTrend;
  const last = trend[trend.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CalendarX2 className="h-4 w-4 text-primary" />
          Monthly Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <SummaryStrip
          items={[
            { label: 'Created this month', value: last?.created ?? 0, className: 'text-lg font-bold tabular-nums text-indigo-500' },
            { label: 'Completed this month', value: last?.completed ?? 0, className: 'text-lg font-bold tabular-nums text-emerald-500' },
            { label: 'Completion rate', value: report.summary?.completionRate ?? 0, className: 'text-lg font-bold tabular-nums text-amber-500' },
          ]}
        />
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="created" name="Created" fill={CREATED_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill={COMPLETED_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">Last 12 months</p>
      </CardContent>
    </Card>
  );
}
