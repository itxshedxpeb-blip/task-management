'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GanttChart,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTasks } from '@/modules/tasks/hooks/useTasks';
import type { Task, TaskPriority } from '@/features/task-management/types';

const PRIORITY_COLOR: Record<string, string> = {
  Critical: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

const PRIORITY_TEXT: Record<string, string> = {
  Critical: 'text-red-400',
  High: 'text-orange-400',
  Medium: 'text-amber-400',
  Low: 'text-blue-400',
};

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40 shrink-0" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getDaysBetween(start: Date, end: Date) {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TimelinePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data, isLoading, error, refetch } = useTasks({ pageSize: 200 });

  const tasks = useMemo(() => {
    const all = data?.rows || [];
    const filtered = priorityFilter === 'all'
      ? all
      : all.filter((t) => t.priority === priorityFilter);
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [data, priorityFilter]);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 27);

  const days: Date[] = [];
  const current = new Date(weekStart);
  while (current <= weekEnd) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const totalDays = days.length;
  const dayWidth = 100 / totalDays;

  const isToday = (date: Date) => {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Gantt chart view for project planning.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load timeline</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Gantt chart view for project planning.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="hover-translate-none overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TimelineSkeleton />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <GanttChart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">No tasks to display</p>
              <p className="text-sm text-muted-foreground">Tasks will appear on the timeline once created.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header - Day columns */}
                <div className="flex border-b border-border">
                  <div className="w-48 shrink-0 p-3 border-r border-border bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">Task</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="flex">
                      {days.map((day, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex-1 p-1.5 text-center border-r border-border/50 min-w-[32px]',
                            isToday(day) && 'bg-primary/5',
                            day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/20' : ''
                          )}
                        >
                          <p className="text-[9px] text-muted-foreground leading-none">
                            {MONTHS[day.getMonth()]}
                          </p>
                          <p className={cn(
                            'text-xs font-medium leading-tight',
                            isToday(day) ? 'text-primary' : 'text-foreground'
                          )}>
                            {day.getDate()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rows - Task bars */}
                <div>
                  {tasks.map((task) => {
                    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
                    const taskEnd = new Date(task.dueDate);

                    const startOffsetDays = getDaysBetween(weekStart, taskStart);
                    const durationDays = getDaysBetween(taskStart, taskEnd);

                    const leftPct = Math.max(0, (startOffsetDays / totalDays) * 100);
                    const widthPct = Math.min(
                      Math.max((durationDays / totalDays) * 100, dayWidth),
                      100 - leftPct
                    );

                    return (
                      <div
                        key={task.id}
                        className="flex border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-48 shrink-0 p-2 border-r border-border flex items-center gap-2">
                          <div className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_COLOR[task.priority])} />
                          <Link
                            href={`/app/tasks/${task.id}`}
                            className="text-xs font-medium text-foreground hover:text-primary transition-colors truncate"
                          >
                            {task.title}
                          </Link>
                        </div>
                        <div className="flex-1 relative h-9">
                          {days.map((day, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                'absolute top-0 bottom-0 border-r border-border/30',
                                isToday(day) && 'bg-primary/5',
                                day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/10' : ''
                              )}
                              style={{ left: `${(idx / totalDays) * 100}%`, width: `${dayWidth}%` }}
                            />
                          ))}
                          <div
                            className={cn(
                              'absolute top-1.5 h-6 rounded-md flex items-center px-2 cursor-pointer transition-all hover:opacity-80',
                              PRIORITY_COLOR[task.priority],
                              'opacity-80'
                            )}
                            style={{
                              left: `${leftPct}%`,
                              width: `${Math.max(widthPct, 1)}%`,
                            }}
                          >
                            <span className="text-[9px] font-medium text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
