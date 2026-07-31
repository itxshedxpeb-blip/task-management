import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  FileBarChart,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ListTodo,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';
import { ROUTES } from '@/core/routes';
import { Avatar } from '@/features/task-management/components/shared/Avatar';
import type { EmployeePerformance } from '@/modules/admin/types/employeePerformance';
import { PerformanceBadge } from '@/modules/admin/components/employee-cards/PerformanceBadge';
import { WorkloadIndicator } from '@/modules/admin/components/employee-cards/WorkloadIndicator';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="truncate font-medium text-foreground">{value}</span>
      </span>
    </div>
  );
}

export function EmployeeHeader({ employee }: { employee: EmployeePerformance }) {
  const displayName = employee.name || 'Unnamed';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
          <Link href={ROUTES.adminEmployees}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Employees
          </Link>
        </Button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Avatar user={{ name: displayName, avatarUrl: employee.avatar ?? undefined }} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                <Badge variant={employee.isActive ? 'default' : 'secondary'} className="text-[10px]">
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn('text-[10px]', employee.online ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-400' : '')}
                >
                  <span
                    className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', employee.online ? 'bg-emerald-400' : 'bg-muted-foreground')}
                  />
                  {employee.online ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {employee.designation || 'No designation'}
                {employee.department ? ` · ${employee.department}` : ''}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {employee.employeeId ? `Employee ID: #${employee.employeeId}` : 'No employee ID'} · Role: {employee.role}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <PerformanceBadge badge={employee.stats.performanceBadge} />
                <WorkloadIndicator level={employee.stats.workloadLevel} score={employee.stats.workloadScore} />
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Joined {formatDate(employee.joiningDate || employee.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-1/3">
            <InfoItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={employee.email}
            />
            <InfoItem
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={employee.phone || 'Not provided'}
            />
            <InfoItem
              icon={<MapPin className="h-4 w-4" />}
              label="Department"
              value={employee.department || 'Not assigned'}
            />
            <InfoItem
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Last Login"
              value={employee.lastLogin ? formatDate(employee.lastLogin) : 'Never'}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Button asChild size="sm">
            <Link href={`/admin/tasks?assignee=${employee.id}`}>
              <ListTodo className="mr-1.5 h-4 w-4" /> Assign Task
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`mailto:${employee.email}`}>
              <MessageSquare className="mr-1.5 h-4 w-4" /> Message
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/app/calendar?assignee=${employee.id}`}>
              <CalendarDays className="mr-1.5 h-4 w-4" /> Calendar
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/reports?employee=${employee.id}`}>
              <FileBarChart className="mr-1.5 h-4 w-4" /> Reports
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
