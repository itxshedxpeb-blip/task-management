import { cn } from '@/lib/utils';
import type { WorkloadLevel } from '../../types/employeePerformance';

const WORKLOAD_CONFIG: Record<
  WorkloadLevel,
  { dot: string; label: string; text: string }
> = {
  low: {
    dot: 'bg-emerald-500',
    label: 'Low Workload',
    text: 'text-emerald-500',
  },
  medium: {
    dot: 'bg-yellow-500',
    label: 'Moderate Workload',
    text: 'text-yellow-500',
  },
  high: {
    dot: 'bg-red-500',
    label: 'High Workload',
    text: 'text-red-500',
  },
};

export function WorkloadIndicator({
  level,
  score,
  className,
}: {
  level: WorkloadLevel;
  score?: number;
  className?: string;
}) {
  const config = WORKLOAD_CONFIG[level] ?? WORKLOAD_CONFIG.low;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.text, className)}
      title={`Workload score: ${score ?? '—'} / 100`}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
