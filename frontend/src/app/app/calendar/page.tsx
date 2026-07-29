'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const [currentYear, setCurrentYear] = useState(today.year());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useTasks({
    pageSize: 500,
  });

  const tasks = data?.rows || [];

  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (isNaN(d.getTime())) return;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(task);
    }
  });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const calendarDays: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean; dateKey: string }> = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({ day, month: m, year: y, isCurrentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, month: currentMonth, year: currentYear, isCurrentMonth: true, dateKey });
  }

  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({ day: i, month: m, year: y, isCurrentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  const todayKey = `${today.year()}-${String(today.month() + 1).padStart(2, '0')}-${String(today.date()).padStart(2, '0')}`;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  const goToday = () => {
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setSelectedDate(todayKey);
  };

  const selectedTasks = selectedDate ? tasksByDate[selectedDate] || [] : [];

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load calendar</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
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
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">View your tasks on a calendar.</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {dayjs().year(currentYear).month(currentMonth).format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {WEEKDAYS.map((day) => (
              <div key={day} className="bg-card p-2 text-center">
                <span className="text-xs font-medium text-muted-foreground">{day}</span>
              </div>
            ))}

            {calendarDays.map((cell, idx) => {
              const dayTasks = tasksByDate[cell.dateKey] || [];
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDate;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateKey)}
                  className={cn(
                    'bg-card p-2 min-h-[80px] text-left transition-colors hover:bg-card-hover',
                    !cell.isCurrentMonth && 'opacity-40',
                    isSelected && 'bg-blue-500/10 ring-2 ring-blue-500/30',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'text-sm',
                      isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' : '',
                      cell.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                    )}>
                      {cell.day}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[task.priority] || 'bg-gray-400')}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Tasks for {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
            </h3>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks due on this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/app/tasks/${task.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('h-2 w-2 rounded-full', PRIORITY_DOT[task.priority])} />
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.assignedUserName}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
