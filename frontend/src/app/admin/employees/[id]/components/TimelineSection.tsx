'use client';

import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '@/lib/date-utils';
import type { EmployeeTimelineEvent } from '@/modules/admin/types/employeePerformance';

const KIND_META: Record<EmployeeTimelineEvent['kind'], { icon: React.ReactNode; className: string; label: string }> = {
  assigned: { icon: <UserPlus className="h-4 w-4" />, className: 'bg-blue-500/15 text-blue-400 border-blue-500/25', label: 'Assigned' },
  started: { icon: <PlayCircle className="h-4 w-4" />, className: 'bg-amber-500/15 text-amber-400 border-amber-500/25', label: 'Started' },
  updated: { icon: <RefreshCw className="h-4 w-4" />, className: 'bg-slate-500/15 text-slate-400 border-slate-500/25', label: 'Updated' },
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', label: 'Completed' },
  verified: { icon: <ShieldCheck className="h-4 w-4" />, className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25', label: 'Verified' },
  rejected: { icon: <XCircle className="h-4 w-4" />, className: 'bg-rose-500/15 text-rose-400 border-rose-500/25', label: 'Rejected' },
  cancelled: { icon: <X className="h-4 w-4" />, className: 'bg-red-500/15 text-red-400 border-red-500/25', label: 'Cancelled' },
  activity: { icon: <Activity className="h-4 w-4" />, className: 'bg-gray-500/15 text-gray-400 border-gray-500/25', label: 'Activity' },
};

function groupByDay(events: EmployeeTimelineEvent[]) {
  const groups: { day: string; events: EmployeeTimelineEvent[] }[] = [];
  events.forEach((event) => {
    const day = formatDate(event.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === day) {
      last.events.push(event);
    } else {
      groups.push({ day, events: [event] });
    }
  });
  return groups;
}

export function TimelineSection({
  events,
  isLoading,
}: {
  events: EmployeeTimelineEvent[];
  isLoading?: boolean;
}) {
  const groups = groupByDay(events);

  return (
    <Card id="timeline" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:max-h-[560px] lg:overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group.day}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.day}
              </p>
              <ol className="relative space-y-4 border-l border-border/70 pl-5">
                {group.events.map((event) => {
                  const meta = KIND_META[event.kind] ?? KIND_META.activity;
                  return (
                    <li key={event.id} className="relative">
                      <span
                        className={cn(
                          'absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full border',
                          meta.className,
                        )}
                      >
                        {meta.icon}
                      </span>
                      <div className="rounded-md border border-border/50 bg-muted/30 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className={cn('text-[10px]', meta.className)}>
                            {meta.label}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(event.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-foreground">{event.description}</p>
                        <Link
                          href={`/app/tasks/${event.taskId}`}
                          className="mt-1 block truncate text-xs font-medium text-primary hover:underline"
                        >
                          {`TSK-${String(event.taskNumber).padStart(3, '0')}`} · {event.taskTitle}
                        </Link>
                        {event.performedByName && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            by {event.performedByName}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
