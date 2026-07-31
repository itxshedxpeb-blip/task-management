'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Mail, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EmployeeListItem } from '@/modules/admin/types/employeePerformance';

interface MobileEmployeeCardProps {
  employee: EmployeeListItem;
  onEdit?: (employee: EmployeeListItem) => void;
  onToggleStatus?: (employee: EmployeeListItem) => void;
  onDelete?: (employee: EmployeeListItem) => void;
  showActions?: boolean;
  className?: string;
}

const MobileEmployeeCard = memo(function MobileEmployeeCard({
  employee,
  onEdit,
  onToggleStatus,
  onDelete,
  showActions = true,
  className,
}: MobileEmployeeCardProps) {
  const router = useRouter();

  const handleCardPress = () => {
    router.push(`/admin/employees/${employee.id}`);
  };

  const initials = employee.name
    ? employee.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : employee.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase();

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]',
        className
      )}
      onClick={handleCardPress}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#f97316]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#f97316] text-sm font-semibold">
              {initials}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground leading-tight truncate">
                {employee.name || 'Unknown'}
              </h3>
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                      }}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onToggleStatus && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(employee);
                      }}>
                        {employee.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(employee);
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] h-5">
                <Shield className="h-3 w-3 mr-1" />
                {employee.role}
              </Badge>
              <Badge
                variant={employee.isActive ? 'default' : 'secondary'}
                className="text-[10px] h-5"
              >
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{employee.email}</span>
            </div>

            {/* Performance Stats */}
            {employee.stats && (
              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {employee.stats.completedTasks}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    On Time Rate
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {employee.stats.onTimeCompletionRate !== undefined
                      ? `${Math.round(employee.stats.onTimeCompletionRate)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default MobileEmployeeCard;