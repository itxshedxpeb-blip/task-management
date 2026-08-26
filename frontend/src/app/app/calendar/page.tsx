'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronRight as ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, dayjs } from '@/lib/date-utils';
import { useTasks } from '@/modules/tasks/hooks/useTasks';
import type { Task } from '@/features/task-management/types';

const PRIORITY_DOT: Record<string, string> = {
  Urgent: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

const STATUS_COLORS: Record<string, string> = {
  Todo: 'text-blue-400 bg-blue-500/10',
  InProgress: 'text-orange-400 bg-orange-500/10',
  Completed: 'text-emerald-400 bg-emerald-500/10',
  OnHold: 'text-yellow-400 bg-yellow-500/10',
  Draft: 'text-gray-400 bg-gray-500/10',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function TaskCard({ task }: { task: Task }) {
  const effectiveDate = task.nextFollowUpDate || task.dueDate;
  const isOverdue = effectiveDate && dayjs(effectiveDate).isBefore(dayjs(), 'day') && task.status !== 'Completed';
  const isFollowUp = !!task.nextFollowUpDate;
  const progress = Math.max(0, Math.min(100, task.progress ?? 0));

  return (
    <Link href={`/app/tasks/${task.id}`}>
      <Card className="p-3 rounded-xl border border-border bg-card hover:bg-card-hover hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 pr-2">
              {task.title}
            </p>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Badge variant="outline" className={cn('text-[10px]', STATUS_COLORS[task.status] || '')}>
              {task.status}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-[10px]">Late</Badge>
            )}
            {isFollowUp && (
              <Badge variant="outline" className="text-[10px] text-violet-600 bg-violet-50 border-violet-200">Follow-up</Badge>
            )}
            <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
          </div>
          {/* Progress bar */}
          {progress > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-primary' : 'bg-amber-500'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {effectiveDate && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {isFollowUp ? 'Follow-up: ' : ''}{formatDate(effectiveDate)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CalendarPage() {
  const today = dayjs().tz('Asia/Kolkata');
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());
  const [selectedDate, setSelectedDate] = useState<string>(today.format('YYYY-MM-DD'));

  // Calculate month range for fetching
  const monthStart = dayjs().year(currentYear).month(currentMonth).startOf('month').format('YYYY-MM-DD');
  const monthEnd = dayjs().year(currentYear).month(currentMonth).endOf('month').format('YYYY-MM-DD');

  // Fetch tasks for the entire month to show indicators
  const { data, isLoading, error, refetch } = useTasks({ 
    pageSize: 500, 
    dateFrom: monthStart,
    dateTo: monthEnd,
    showAll: true 
  });

  const tasks = data?.rows || [];

  // Build date map: tasks and follow-ups per date
  const dateMap = useMemo(() => {
    const map: Record<string, { tasks: Task[]; followUps: Task[] }> = {};

    for (const task of tasks) {
      // Tasks with dueDate
      if (task.dueDate) {
        const key = dayjs(task.dueDate).format('YYYY-MM-DD');
        if (!map[key]) map[key] = { tasks: [], followUps: [] };
        map[key].tasks.push(task);
      }

      // Tasks with nextFollowUpDate
      if (task.nextFollowUpDate) {
        const key = dayjs(task.nextFollowUpDate).format('YYYY-MM-DD');
        if (!map[key]) map[key] = { tasks: [], followUps: [] };
        // Only add if not already added as a due-date task for this date
        if (!map[key].tasks.find(t => t.id === task.id)) {
          map[key].followUps.push(task);
        }
      }
    }

    return map;
  }, [tasks]);

  // Get calendar days for the month
  const calendarDays = useMemo(() => {
    const firstDay = dayjs().year(currentYear).month(currentMonth).startOf('month');
    const lastDay = firstDay.endOf('month');

    // Monday=0, Sunday=6
    let startDayOfWeek = firstDay.day() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday -> 6

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < startDayOfWeek; i++) {
      const d = firstDay.subtract(startDayOfWeek - i, 'day');
      days.push({
        date: d.format('YYYY-MM-DD'),
        day: d.date(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Add all days of the month
    const totalDays = lastDay.date();
    for (let i = 1; i <= totalDays; i++) {
      const d = dayjs().year(currentYear).month(currentMonth).date(i);
      const dateStr = d.format('YYYY-MM-DD');
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: d.isSame(today, 'day'),
        isSelected: dateStr === selectedDate,
      });
    }

    // Fill remaining cells to complete the grid (always show 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = lastDay.add(i, 'day');
      days.push({
        date: d.format('YYYY-MM-DD'),
        day: d.date(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [currentMonth, currentYear, selectedDate, today, monthStart, monthEnd]);

  // Get tasks/follow-ups for selected date
  const selectedDateData = dateMap[selectedDate] || { tasks: [], followUps: [] };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setSelectedDate(today.format('YYYY-MM-DD'));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="font-medium mb-4">Failed to load calendar</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Month Selector Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">
            {dayjs().year(currentYear).month(currentMonth).format('MMMM YYYY')}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToday}
          className="mt-3 w-full"
        >
          Today
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="bg-card rounded-2xl border border-border p-3">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo) => {
                  const dayData = dateMap[dayInfo.date];
                  const hasTasks = dayData && dayData.tasks.length > 0;
                  const hasFollowUps = dayData && dayData.followUps.length > 0;
                  const hasActivity = hasTasks || hasFollowUps;

                  return (
                    <button
                      key={dayInfo.date}
                      onClick={() => setSelectedDate(dayInfo.date)}
                      className={cn(
                        'relative flex flex-col items-center p-1.5 rounded-lg transition-all text-center min-h-[48px]',
                        dayInfo.isSelected && 'bg-primary/10 ring-2 ring-primary',
                        dayInfo.isToday && !dayInfo.isSelected && 'bg-muted/50',
                        !dayInfo.isCurrentMonth && 'opacity-30',
                        dayInfo.isCurrentMonth && !dayInfo.isSelected && 'hover:bg-muted/30'
                      )}
                    >
                      <span
                        className={cn(
                          'text-xs font-medium tabular-nums',
                          dayInfo.isToday && 'text-primary font-bold',
                          dayInfo.isSelected && 'text-primary font-bold',
                          !dayInfo.isToday && !dayInfo.isSelected && 'text-foreground'
                        )}
                      >
                        {dayInfo.day}
                      </span>

                      {/* Indicators */}
                      {hasActivity && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasTasks && (
                            <div className="h-1 w-1 rounded-full bg-primary" />
                          )}
                          {hasFollowUps && (
                            <div className="h-1 w-1 rounded-full bg-violet-500" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Section */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">
                {dayjs(selectedDate).format('DD MMMM YYYY')}
                {dayjs(selectedDate).isSame(today, 'day') && (
                  <span className="text-xs text-primary ml-2">(Today)</span>
                )}
              </h3>

              {selectedDateData.tasks.length === 0 && selectedDateData.followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks or follow-ups for this date.</p>
              ) : (
                <div className="space-y-3">
                  {/* Tasks due on this date */}
                  {selectedDateData.tasks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Tasks</p>
                      <div className="space-y-2">
                        {selectedDateData.tasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-ups on this date */}
                  {selectedDateData.followUps.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Follow-ups</p>
                      <div className="space-y-2">
                        {selectedDateData.followUps.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
