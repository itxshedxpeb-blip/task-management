'use client';

import { useParams } from 'next/navigation';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useEmployeePerformance,
  useEmployeeReport,
  useEmployeeTimeline,
} from '@/modules/admin/hooks/useEmployeePerformance';
import type { EmployeePerformance, EmployeeReport } from '@/modules/admin/types/employeePerformance';
import { EmployeeHeader } from './components/EmployeeHeader';
import { KpiCards } from './components/KpiCards';
import { PerformanceCharts, PerformanceChartsSkeleton } from './components/PerformanceCharts';
import { TasksSection } from './components/TasksSection';
import { TimelineSection } from './components/TimelineSection';
import { OverdueAnalysis } from './components/OverdueAnalysis';

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function AdminEmployeeDetailPage() {
  const { id } = useParams<{ id: string }>() ?? {};

  const { data, isLoading, error, refetch } = useEmployeePerformance(id);
  const reportQuery = useEmployeeReport(id);
  const timelineQuery = useEmployeeTimeline(id, 100);

  const employee = (data as any)?.data as EmployeePerformance | undefined;
  const report = (reportQuery.data as any)?.data as EmployeeReport | undefined;
  const timeline = (timelineQuery.data as any)?.data ?? [];

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="mb-1 font-medium">Failed to load employee</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !employee) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <EmployeeHeader employee={employee} />

      <KpiCards stats={employee.stats} />

      {report ? (
        <PerformanceCharts report={report} />
      ) : (
        <PerformanceChartsSkeleton />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TasksSection employeeId={employee.id} />
        </div>
        <div className="space-y-6">
          <OverdueAnalysis employeeId={employee.id} stats={employee.stats} />
          <TimelineSection events={timeline} isLoading={timelineQuery.isLoading} />
        </div>
      </div>
    </div>
  );
}
