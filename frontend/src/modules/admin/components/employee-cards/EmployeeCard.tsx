import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Edit,
  ExternalLink,
  FileBarChart,
  History,
  ListTodo,
  MessageSquare,
  MoreHorizontal,
  Timer,
  ToggleLeft,
  Trash2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/date-utils';
import { ROUTES } from '@/core/routes';
import { Avatar } from '@/features/task-management/components/shared/Avatar';
import { ProgressBar } from '@/features/task-management/components/shared/ProgressBar';
import { PriorityBadge } from '@/features/task-management/components/shared/PriorityBadge';
import type { EmployeeCardTone, EmployeeListItem } from '../../types/employeePerformance';
import { PerformanceBadge } from './PerformanceBadge';
import { WorkloadIndicator } from './WorkloadIndicator';

const TONE_CONFIG: Record<
  EmployeeCardTone,
  { border: string; label: string; headerBg: string }
> = {
  green: {
    border: 'border-l-emerald-500',
    label: 'Performing Well',
    headerBg: 'bg-emerald-500/10',
  },
  orange: {
    border: 'border-l-orange-500',
    label: 'Pending Increasing',
    headerBg: 'bg-orange-500/10',
  },
  red: {
    border: 'border-l-red-500',
    label: 'Many Overdue',
    headerBg: 'bg-red-500/10',
  },
  blue: {
    border: 'border-l-blue-500',
    label: 'New Employee',
    headerBg: 'bg-blue-500/10',
  },
  grey: {
    border: 'border-l-gray-400',
    label: 'No Assigned Tasks',
    headerBg: 'bg-gray-500/10',
  },
};

const STAT_CELLS: { key: 'activeTasks' | 'completedTasks' | 'pendingTasks' | 'overdueTasks' | 'cancelledTasks' | 'rejectedTasks'; label: string; className: string }[] = [
  { key: 'activeTasks', label: 'Active', className: 'text-blue-500' },
  { key: 'completedTasks', label: 'Done', className: 'text-emerald-500' },
  { key: 'pendingTasks', label: 'Pending', className: 'text-yellow-500' },
  { key: 'overdueTasks', label: 'Overdue', className: 'text-red-500' },
  { key: 'cancelledTasks', label: 'Cancelled', className: 'text-gray-400' },
  { key: 'rejectedTasks', label: 'Rejected', className: 'text-rose-500' },
];

export function EmployeeCard({
  employee,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  employee: EmployeeListItem;
  onEdit?: (employee: EmployeeListItem) => void;
  onToggleStatus?: (employee: EmployeeListItem) => void;
  onDelete?: (employee: EmployeeListItem) => void;
}) {
  const { id, name, email, avatar, employeeId, department, designation, role, isActive } = employee;
  const stats = employee.stats;
  const tone = TONE_CONFIG[stats?.cardTone ?? 'grey'];
  const displayName = name || 'Unnamed';

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-xl border border-border/60 border-l-4 transition-shadow hover:shadow-lg',
        tone.border,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Link href={ROUTES.adminEmployeeDetail(id)} className="shrink-0">
            <Avatar user={{ name: displayName, avatarUrl: avatar ?? undefined }} size="md" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={ROUTES.adminEmployeeDetail(id)}
                className="truncate text-sm font-semibold text-foreground hover:underline"
                title={displayName}
              >
                {displayName}
              </Link>
              <Badge variant={isActive ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              {(onEdit || onToggleStatus || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(employee)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    {onToggleStatus && (
                      <DropdownMenuItem onClick={() => onToggleStatus(employee)}>
                        <ToggleLeft className="mr-2 h-4 w-4" /> Toggle Status
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(employee)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {designation || role || 'No designation'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {employeeId ? `#${employeeId}` : 'No ID'} · {department || 'No department'}
            </p>
          </div>
        </div>

        <div className={cn('mt-3 flex items-center justify-between gap-2 rounded-md px-2 py-1', tone.headerBg)}>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {tone.label}
          </span>
          <PerformanceBadge badge={stats?.performanceBadge ?? 'No Tasks'} className="text-[10px]" />
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion rate</span>
            <span className="font-semibold tabular-nums">{stats?.completionRate ?? 0}%</span>
          </div>
          <ProgressBar value={stats?.completionRate ?? 0} size="sm" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {STAT_CELLS.map((cell) => (
            <div
              key={cell.key}
              className="rounded-md border border-border/50 bg-muted/40 px-1 py-1.5 text-center"
            >
              <p className={cn('text-sm font-bold tabular-nums leading-none', cell.className)}>
                {stats?.[cell.key] ?? 0}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{cell.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-3 divide-x divide-border/60 rounded-md border border-border/50 bg-muted/40 text-center">
          {[
            { label: 'Today', value: stats?.dueToday ?? 0 },
            { label: 'This Week', value: stats?.dueThisWeek ?? 0 },
            { label: 'Total', value: stats?.totalTasks ?? 0 },
          ].map((cell) => (
            <div key={cell.label} className="py-1.5">
              <p className="text-sm font-bold tabular-nums leading-none">{cell.value}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{cell.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1.5">
          {stats?.currentTask ? (
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">
                <span className="text-muted-foreground">Current:</span> {stats.currentTask.title}
              </span>
            </p>
          ) : null}
          {stats?.highestPriorityTask ? (
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate">
                <span className="text-muted-foreground">Highest:</span> {stats.highestPriorityTask.title}
              </span>
              <PriorityBadge priority={stats.highestPriorityTask.priority} className="shrink-0 text-[10px]" />
            </p>
          ) : null}
          {stats?.lastCompletedTask ? (
            <p className="flex items-center gap-1.5 text-xs text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span className="truncate">
                <span className="text-muted-foreground">Last done:</span> {stats.lastCompletedTask.title}
              </span>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                {formatRelativeTime(stats.lastCompletedTask.completedAt)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            Avg {stats?.avgCompletionHours ?? 0}h
          </span>
          <WorkloadIndicator
            level={stats?.workloadLevel ?? 'low'}
            score={stats?.workloadScore}
          />
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <Button asChild size="sm" className="flex-1">
            <Link href={ROUTES.adminEmployeeDetail(id)}>
              <ExternalLink className="h-3.5 w-3.5" />
              View Details
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="Assign Task">
            <Link href={`/admin/tasks?assignee=${id}`}>
              <ListTodo className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="View Timeline">
            <Link href={`${ROUTES.adminEmployeeDetail(id)}#timeline`}>
              <History className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="Open Calendar">
            <Link href={`/app/calendar?assignee=${id}`}>
              <CalendarDays className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="View Reports">
            <Link href={`/admin/reports?employee=${id}`}>
              <FileBarChart className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="h-8 w-8" title="Message Employee">
            <Link href={`mailto:${email}`}>
              <MessageSquare className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
