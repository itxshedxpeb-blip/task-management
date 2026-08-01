'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronRight as ArrowRight,
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

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Completed';
  
  return (
    <Link href={`/app/tasks/${task.id}`}>
      <Card className="p-4 rounded-2xl border border-border bg-card hover:bg-card-hover hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-3">
            <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-2">
              {task.title}
            </p>
            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[task.status] || '')}>
                {task.status}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">Late</Badge>
              )}
            </div>
            <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CalendarPage() {
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());

  const { data, isLoading, error, refetch } = useTasks({
    pageSize: 500,
  });

  const tasks = data?.rows || [];

  const todayKey = `${today.year()}-${String(today.month() + 1).padStart(2, '0')}-${String(today.date()).padStart(2, '0')}`;
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = dayjs(t.dueDate);
    return d.year() === today.year() && d.month() === today.month() && d.date() === today.date();
  });
  
  const upcomingTasks = tasks
    .filter((t) => t.dueDate && dayjs(t.dueDate).isAfter(today, 'day') && t.status !== 'Completed')
    .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
    .slice(0, 10);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const goToday = () => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
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

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-2xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Today's Tasks */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Today</h3>
              {todayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today.</p>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3">Upcoming</h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
