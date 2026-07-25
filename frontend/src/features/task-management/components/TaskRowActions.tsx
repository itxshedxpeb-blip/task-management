'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CheckSquare, Edit, Trash2, Clock, Copy } from 'lucide-react';
import { Task } from '../types';

interface TaskRowActionsProps {
  task: Task;
  onComplete: (task: Task) => void;
  onVerify: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onViewActivity: (task: Task) => void;
}

export const TaskRowActions = memo(function TaskRowActions({
  task,
  onComplete,
  onVerify,
  onEdit,
  onDelete,
  onDuplicate,
  onViewActivity,
}: TaskRowActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {task.status === 'InProgress' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onComplete(task)}
          title="Complete Task"
          aria-label="Complete task"
        >
          <Camera className="h-4 w-4" />
        </Button>
      )}
      {task.status === 'Completed' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onVerify(task)}
          title="Verify Task"
          aria-label="Verify task"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onEdit(task)}
        title="Edit Task"
        aria-label="Edit task"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onDuplicate(task)}
        title="Duplicate Task"
        aria-label="Duplicate task"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        onClick={() => onDelete(task)}
        title="Delete Task"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        onClick={() => onViewActivity(task)}
        title="View Activity History"
        aria-label="View activity history"
      >
        <Clock className="h-4 w-4" />
      </Button>
    </div>
  );
});
