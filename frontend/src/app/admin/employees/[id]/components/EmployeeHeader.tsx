import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  FileBarChart,
  Hash,
  ListTodo,
  Mail,
  MessageSquare,
  Phone,
  UserCheck,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';
import { ROUTES } from '@/core/routes';
import { Avatar } from '@/features/task-management/components/shared/Avatar';
import type { EmployeePerformance } from '@/modules/admin/types/employeePerformance';
import { PerformanceBadge } from '@/modules/admin/components/employee-cards/PerformanceBadge';
import { WorkloadIndicator } from '@/modules/admin/components/employee-cards/WorkloadIndicator';
import { useCreateTask } from '@/modules/tasks/hooks/useTasks';
import type { TaskPriority } from '@/features/task-management/types';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>
    </div>
  );
}

function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  employeeId 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  employeeId: string;
}) {
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedUserId: employeeId,
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task for Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createTask.isPending || !title.trim()}>
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeeHeader({ employee }: { employee: EmployeePerformance }) {
  const displayName = employee.name || 'Unnamed';
  const joinedDate = employee.joiningDate || employee.createdAt;
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3 text-muted-foreground">
            <Link href={ROUTES.adminEmployees}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Employees
            </Link>
          </Button>

        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-start lg:gap-5 lg:text-left">
          <Avatar user={{ name: displayName, avatarUrl: employee.avatar ?? undefined }} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold text-foreground sm:text-2xl">
              {displayName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <Badge variant={employee.isActive ? 'default' : 'secondary'} className="text-[10px]">
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  employee.online
                    ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-400'
                    : '',
                )}
              >
                <span
                  className={cn(
                    'mr-1 inline-block h-1.5 w-1.5 rounded-full',
                    employee.online ? 'bg-emerald-400' : 'bg-muted-foreground',
                  )}
                />
                {employee.online ? 'Online' : 'Offline'}
              </Badge>
              <PerformanceBadge badge={employee.stats.performanceBadge} />
              <WorkloadIndicator
                level={employee.stats.workloadLevel}
                score={employee.stats.workloadScore}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-y-0.5 sm:grid-cols-2 sm:gap-x-6">
          <InfoRow
            icon={<Hash className="h-4 w-4" />}
            label="Employee ID"
            value={employee.employeeId ? `#${employee.employeeId}` : 'Not assigned'}
          />
          <InfoRow
            icon={<Briefcase className="h-4 w-4" />}
            label="Designation"
            value={employee.designation || 'Not assigned'}
          />
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="Department"
            value={employee.department || 'Not assigned'}
          />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} />
          <InfoRow
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={employee.phone || 'Not provided'}
          />
          <InfoRow
            icon={<UserCheck className="h-4 w-4" />}
            label="Status"
            value={employee.isActive ? 'Active' : 'Inactive'}
          />
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="Last Login"
            value={employee.lastLogin ? formatDate(employee.lastLogin) : 'Never'}
          />
          <InfoRow
            icon={<CalendarDays className="h-4 w-4" />}
            label="Joining Date"
            value={joinedDate ? formatDate(joinedDate) : 'Not recorded'}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          <Button size="sm" className="w-full px-3 sm:w-auto" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Task
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full px-3 sm:w-auto">
            <Link href={`/admin/tasks?assignee=${employee.id}`}>
              <ListTodo className="h-4 w-4 mr-2" /> View Tasks
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full px-3 sm:w-auto">
            <Link href={`mailto:${employee.email}`}>
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full px-3 sm:w-auto">
            <Link href={`/app/calendar?assignee=${employee.id}`}>
              <CalendarDays className="h-4 w-4 mr-2" /> Calendar
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full px-3 sm:w-auto">
            <Link href={`/admin/reports?employee=${employee.id}`}>
              <FileBarChart className="h-4 w-4 mr-2" /> Reports
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
    <CreateTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} employeeId={employee.id} />
    </>
  );
}
