'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getCountdownBreakdown, getCountdownLabel } from '../../utils/taskFormatters';
import { Timer, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownTimerProps {
  dueDate?: Date | string | null;
  completed?: boolean;
  /** Compact mode: inline text only. Full mode: icon + formatted countdown. */
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Live countdown timer that ticks every second until the due date.
 * Shows "Overdue", "Due Today", or "X Days Y Hours Left" etc.
 * Auto-updates without page refresh.
 */
export function CountdownTimer({ dueDate, completed, variant = 'compact', className }: CountdownTimerProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!dueDate || completed) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [dueDate, completed]);

  const breakdown = getCountdownBreakdown(dueDate);

  if (!breakdown) {
    return variant === 'full' ? (
      <span className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
        <Timer className="h-3 w-3" /> No due date
      </span>
    ) : (
      <span className={cn('text-xs text-muted-foreground', className)}>—</span>
    );
  }

  if (completed) {
    return variant === 'full' ? (
      <span className={cn('flex items-center gap-1.5 text-xs text-emerald-500', className)}>
        <CheckCircle2 className="h-3 w-3" /> Completed
      </span>
    ) : (
      <span className={cn('text-xs text-emerald-500', className)}>Completed</span>
    );
  }

  const isOverdue = breakdown.total <= 0;

  if (isOverdue) {
    const overdueLabel = getCountdownLabel(dueDate, false);
    return variant === 'full' ? (
      <span className={cn('flex items-center gap-1.5 text-xs font-medium text-red-500', className)}>
        <AlertTriangle className="h-3 w-3" /> {overdueLabel}
      </span>
    ) : (
      <span className={cn('text-xs font-medium text-red-500', className)}>{overdueLabel}</span>
    );
  }

  const { days, hours, minutes, seconds } = breakdown;

  if (variant === 'full') {
    return (
      <span className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
        <Timer className="h-3 w-3" />
        {days > 0 && <span>{days}d</span>}
        {hours > 0 && <span>{hours}h</span>}
        {minutes > 0 && <span>{minutes}m</span>}
        <span className="tabular-nums">{seconds}s</span>
        <span>Left</span>
      </span>
    );
  }

  return (
    <span className={cn('text-xs tabular-nums text-muted-foreground', className)}>
      {days > 0 && `${days}d `}
      {hours > 0 && `${hours}h `}
      {minutes}m {seconds}s
    </span>
  );
}
