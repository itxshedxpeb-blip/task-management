'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronRight, AlertTriangle, ClipboardList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EmployeeListItem } from '@/modules/admin/types/employeePerformance';

interface MobileEmployeeCardProps {
  employee: EmployeeListItem;
  onEdit?: (employee: EmployeeListItem) => void;
  onToggleStatus?: (employee: EmployeeListItem) => void;
  onDelete?: (employee: EmployeeListItem) => void;
  showActions?: boolean;
  className?: string;
}

const BADGE_TONE: Record<string, string> = {
  Excellent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  Good: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  Average: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'Needs Attention': 'bg-red-500/10 text-red-600 border-red-500/30',
  Overloaded: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  'No Tasks': 'bg-muted text-muted-foreground border-border/60',
};

const MobileEmployeeCard = memo(function MobileEmployeeCard({
  employee,
  onEdit,
  onToggleStatus,
  onDelete,
  showActions = true,
  className,
}: MobileEmployeeCardProps) {
  const router = useRouter();
  const stats = employee.stats;
  const online = Boolean((employee as unknown as { online?: boolean }).online);

  const handleCardPress = () => {
    router.push(`/admin/employees/${employee.id}`);
  };

  const initials = employee.name
    ? employee.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : employee.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase();

  const completionRate = Math.max(0, Math.min(100, Math.round(stats?.completionRate ?? 0)));
  const currentTask = stats?.currentTask;

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.985]',
        className
      )}
      onClick={handleCardPress}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-[#f97316]/10 flex items-center justify-center">
              <span className="text-[#f97316] text-sm font-bold">{initials}</span>
            </div>
            {online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-foreground leading-tight truncate">
                  {employee.name || 'Unknown'}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {[employee.designation, employee.department].filter(Boolean).join(' · ') ||
                    employee.role}
                </p>
              </div>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(employee);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onToggleStatus && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(employee);
                        }}
                      >
                        {employee.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(employee);
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {stats?.performanceBadge && (
                <span
                  className={cn(
                    'inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-semibold border',
                    BADGE_TONE[stats.performanceBadge] ?? BADGE_TONE['No Tasks']
                  )}
                >
                  {stats.performanceBadge}
                </span>
              )}
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                {employee.role}
              </Badge>
              {employee.employeeId && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  ID {employee.employeeId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Completion rate */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-semibold text-foreground tabular-nums">{completionRate}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                completionRate >= 70
                  ? 'bg-emerald-500'
                  : completionRate >= 40
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Today's progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Today&apos;s Progress</span>
            {stats && (stats.assignedToday ?? 0) > 0 ? (
              <span className="font-semibold text-foreground tabular-nums">
                {stats.completedToday ?? 0} / {stats.assignedToday ?? 0} done
              </span>
            ) : (
              <span className="font-medium text-foreground tabular-nums">No tasks today</span>
            )}
          </div>
          {stats && (stats.assignedToday ?? 0) > 0 && (
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  (stats.completedToday ?? 0) >= (stats.assignedToday ?? 1)
                    ? 'bg-emerald-500'
                    : 'bg-primary'
                )}
                style={{
                  width: `${Math.min(100, Math.round(((stats.completedToday ?? 0) / (stats.assignedToday ?? 1)) * 100))}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* KPI chips */}
        {stats && (
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            <div className="rounded-lg bg-muted/50 px-1 py-1.5 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Done</p>
              <p className="text-[13px] font-bold text-emerald-600 leading-tight tabular-nums">
                {stats.completedTasks ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 px-1 py-1.5 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-[13px] font-bold text-foreground leading-tight tabular-nums">
                {stats.pendingTasks ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 px-1 py-1.5 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Due Today</p>
              <p className="text-[13px] font-bold text-orange-600 leading-tight tabular-nums">
                {stats.dueToday ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 px-1 py-1.5 text-center">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Overdue</p>
              <p className="text-[13px] font-bold text-red-600 leading-tight tabular-nums">
                {stats.overdueTasks ?? 0}
              </p>
            </div>
          </div>
        )}

        {/* Current task */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border/50 min-w-0">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {currentTask ? (
            <span className="text-[11px] text-muted-foreground truncate">
              <span className="text-muted-foreground/70">Working on:</span>{' '}
              <span className="text-foreground font-medium">{currentTask.title}</span>
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">No active task</span>
          )}
          {stats && stats.overdueTasks > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 flex-shrink-0">
              <AlertTriangle className="h-3 w-3" />
              {stats.overdueTasks} overdue
            </span>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
});

export default MobileEmployeeCard;
