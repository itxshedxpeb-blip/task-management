import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PerformanceBadge as PerformanceBadgeType } from '../../types/employeePerformance';

const BADGE_CONFIG: Record<
  PerformanceBadgeType,
  { label: string; className: string }
> = {
  Excellent: {
    label: 'Excellent',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  },
  Good: {
    label: 'Good',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  },
  Average: {
    label: 'Average',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  },
  'Needs Attention': {
    label: 'Needs Attention',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  },
  Overloaded: {
    label: 'Overloaded',
    className: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
  'No Tasks': {
    label: 'No Tasks',
    className: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  },
};

export function PerformanceBadge({
  badge,
  className,
}: {
  badge: PerformanceBadgeType;
  className?: string;
}) {
  const config = BADGE_CONFIG[badge] ?? BADGE_CONFIG['No Tasks'];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
