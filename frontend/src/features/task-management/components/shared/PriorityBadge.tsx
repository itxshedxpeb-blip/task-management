import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PRIORITY_CONFIG } from '../../constants/taskConfig';
import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  /** When provided, the badge becomes interactive (e.g. click-to-filter). */
  onClick?: () => void;
}

/** Task priority badge. Reuses the shared Badge component and central config. */
export function PriorityBadge({ priority, className, onClick }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] ?? { label: priority, variant: 'outline' as const };
  const interactive = typeof onClick === 'function';

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, interactive && 'cursor-pointer', className)}
      onClick={onClick}
      {...(interactive
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            },
          }
        : {})}
    >
      {config.label}
    </Badge>
  );
}
