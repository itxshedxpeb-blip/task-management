import type { TaskActivityType } from '../types';

export interface ActivityTypeConfig {
  label: string;
  icon: string; // lucide icon name
  color: string; // tailwind text color
  bgColor: string; // tailwind bg color
  borderColor: string; // tailwind border color
}

export const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  TaskCreated: {
    label: 'Task Created',
    icon: 'Plus',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  Comment: {
    label: 'Comment',
    icon: 'MessageSquare',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  ProgressUpdate: {
    label: 'Progress Update',
    icon: 'TrendingUp',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  FollowUp: {
    label: 'Follow-up',
    icon: 'Clock',
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  IssueFound: {
    label: 'Issue Found',
    icon: 'AlertTriangle',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  WorkCompleted: {
    label: 'Work Completed',
    icon: 'CheckCircle',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  StatusChanged: {
    label: 'Status Changed',
    icon: 'RefreshCw',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  AssignmentChanged: {
    label: 'Assignment Changed',
    icon: 'User',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  DueDateChanged: {
    label: 'Due Date Changed',
    icon: 'Calendar',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  PriorityChanged: {
    label: 'Priority Changed',
    icon: 'Tag',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  InternalNote: {
    label: 'Internal Note',
    icon: 'FileText',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  FollowUpCompleted: {
    label: 'Follow-up Completed',
    icon: 'CheckCircle2',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  TaskCompleted: {
    label: 'Task Completed',
    icon: 'CheckCircle',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  // Legacy types
  Created: {
    label: 'Task Created',
    icon: 'Plus',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  Assigned: {
    label: 'Assigned',
    icon: 'User',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  Started: {
    label: 'Started',
    icon: 'Play',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  Completed: {
    label: 'Completed',
    icon: 'CheckCircle',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  Updated: {
    label: 'Updated',
    icon: 'Pencil',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  Archived: {
    label: 'Archived',
    icon: 'Archive',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  Cancelled: {
    label: 'Cancelled',
    icon: 'XCircle',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  Reassigned: {
    label: 'Reassigned',
    icon: 'User',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  'In Progress': {
    label: 'In Progress',
    icon: 'Play',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  'On Hold': {
    label: 'On Hold',
    icon: 'Pause',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  'Priority Changed': {
    label: 'Priority Changed',
    icon: 'Tag',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  'Due Date Changed': {
    label: 'Due Date Changed',
    icon: 'Calendar',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  'Progress Updated': {
    label: 'Progress Updated',
    icon: 'TrendingUp',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'Checklist Updated': {
    label: 'Checklist Updated',
    icon: 'ListChecks',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

/**
 * Activity types available in the "Add Follow-up" form dropdown.
 * These are the user-facing activity types.
 */
export const USER_ACTIVITY_TYPES: { value: string; label: string }[] = [
  { value: 'ProgressUpdate', label: 'Progress Update' },
  { value: 'FollowUp', label: 'Follow-up' },
  { value: 'Comment', label: 'Comment' },
  { value: 'IssueFound', label: 'Issue Found' },
  { value: 'WorkCompleted', label: 'Work Completed' },
  { value: 'InternalNote', label: 'Internal Note' },
  { value: 'StatusChanged', label: 'Status Update' },
];

/**
 * Get activity config with fallback for unknown types.
 */
export function getActivityConfig(type: string): ActivityTypeConfig {
  return (
    ACTIVITY_TYPE_CONFIG[type] || {
      label: type,
      icon: 'Info',
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
    }
  );
}
