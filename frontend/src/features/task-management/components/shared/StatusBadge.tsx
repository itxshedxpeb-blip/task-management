import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '../../constants/taskConfig';
import type { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  /** When provided, the badge becomes interactive (e.g. click-to-filter). */
  onClick?: () => void;
}

/** Task status badge. Reuses the shared Badge component and central status config. */
export function StatusBadge({ status, className, onClick }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const };
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
