/**
 * Task presentation config.
 *
 * Single source of truth for status / priority badge appearance so individual
 * screens no longer hand-roll their own `getStatusColor` / `getPriorityColor`
 * helpers. Built on top of the existing `Badge` variants (dark-mode safe,
 * alpha-based) — no separate badge system is introduced.
 */
import type { BadgeProps } from '@/components/ui/badge';
import type { TaskStatus, TaskPriority } from '../types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
  /** Optional override for tones the base Badge variants don't cover. */
  className?: string;
}

// Orange tone follows the same alpha pattern as the built-in Badge variants so
// it renders correctly in both light and dark mode.
const ORANGE_TONE = 'bg-orange-500/15 text-orange-400 border-orange-500/25';

export const STATUS_CONFIG: Record<TaskStatus, BadgeConfig> = {
  Draft: { label: 'Draft', variant: 'outline', className: 'bg-gray-500/15 text-gray-400 border-gray-500/25' },
  Todo: { label: 'To Do', variant: 'info' },
  InProgress: { label: 'In Progress', variant: 'warning', className: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  OnHold: { label: 'On Hold', variant: 'secondary', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
  Completed: { label: 'Completed', variant: 'success' },
  Archived: { label: 'Archived', variant: 'outline', className: 'bg-gray-600/15 text-gray-400 border-gray-600/25' },
  Cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export const STATUS_LABELS: Record<TaskStatus, string> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([key, config]) => [key, config.label]),
) as Record<TaskStatus, string>;

export const STATUS_VARIANT: Record<TaskStatus, BadgeVariant> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([key, config]) => [key, config.variant]),
) as Record<TaskStatus, BadgeVariant>;

export const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  Draft: ['Todo', 'Cancelled'],
  Todo: ['InProgress', 'Cancelled'],
  InProgress: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['InProgress', 'Cancelled'],
  Completed: ['Archived', 'Cancelled'],
  Archived: [],
  Cancelled: [],
};

// Priority colours follow the frozen architecture: Urgent=red, High=orange,
// Medium=yellow/amber, Low=green, None=gray.
export const PRIORITY_CONFIG: Record<TaskPriority, BadgeConfig> = {
  None: { label: 'None', variant: 'secondary' },
  Low: { label: 'Low', variant: 'success' },
  Medium: { label: 'Medium', variant: 'warning' },
  High: { label: 'High', variant: 'outline', className: ORANGE_TONE },
  Urgent: { label: 'Urgent', variant: 'destructive' },
};

export const PRIORITY_VARIANT: Record<TaskPriority, BadgeVariant> = Object.fromEntries(
  Object.entries(PRIORITY_CONFIG).map(([key, config]) => [key, config.variant]),
) as Record<TaskPriority, BadgeVariant>;

export const RELATIONSHIP_LABELS: Record<string, string> = {
  'Depends On': 'Depends On',
  'Blocked By': 'Blocked By',
  Blocking: 'Blocking',
  'Related To': 'Related To',
  'Duplicate Of': 'Duplicate Of',
};
