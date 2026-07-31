import { cn } from '@/lib/utils';
import type { EmployeeListItem } from '../../types/employeePerformance';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeCardSkeleton } from './EmployeeCardSkeleton';

/**
 * Responsive employee card grid:
 * 1 column on mobile, 2 on tablet (>=sm), 3 on laptop (>=lg), 4 on desktop (>=xl).
 */
export function EmployeeCardGrid({
  employees,
  isLoading,
  skeletonCount = 8,
  className,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  employees: EmployeeListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  onEdit?: (employee: EmployeeListItem) => void;
  onToggleStatus?: (employee: EmployeeListItem) => void;
  onDelete?: (employee: EmployeeListItem) => void;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => <EmployeeCardSkeleton key={i} />)
        : employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
    </div>
  );
}
