'use client';

import type { LucideIcon } from 'lucide-react';
import { Calendar, LayoutDashboard, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskViewMode } from '../../types';

interface ViewOption {
  value: TaskViewMode;
  label: string;
  icon: LucideIcon;
  /** Disabled placeholders for views planned in later phases. */
  disabled?: boolean;
}

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'list', label: 'List', icon: List },
  { value: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { value: 'calendar', label: 'Calendar', icon: Calendar, disabled: true },
  { value: 'matrix', label: 'Matrix', icon: LayoutDashboard, disabled: true },
];

interface ViewSwitcherProps {
  value: TaskViewMode;
  onChange: (view: TaskViewMode) => void;
  className?: string;
}

/**
 * Switches between task list views. Only state switching is handled here; the
 * Calendar and Matrix views are disabled placeholders for later phases.
 */
export function ViewSwitcher({ value, onChange, className }: ViewSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Switch task view"
      className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)}
    >
      {VIEW_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={isActive}
            title={option.disabled ? `${option.label} view — coming in a later phase` : `${option.label} view`}
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all duration-220 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
              option.disabled && 'cursor-not-allowed opacity-40 hover:text-muted-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
