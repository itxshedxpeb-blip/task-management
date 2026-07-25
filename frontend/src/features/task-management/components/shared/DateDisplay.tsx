'use client';

import { cn } from '@/lib/utils';
import {
  formatAbsoluteDate,
  formatRelativeDate,
  getDueMeta,
  type DueState,
} from '../../utils/taskFormatters';

const DUE_STATE_TONES: Record<DueState, string> = {
  overdue: 'text-red-500',
  'due-today': 'text-blue-500',
  'due-tomorrow': 'text-amber-500',
  'due-soon': 'text-amber-500',
  upcoming: 'text-muted-foreground',
  none: 'text-muted-foreground',
};

interface DateDisplayProps {
  date?: Date | string | null;
  /**
   * - `absolute`: e.g. "20 Jan 2026"
   * - `relative`: e.g. "In 3 days" / "2 days ago"
   * - `due`: due-date aware label with overdue / due-today / due-tomorrow tones
   */
  mode?: 'absolute' | 'relative' | 'due';
  /** For `due` mode: a completed task is never shown as overdue. */
  completed?: boolean;
  className?: string;
}

/**
 * Reusable date formatter. Computes on the client to avoid SSR/CSR hydration
 * mismatches for relative and due-date labels.
 */
export function DateDisplay({ date, mode = 'absolute', completed, className }: DateDisplayProps) {
  if (mode === 'due') {
    const meta = getDueMeta(date, { completed });
    return (
      <span className={cn('text-xs font-medium', DUE_STATE_TONES[meta.state], className)}>
        {meta.label}
      </span>
    );
  }

  const text = mode === 'relative' ? formatRelativeDate(date) : formatAbsoluteDate(date);
  return <span className={cn('text-xs text-muted-foreground', className)}>{text}</span>;
}
