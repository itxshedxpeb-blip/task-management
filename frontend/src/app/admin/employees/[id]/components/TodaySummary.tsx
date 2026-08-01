'use client';

import Link from 'next/link';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader,
  MessageSquare,
  Paperclip,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { dayjs, formatRelativeTime } from '@/lib/date-utils';
import type { EmployeeToday } from '@/modules/admin/types/employeePerformance';

function ProductivityRing({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const tone =
    value >= 70 ? 'text-emerald-500' : value >= 40 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative h-28 w-28 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="9" className="stroke-white/15" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn('transition-all duration-700', tone)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">{value}%</span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/70">
          Productivity
        </span>
      </div>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2">
      <span className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-black/15', tone)}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold leading-none text-white tabular-nums">{value}</span>
        <span className="block truncate text-[9px] font-medium uppercase tracking-wide text-white/70">
          {label}
        </span>
      </span>
    </div>
  );
}

export function TodaySummary({
  today,
  isLoading,
  employeeName,
}: {
  today: EmployeeToday | undefined;
  isLoading: boolean;
  employeeName: string;
}) {
  return (
    <Card className="overflow-hidden border-0">
      <div className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#0b1120] p-5 text-white">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/70">
            <Sun className="h-3.5 w-3.5" />
            Today&apos;s Summary
          </p>
          {today?.date && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold">
              {dayjs(today.date).format('ddd, D MMM YYYY')}
            </span>
          )}
        </div>

        {isLoading || !today ? (
          <div className="mt-4 flex items-center gap-5">
            <Skeleton className="h-28 w-28 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4 bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
              <Skeleton className="h-3 w-2/3 bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProductivityRing value={today.productivityToday} />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/90">
                {employeeName} is {today.counts.dueToday > 0 ? (
                  <span className="font-semibold">
                    working on {today.counts.dueToday} task{today.counts.dueToday === 1 ? '' : 's'} due today
                  </span>
                ) : today.counts.completedToday > 0 ? (
                  <span className="font-semibold">wrapping up today&apos;s work</span>
                ) : (
                  <span>all caught up for today</span>
                )}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatChip
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="Completed"
                  value={today.counts.completedToday}
                  tone="text-emerald-400"
                />
                <StatChip
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                  label="Due Today"
                  value={today.counts.dueToday}
                  tone="text-amber-400"
                />
                <StatChip
                  icon={<Paperclip className="h-3.5 w-3.5" />}
                  label="Files Added"
                  value={today.counts.filesAddedToday}
                  tone="text-sky-400"
                />
                <StatChip
                  icon={<MessageSquare className="h-3.5 w-3.5" />}
                  label="Comments"
                  value={today.counts.commentsAddedToday}
                  tone="text-violet-400"
                />
                <StatChip
                  icon={<Activity className="h-3.5 w-3.5" />}
                  label="Activities"
                  value={today.counts.activityToday}
                  tone="text-cyan-400"
                />
                <StatChip
                  icon={<TrendingUp className="h-3.5 w-3.5" />}
                  label="Assigned"
                  value={today.counts.assignedToday}
                  tone="text-pink-400"
                />
              </div>
            </div>
          </div>
        )}

        {today?.lastActivity && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-black/20 px-3 py-2.5">
            <Loader className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/85">
                <span className="font-semibold">Last activity:</span> {today.lastActivity.description}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-white/55">
                <span>{formatRelativeTime(today.lastActivity.createdAt)}</span>
                {today.lastActivity.performedByName && <span>by {today.lastActivity.performedByName}</span>}
                <Link
                  href={`/app/tasks/${today.lastActivity.taskId}`}
                  className="block min-w-0 break-words text-sky-300 hover:underline [overflow-wrap:anywhere]"
                >
                  <FileText className="mr-1 inline h-3 w-3 align-[-1px]" />
                  TSK-{String(today.lastActivity.taskNumber).padStart(3, '0')} ·{' '}
                  {today.lastActivity.taskTitle}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
