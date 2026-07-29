'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, TaskPriority } from '../types';
import { cn } from '@/lib/utils';
import { dayjs } from '@/lib/date-utils';
import { AlertTriangle, Clock, Calendar, Archive } from 'lucide-react';

interface TaskEisenhowerMatrixViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  /** Called when the user clicks "+X More" — opens the (filtered) List view. */
  onShowMore?: () => void;
}

// Quadrants stay compact: show only the first few cards, then a "+X More" link.
const MAX_VISIBLE_PER_QUADRANT = 3;

type Quadrant = 'urgent-important' | 'urgent-not-important' | 'not-urgent-important' | 'not-urgent-not-important';

const QUADRANTS: { id: Quadrant; label: string; icon: React.ReactNode; color: string; description: string }[] = [
  {
    id: 'urgent-important',
    label: 'Do First',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'border-red-500 bg-red-50',
    description: 'Urgent & Important'
  },
  {
    id: 'not-urgent-important',
    label: 'Schedule',
    icon: <Calendar className="h-4 w-4" />,
    color: 'border-blue-500 bg-blue-50',
    description: 'Not Urgent & Important'
  },
  {
    id: 'urgent-not-important',
    label: 'Delegate',
    icon: <Clock className="h-4 w-4" />,
    color: 'border-yellow-500 bg-yellow-50',
    description: 'Urgent & Not Important'
  },
  {
    id: 'not-urgent-not-important',
    label: 'Eliminate',
    icon: <Archive className="h-4 w-4" />,
    color: 'border-gray-500 bg-gray-50',
    description: 'Not Urgent & Not Important'
  },
];

export const TaskEisenhowerMatrixView: React.FC<TaskEisenhowerMatrixViewProps> = ({
  tasks,
  onTaskClick,
  onShowMore,
}) => {
  const isUrgent = (task: Task) => {
    const dueDate = dayjs(task.dueDate);
    const today = dayjs();
    const daysUntilDue = dueDate.diff(today, 'day');
    return daysUntilDue <= 3; // Urgent if due within 3 days
  };

  const isImportant = (task: Task) => {
    return task.priority === 'Urgent' || task.priority === 'High';
  };

  const getQuadrant = (task: Task): Quadrant => {
    const urgent = isUrgent(task);
    const important = isImportant(task);

    if (urgent && important) return 'urgent-important';
    if (urgent && !important) return 'urgent-not-important';
    if (!urgent && important) return 'not-urgent-important';
    return 'not-urgent-not-important';
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'None':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDaysUntilDue = (task: Task) => {
    const dueDate = dayjs(task.dueDate);
    const today = dayjs();
    const daysUntilDue = dueDate.diff(today, 'day');
    
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `${daysUntilDue} days left`;
  };

  const tasksByQuadrant = QUADRANTS.reduce((acc, quadrant) => {
    acc[quadrant.id] = tasks.filter(task => getQuadrant(task) === quadrant.id);
    return acc;
  }, {} as Record<Quadrant, Task[]>);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {QUADRANTS.map((quadrant) => {
          const quadrantTasks = tasksByQuadrant[quadrant.id];
          const visibleTasks = quadrantTasks.slice(0, MAX_VISIBLE_PER_QUADRANT);
          const remaining = quadrantTasks.length - visibleTasks.length;

          return (
            <Card
              key={quadrant.id}
              className={cn('flex min-h-[180px] flex-col border-l-4', quadrant.color)}
            >
              <CardHeader className="p-2.5 pb-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {quadrant.icon}
                    <CardTitle className="text-sm font-semibold">
                      {quadrant.label}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {quadrantTasks.length}
                  </Badge>
                </div>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {quadrant.description}
                </p>
              </CardHeader>
              <CardContent className="max-h-[320px] flex-1 space-y-1.5 overflow-y-auto p-2.5 pt-0">
                {visibleTasks.map((task) => (
                  <Card
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <p className="truncate text-xs font-medium">
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn('h-4 px-1 text-[10px] leading-none', getPriorityColor(task.priority))}
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">
                              {task.status}
                            </Badge>
                          </div>
                          <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                            {getDaysUntilDue(task)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => onShowMore?.()}
                    className="w-full rounded-md px-1 py-0.5 text-left text-[11px] font-medium text-primary hover:underline"
                  >
                    +{remaining} More
                  </button>
                )}

                {quadrantTasks.length === 0 && (
                  <div className="py-2 text-center text-[11px] text-muted-foreground">
                    No tasks
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
