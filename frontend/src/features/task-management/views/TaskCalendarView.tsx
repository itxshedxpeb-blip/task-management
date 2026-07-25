'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '../types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

type CalendarView = 'month' | 'week' | 'day' | 'timeline';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onTaskClick,
}) => {
  // Default to the month of the task due date nearest to today, so the calendar
  // never opens on an empty month when tasks exist elsewhere on the timeline.
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (!tasks || tasks.length === 0) return new Date();
    const now = new Date().getTime();
    let nearest = new Date(tasks[0].dueDate);
    let nearestDiff = Math.abs(nearest.getTime() - now);
    for (const t of tasks) {
      const d = new Date(t.dueDate);
      const diff = Math.abs(d.getTime() - now);
      if (diff < nearestDiff) {
        nearest = d;
        nearestDiff = diff;
      }
    }
    return nearest;
  });
  const [view, setView] = useState<CalendarView>('month');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startDayOfWeek };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-400';
      case 'High':
        return 'bg-amber-400';
      case 'Medium':
        return 'bg-lime-400';
      case 'Low':
        return 'bg-sky-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getPriorityLightBg = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-50 border-rose-200';
      case 'High':
        return 'bg-amber-50 border-amber-200';
      case 'Medium':
        return 'bg-lime-50 border-lime-200';
      case 'Low':
        return 'bg-sky-50 border-sky-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'from-rose-100 to-pink-50';
      case 'High':
        return 'from-amber-100 to-orange-50';
      case 'Medium':
        return 'from-lime-100 to-green-50';
      case 'Low':
        return 'from-sky-100 to-blue-50';
      default:
        return 'from-slate-100 to-gray-50';
    }
  };

  const renderMonthView = () => {
    const { daysInMonth, startDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 border border-slate-100 bg-slate-50/50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayTasks = getTasksForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            'h-16 overflow-hidden border border-slate-100 p-1 transition-colors hover:bg-slate-50',
            isToday && 'bg-blue-50/50 ring-2 ring-inset ring-blue-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn('text-xs font-semibold', isToday ? 'text-blue-600' : 'text-slate-700')}>
              {day}
            </span>
            {dayTasks.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none bg-blue-100 text-blue-700 border-blue-200">
                {dayTasks.length}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 space-y-0.5">
            {dayTasks.slice(0, 2).map(task => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={cn(
                  'truncate rounded px-1 py-0.5 text-[11px] leading-tight cursor-pointer border',
                  getPriorityLightBg(task.priority)
                )}
              >
                {task.title}
              </div>
            ))}
            {dayTasks.length > 2 && (
              <div className="text-[11px] leading-tight text-slate-500">
                +{dayTasks.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayTasks = getTasksForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={i}
          className={cn(
            'flex-1 border border-slate-100 p-3 min-w-[200px] transition-colors hover:bg-slate-50',
            isToday && 'bg-blue-50/50 ring-2 ring-inset ring-blue-200'
          )}
        >
          <div className="mb-3">
            <div className="text-sm font-semibold mb-1 text-slate-700">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={cn('text-2xl font-bold', isToday ? 'text-blue-600' : 'text-slate-800')}>
              {date.getDate()}
            </div>
          </div>
          <div className="space-y-2">
            {dayTasks.map(task => (
              <Card
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={cn(
                  'cursor-pointer hover:shadow-lg transition-all duration-200 border-2',
                  getPriorityLightBg(task.priority)
                )}
              >
                <CardContent className="p-2">
                  <p className="text-sm font-semibold truncate text-gray-800">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn('text-white border-0 text-[10px]', getPriorityColor(task.priority))}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-slate-600 truncate">
                      {task.assignedUserName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const isToday = new Date().toDateString() === currentDate.toDateString();

    return (
      <div className="space-y-3">
        <div className={cn(
          'text-center mb-6 p-6 rounded-2xl bg-gradient-to-br',
          getPriorityGradient(dayTasks[0]?.priority || 'Low')
        )}>
          <div className="text-sm text-slate-600 font-medium">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className={cn('text-5xl font-bold mt-2', isToday ? 'text-blue-600' : 'text-slate-800')}>
            {currentDate.getDate()}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="space-y-3">
          {dayTasks.map(task => (
            <Card
              key={task.id}
              onClick={() => onTaskClick(task)}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-all duration-200 border-2',
                getPriorityLightBg(task.priority)
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 text-gray-800">{task.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-600">{task.assignedUserName}</span>
                      <Badge className={cn('text-white border-0', getPriorityColor(task.priority))}>{task.priority}</Badge>
                      <Badge variant="outline" className="bg-white/50">{task.status}</Badge>
                    </div>
                  </div>
                  {task.progress !== undefined && (
                    <div className="text-right">
                      <div className={cn('text-3xl font-bold', getPriorityColor(task.priority).replace('bg-', 'text-'))}>{task.progress}%</div>
                      <div className="text-xs text-slate-500 mt-1">Progress</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {dayTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No tasks scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTimelineView = () => {
    const sortedTasks = [...tasks].sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedTasks.map((task, index) => (
          <div key={task.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn('w-4 h-4 rounded-full ring-4 ring-white shadow-sm', getPriorityColor(task.priority))} />
              {index < sortedTasks.length - 1 && (
                <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 to-transparent mt-2" />
              )}
            </div>
            <Card
              onClick={() => onTaskClick(task)}
              className={cn(
                'flex-1 cursor-pointer hover:shadow-lg transition-all duration-200 border-2',
                getPriorityLightBg(task.priority)
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-medium">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-800">{task.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-600">{task.assignedUserName}</span>
                      <Badge className={cn('text-white border-0', getPriorityColor(task.priority))}>{task.priority}</Badge>
                      <Badge variant="outline" className="bg-white/50">{task.status}</Badge>
                    </div>
                  </div>
                  {task.progress !== undefined && (
                    <div className="text-right">
                      <div className={cn('text-2xl font-bold', getPriorityColor(task.priority).replace('bg-', 'text-'))}>{task.progress}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold sm:text-base">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>

        <div className="flex flex-wrap gap-1">
          {(['month', 'week', 'day', 'timeline'] as CalendarView[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(v)}
              className="h-7 capitalize"
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {view === 'month' && (
            <div className="grid grid-cols-7 border-t border-l">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1.5 text-center text-xs font-medium border-r border-b bg-gray-50">
                  {day}
                </div>
              ))}
              {renderMonthView()}
            </div>
          )}
          
          {view === 'week' && (
            <div className="flex overflow-x-auto">
              {renderWeekView()}
            </div>
          )}
          
          {view === 'day' && (
            <div className="p-6">
              {renderDayView()}
            </div>
          )}
          
          {view === 'timeline' && (
            <div className="p-6">
              {renderTimelineView()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
