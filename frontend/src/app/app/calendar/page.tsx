'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTasks } from '@/modules/tasks/hooks/useTasks';
import type { Task, TaskPriority } from '@/features/task-management/types';

const PRIORITY_DOT: Record<string, string> = {
  Critical: 'bg-red-400',
  High: 'bg-orange-400',
  Medium: 'bg-amber-400',
  Low: 'bg-blue-400',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);

  const { data, isLoading, error, refetch } = useTasks({
    pageSize: 500,
  });

  const tasks = data?.rows || [];

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const dueDate = new Date(task.dueDate);
      const key = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

  const calendarDays: Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({ date: new Date(y, m, day), isCurrentMonth: false, isToday: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
  }

  const remaining = 42 - calendarDays.length;
  for (let day = 1; day <= remaining; day++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({ date: new Date(y, m, day), isCurrentMonth: false, isToday: false });
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

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

  const selectedDateTasks = selectedDate
    ? tasksByDate.get(`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`) || []
    : [];

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage tasks on a calendar timeline.</p>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load calendar</p>
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage tasks on a calendar timeline.</p>
      </div>

      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <Card className="hover-translate-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {MONTHS[currentMonth]} {currentYear}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="bg-muted/50 p-2 text-center">
                      <span className="text-xs font-medium text-muted-foreground">{day}</span>
                    </div>
                  ))}
                  {calendarDays.map((dayInfo, idx) => {
                    const key = `${dayInfo.date.getFullYear()}-${dayInfo.date.getMonth()}-${dayInfo.date.getDate()}`;
                    const dayTasks = tasksByDate.get(key) || [];
                    const isSelected = selectedDate && isSameDay(dayInfo.date, selectedDate);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dayInfo.date)}
                        className={cn(
                          'bg-card p-2 min-h-[80px] text-left transition-colors hover:bg-card-hover',
                          !dayInfo.isCurrentMonth && 'opacity-40',
                          isSelected && 'ring-2 ring-primary ring-inset'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-medium',
                            dayInfo.isToday
                              ? 'bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center'
                              : 'text-foreground'
                          )}
                        >
                          {dayInfo.date.getDate()}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-1"
                            >
                              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
                              <span className="text-[9px] text-muted-foreground truncate">{task.title}</span>
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <span className="text-[9px] text-muted-foreground">+{dayTasks.length - 3} more</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Day Sidebar */}
          <div>
            <Card className="hover-translate-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    : 'Select a day'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Click a day on the calendar to see tasks.
                  </p>
                ) : selectedDateTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tasks due on this day.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/app/tasks/${task.id}`}
                        className="block p-3 rounded-lg border border-border hover:bg-card-hover transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant={task.priority === 'Urgent' ? 'destructive' : task.priority === 'High' ? 'warning' : 'secondary'}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{task.assignedUserName}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
