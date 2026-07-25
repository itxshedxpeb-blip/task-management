import { cn } from '@/lib/utils';

const TRACK_HEIGHTS = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
} as const;

interface ProgressBarProps {
  /** Progress percentage (0–100). Values outside the range are clamped. */
  value: number;
  size?: keyof typeof TRACK_HEIGHTS;
  showLabel?: boolean;
  className?: string;
  /** Accessible name for the progress indicator. */
  label?: string;
}

/**
 * Lightweight progress indicator. No `Progress` primitive exists in the UI kit,
 * so this is the shared, accessible wrapper used across task screens instead of
 * inline `<div>` progress markup.
 */
export function ProgressBar({ value, size = 'md', showLabel = false, className, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn('relative w-full overflow-hidden rounded-full bg-muted', TRACK_HEIGHTS[size])}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{clamped}%</span>
      )}
    </div>
  );
}
