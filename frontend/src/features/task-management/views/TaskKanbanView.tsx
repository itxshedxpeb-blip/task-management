'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '../types';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, CheckCircle, XCircle, RotateCcw, Edit, Camera } from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onComplete?: (task: Task) => void;
}

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'Todo', label: 'Todo', icon: <Clock className="h-4 w-4" />, color: 'border-l-blue-500' },
  { status: 'InProgress', label: 'In Progress', icon: <RotateCcw className="h-4 w-4" />, color: 'border-l-yellow-500' },
  { status: 'Blocked', label: 'Blocked', icon: <AlertCircle className="h-4 w-4" />, color: 'border-l-red-500' },
  { status: 'Review', label: 'Review', icon: <Clock className="h-4 w-4" />, color: 'border-l-orange-500' },
  { status: 'Completed', label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'border-l-green-500' },
  { status: 'Verified', label: 'Verified', icon: <CheckCircle className="h-4 w-4" />, color: 'border-l-green-600' },
  { status: 'Cancelled', label: 'Cancelled', icon: <XCircle className="h-4 w-4" />, color: 'border-l-gray-500' },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onEdit,
  onComplete,
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange(draggedTask.id, targetStatus);
    }
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
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

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 pb-1">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          
          return (
            <div
              key={column.status}
              className="flex min-w-[200px] flex-1 flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.status)}
            >
              <Card className="flex h-full flex-col bg-muted/30">
                <CardHeader className="p-2.5 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
                      {column.icon}
                      {column.label}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-1.5 p-2 pt-0">
                  {columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => onTaskClick(task)}
                      className={cn(
                        'group relative cursor-pointer border-l-4 bg-background transition-shadow hover:shadow-md',
                        column.color,
                        draggedTask?.id === task.id && 'opacity-50'
                      )}
                    >
                      {/* Hover quick actions */}
                      {(onEdit || (onComplete && task.status === 'InProgress')) && (
                        <div className="absolute right-1 top-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          {onComplete && task.status === 'InProgress' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 bg-background/80 p-0 shadow-sm"
                              aria-label="Complete task"
                              onClick={(e) => { e.stopPropagation(); onComplete(task); }}
                            >
                              <Camera className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 bg-background/80 p-0 shadow-sm"
                              aria-label="Edit task"
                              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                      <CardContent className="p-2">
                        <div className="space-y-1.5">
                          <p className="pr-12 text-xs font-medium line-clamp-2">{task.title}</p>

                          <div className="flex flex-wrap items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn('h-4 px-1 text-[10px] leading-none', getPriorityColor(task.priority))}
                            >
                              {task.priority}
                            </Badge>
                            {task.linkedModule && (
                              <Badge variant="secondary" className="h-4 px-1 text-[10px] leading-none">
                                {task.linkedModule}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground">
                            <span className="truncate">{task.assignedUserName}</span>
                            {task.dueDate && (
                              <span className="whitespace-nowrap">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {task.progress !== undefined && task.progress > 0 && (
                            <div className="h-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="py-3 text-center text-[11px] text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
