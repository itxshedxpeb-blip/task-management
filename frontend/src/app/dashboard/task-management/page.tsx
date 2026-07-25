'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/data-table/DataTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchBar } from '@/components/layout/SearchBar';
import { FilterPopover } from '@/components/layout/FilterPopover';
import { FilterConfig } from '@/components/layout/FilterBar';
import {
  useTasks,
  useTaskStats,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useVerifyTask,
  useEmployeePerformance,
  useSalaryAdjustments,
  useCreateSalaryAdjustment,
  createTaskNotification
} from '@/features/task-management/hooks/useTaskManagement';
import {
  Task,
  TaskStatus,
  TaskPriority,
  LinkedModule,
  CreateTaskDto,
  CompleteTaskDto,
  VerifyTaskDto,
  AdjustmentType,
  TaskActivity
} from '@/features/task-management/types';
import { useUsers } from '@/features/settings/hooks/useSettings';
import { useAuth } from '@/features/auth/AuthContext';
import { Avatar } from '@/features/task-management/components/shared/Avatar';
import { EmptyState } from '@/components/states/EmptyState';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckSquare, Plus, Camera, Upload, Clock, User, DollarSign, AlertTriangle, Trash2 } from 'lucide-react';
import { TaskRowActions } from '@/features/task-management/components/TaskRowActions';
import { TaskForm } from '@/features/task-management/components/TaskForm';
import { TaskKanbanView } from '@/features/task-management/views/TaskKanbanView';
import { TaskCalendarView } from '@/features/task-management/views/TaskCalendarView';
import { TaskEisenhowerMatrixView } from '@/features/task-management/views/TaskEisenhowerMatrixView';
import { ROUTES } from '@/core/routes';

// Move constants outside component to prevent recreation
const STATUSES: (TaskStatus | 'all')[] = ['all', 'Pending', 'In Progress', 'Blocked', 'Review', 'Completed', 'Cancelled', 'Reopened'];
const PRIORITIES: (TaskPriority | 'all')[] = ['all', 'Low', 'Medium', 'High', 'Critical'];
const LINKED_MODULES: LinkedModule[] = ['General'];

type TaskView = 'my-tasks' | 'team' | 'board' | 'calendar' | 'matrix' | 'performance' | 'salary';

// Horizontal workspace navigation (underline tabs).
const NAV_ITEMS: { id: TaskView; label: string }[] = [
  { id: 'my-tasks', label: 'My Tasks' },
  { id: 'team', label: 'Team' },
  { id: 'board', label: 'Board' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'matrix', label: 'Priority Matrix' },
  { id: 'performance', label: 'Performance' },
  { id: 'salary', label: 'Salary' },
];

// Views that share the task search + filter toolbar.
const TASK_VIEWS: TaskView[] = ['my-tasks', 'team', 'board', 'calendar', 'matrix'];

function SalaryAdjustmentForm({ 
  onSubmit, 
  onCancel,
  createMutation
}: { 
  onSubmit: () => void; 
  onCancel: () => void; 
  createMutation: any;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    type: 'Credit' as AdjustmentType,
    amount: '',
    description: '',
    reason: '',
    referenceType: 'Manual' as 'Task' | 'Manual' | 'Bonus' | 'Penalty' | 'Other',
    referenceId: '',
    referenceName: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dto = {
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      reason: formData.reason || undefined,
      referenceType: formData.referenceType || undefined,
      referenceId: formData.referenceId || undefined,
      referenceName: formData.referenceName || undefined,
      notes: formData.notes || undefined,
    };
    createMutation.mutate(dto);
    onSubmit();
  };

  const adjustmentTypes: AdjustmentType[] = ['Credit', 'Deduction', 'Advance', 'Bonus', 'Penalty'];
  const referenceTypes: ('Task' | 'Manual' | 'Bonus' | 'Penalty' | 'Other')[] = ['Task', 'Manual', 'Bonus', 'Penalty', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeId">Employee ID *</Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="employeeName">Employee Name *</Label>
          <Input
            id="employeeName"
            value={formData.employeeName}
            onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Adjustment Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as AdjustmentType })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {adjustmentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="referenceType">Reference Type</Label>
          <Select value={formData.referenceType} onValueChange={(value) => setFormData({ ...formData, referenceType: value as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {referenceTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="referenceId">Reference ID</Label>
          <Input
            id="referenceId"
            value={formData.referenceId}
            onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="referenceName">Reference Name</Label>
        <Input
          id="referenceName"
          value={formData.referenceName}
          onChange={(e) => setFormData({ ...formData, referenceName: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Adjustment</Button>
      </div>
    </form>
  );
}

export default function TaskManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const currentUserId = user?.id || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<TaskView>('my-tasks');

  const { data: tasks, isLoading } = useTasks({
    filter: {
      status: statusFilter === 'all' ? undefined : (statusFilter as TaskStatus),
      priority: priorityFilter === 'all' ? undefined : (priorityFilter as TaskPriority),
      assignedUserId: assigneeFilter === 'all' ? undefined : assigneeFilter,
      linkedModule: moduleFilter === 'all' ? undefined : (moduleFilter as LinkedModule),
      search: searchQuery || undefined,
    },
  });

  const { data: stats } = useTaskStats();
  const { data: employeePerformance, isLoading: performanceLoading } = useEmployeePerformance();
  const { data: salaryAdjustments, isLoading: salaryLoading } = useSalaryAdjustments();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const completeMutation = useCompleteTask();
  const verifyMutation = useVerifyTask();
  const createSalaryMutation = useCreateSalaryAdjustment();

  const myTasks = useMemo(
    () => (tasks || []).filter((t) => !!currentUserId && t.assignedUserId === currentUserId),
    [tasks, currentUserId]
  );
  const isTaskView = TASK_VIEWS.includes(currentView);

  // Create notification when task is assigned
  const handleCreateTask = (data: CreateTaskDto) => {
    createMutation.mutate(data, {
      onSuccess: (task) => {
        createTaskNotification(
          data.assignedUserId,
          'Task Assigned',
          task.taskId,
          task.title,
          'New task assigned to you'
        );
      },
    });
  };

  const columns = useMemo(() => [
    {
      key: 'taskId',
      label: 'Task ID',
      sortable: true,
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
    },
    {
      key: 'assignedUserName',
      label: 'Assigned To',
      sortable: true,
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: TaskPriority) => (
        <Badge
          variant={value === 'Critical' ? 'destructive' : value === 'High' ? 'default' : value === 'Medium' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: TaskStatus) => (
        <Badge
          variant={value === 'Completed' ? 'default' : value === 'In Progress' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'incentiveValue',
      label: 'Incentive (₹)',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium">
          ₹{value?.toLocaleString() || '-'}
        </span>
      ),
    },
    {
      key: 'linkedModule',
      label: 'Linked To',
      sortable: true,
      render: (value: LinkedModule, row: Task) => (
        <div className="text-xs">
          <div className="text-muted-foreground">{value || '-'}</div>
          {row.linkedRecordName && <div className="font-medium">{row.linkedRecordName}</div>}
        </div>
      ),
    },
  ], []);

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteMutation.mutate(taskToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleDuplicate = (task: Task) => {
    const dto: CreateTaskDto = {
      title: `${task.title} (Copy)`,
      description: task.description,
      assignedUserId: task.assignedUserId,
      dueDate: task.dueDate,
      startDate: task.startDate,
      priority: task.priority,
      category: task.category,
      linkedModule: task.linkedModule,
      linkedRecordId: task.linkedRecordId,
      linkedRecordName: task.linkedRecordName,
      incentiveValue: task.incentiveValue,
      estimatedHours: task.estimatedHours,
    };
    createMutation.mutate(dto);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    router.push(ROUTES.tasksDetail(task.id));
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateMutation.mutate({ id: taskId, data: { status: newStatus } as any });
  };

  const handleComplete = (task: Task) => {
    setSelectedTask(task);
    setIsCompleteDialogOpen(true);
  };

  const handleVerify = (task: Task) => {
    setSelectedTask(task);
    setIsVerifyDialogOpen(true);
  };

  const handleViewActivity = (task: Task) => {
    setSelectedTask(task);
    setIsActivityDialogOpen(true);
  };

  // Standard task filters
  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        onChange: setStatusFilter,
        options: STATUSES.map((s) => ({ value: s, label: s === 'all' ? 'All Status' : s })),
      },
      {
        key: 'priority',
        label: 'Priority',
        value: priorityFilter,
        onChange: setPriorityFilter,
        options: PRIORITIES.map((p) => ({ value: p, label: p === 'all' ? 'All Priority' : p })),
      },
      {
        key: 'assignee',
        label: 'Assigned To',
        value: assigneeFilter,
        onChange: setAssigneeFilter,
        options: [
          { value: 'all', label: 'All Assignees' },
          ...users.map((e) => ({ value: e.id, label: e.name })),
        ],
      },
      {
        key: 'module',
        label: 'Linked Module',
        value: moduleFilter,
        onChange: setModuleFilter,
        options: [
          { value: 'all', label: 'All Modules' },
          ...LINKED_MODULES.map((m) => ({ value: m, label: m })),
        ],
      },
    ],
    [statusFilter, priorityFilter, assigneeFilter, moduleFilter, users]
  );

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setModuleFilter('all');
    setSearchQuery('');
  }, []);

  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Employee search (Team + Performance workspaces).
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = employeePerformance || [];
    return q ? list.filter((e) => e.employeeName.toLowerCase().includes(q)) : list;
  }, [employeePerformance, searchQuery]);

  // Adjustment search (Salary workspace).
  const filteredSalary = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = salaryAdjustments || [];
    return q
      ? list.filter(
          (a) =>
            a.employeeName?.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q) ||
            a.type?.toLowerCase().includes(q)
        )
      : list;
  }, [salaryAdjustments, searchQuery]);

  // Per-employee "today" and "late" counts for the Team workspace.
  const teamTaskMeta = useMemo(() => {
    const meta: Record<string, { today: number; late: number }> = {};
    const now = new Date();
    const todayStr = now.toDateString();
    const nowTime = now.getTime();
    for (const t of tasks || []) {
      const m = meta[t.assignedUserId] || { today: 0, late: 0 };
      const due = new Date(t.dueDate);
      if (due.toDateString() === todayStr) m.today += 1;
      if (t.status !== 'Completed' && t.status !== 'Cancelled' && due.getTime() < nowTime) m.late += 1;
      meta[t.assignedUserId] = m;
    }
    return meta;
  }, [tasks]);

  const hasTasks = !!(tasks && tasks.length > 0);

  const handleBulkDelete = () => {
    selectedRows.forEach((id) => deleteMutation.mutate(String(id)));
    setSelectedRows(new Set());
  };

  const handleViewEmployeeTasks = (employeeId: string) => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter(employeeId);
    setCurrentView('board');
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <PageHeader
          title="Task Management"
          subtitle="Tasks, team workload, performance and payments"
          actions={
            currentView === 'salary' ? (
              <Button onClick={() => setIsSalaryDialogOpen(true)} className="h-8">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Adjustment</span>
                <span className="sm:hidden">Add</span>
              </Button>
            ) : currentView === 'performance' ? undefined : (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="h-8">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">Add</span>
              </Button>
            )
          }
        />

        {/* KPI cards — visible on every workspace */}
        {currentView === 'performance' ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard data={{ title: 'Total Employees', value: (employeePerformance?.length ?? 0).toString(), change: 0, color: 'text-blue-600', icon: <User className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Tasks Assigned', value: (employeePerformance?.reduce((s, e) => s + e.tasksAssigned, 0) ?? 0).toString(), change: 0, color: 'text-purple-600', icon: <CheckSquare className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Tasks Completed', value: (employeePerformance?.reduce((s, e) => s + e.tasksCompleted, 0) ?? 0).toString(), change: 0, color: 'text-green-600', icon: <CheckSquare className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Total Payments', value: `₹${(employeePerformance?.reduce((s, e) => s + e.finalPayable, 0) ?? 0).toLocaleString()}`, change: 0, color: 'text-orange-600', icon: <DollarSign className="h-4 w-4" /> }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard data={{ title: 'Open Tasks', value: (stats?.openTasks ?? 0).toString(), change: 0, color: 'text-blue-600', icon: <CheckSquare className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Overdue', value: (stats?.overdueTasks ?? 0).toString(), change: 0, color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Completed Today', value: (stats?.completedToday ?? 0).toString(), change: 0, color: 'text-green-600', icon: <CheckSquare className="h-4 w-4" /> }} />
            <KPICard data={{ title: 'Pending Verification', value: (stats?.pendingVerification ?? 0).toString(), change: 0, color: 'text-orange-600', icon: <Clock className="h-4 w-4" /> }} />
          </div>
        )}

        {/* Workspace navigation — horizontal underline tabs */}
        <div className="border-b" role="tablist" aria-label="Task workspace views">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={currentView === item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'flex-shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                  currentView === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar — one compact row, contextual to the active workspace */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={
              currentView === 'team' || currentView === 'performance'
                ? 'Search employees...'
                : currentView === 'salary'
                ? 'Search adjustments...'
                : 'Search tasks by title or ID...'
            }
            className="w-full sm:flex-1 sm:min-w-[200px] sm:max-w-lg xl:max-w-xl"
          />
          {isTaskView && currentView !== 'team' && (
            <FilterPopover filters={filterConfigs} onClearAll={handleClearFilters} />
          )}
        </div>

        {/* My Tasks */}
        {currentView === 'my-tasks' && (
          <Card className="min-w-0">
            <CardContent className="p-2 sm:p-3">
              {selectedRows.size > 0 && (
                <div className="mb-2 flex items-center justify-between rounded-md border bg-muted/40 px-3 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{selectedRows.size} selected</span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7" onClick={() => setSelectedRows(new Set())}>Clear</Button>
                    <Button variant="destructive" size="sm" className="h-7" onClick={handleBulkDelete}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              <DataTable
                data={myTasks}
                columns={columns}
                loading={isLoading}
                compact
                showToolbar={false}
                enableSelection
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                rowIdKey="id"
                onRowClick={(row) => handleTaskClick(row as Task)}
                emptyMessage="No tasks assigned to you yet. Use “Add Task” to create one."
                rowActions={(row) => (
                  <TaskRowActions
                    task={row as Task}
                    onComplete={handleComplete}
                    onVerify={handleVerify}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onViewActivity={handleViewActivity}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Team — employee workload grid */}
        {currentView === 'team' && (
          performanceLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}><CardContent className="h-[148px] animate-pulse p-3" /></Card>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <Card><CardContent className="p-0"><EmptyState title="No team members" description="No employees match your search." /></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEmployees.map((emp) => {
                const meta = teamTaskMeta[emp.employeeId] || { today: 0, late: 0 };
                return (
                  <Card key={emp.employeeId} className="min-w-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.employeeName} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{emp.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{emp.tasksAssigned} tasks assigned</p>
                        </div>
                        <Badge
                          variant={emp.completionRate >= 90 ? 'default' : emp.completionRate >= 75 ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {emp.completionRate}%
                        </Badge>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${emp.completionRate}%` }} />
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                        <div><p className="text-sm font-semibold text-green-600">{emp.tasksCompleted}</p><p className="text-[11px] text-muted-foreground">Done</p></div>
                        <div><p className="text-sm font-semibold">{emp.tasksPending}</p><p className="text-[11px] text-muted-foreground">Pending</p></div>
                        <div><p className="text-sm font-semibold text-blue-600">{meta.today}</p><p className="text-[11px] text-muted-foreground">Today</p></div>
                        <div><p className="text-sm font-semibold text-red-600">{meta.late}</p><p className="text-[11px] text-muted-foreground">Late</p></div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" size="sm" className="h-7" onClick={() => handleViewEmployeeTasks(emp.employeeId)}>
                          View tasks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        )}

        {/* Board */}
        {currentView === 'board' && (
          <Card className="min-w-0">
            <CardContent className="p-2 sm:p-3">
              {!hasTasks && !isLoading ? (
                <EmptyState
                  title="No tasks to display"
                  description="Tasks you create will appear on the board, grouped by status."
                  actionLabel="Add Task"
                  onAction={() => setIsCreateDialogOpen(true)}
                />
              ) : (
                <TaskKanbanView
                  tasks={tasks || []}
                  onTaskClick={handleTaskClick}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onComplete={handleComplete}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        {currentView === 'calendar' && (
          <Card className="min-w-0">
            <CardContent className="p-2 sm:p-3">
              {!hasTasks && !isLoading ? (
                <EmptyState
                  title="No scheduled tasks"
                  description="Tasks with a due date will appear here on the calendar."
                  actionLabel="Add Task"
                  onAction={() => setIsCreateDialogOpen(true)}
                />
              ) : (
                <TaskCalendarView tasks={tasks || []} onTaskClick={handleTaskClick} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Priority Matrix */}
        {currentView === 'matrix' && (
          <Card className="min-w-0">
            <CardContent className="p-2 sm:p-3">
              {!hasTasks && !isLoading ? (
                <EmptyState
                  title="No tasks to prioritize"
                  description="Tasks are placed into quadrants by urgency and importance."
                  actionLabel="Add Task"
                  onAction={() => setIsCreateDialogOpen(true)}
                />
              ) : (
                <TaskEisenhowerMatrixView
                  tasks={tasks || []}
                  onTaskClick={handleTaskClick}
                  onShowMore={() => setCurrentView('board')}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance */}
        {currentView === 'performance' && (
          <Card className="min-w-0">
            <CardHeader className="border-b px-3 py-2 sm:px-4">
              <CardTitle className="text-sm font-semibold">Employee Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <DataTable
                data={filteredEmployees}
                compact
                loading={performanceLoading}
                emptyMessage="No employees match your search."
                columns={[
                  {
                    key: 'employeeName',
                    label: 'Employee',
                    sortable: true,
                    render: (value: string) => (
                      <div className="flex items-center gap-2">
                        <Avatar name={value} size="xs" />
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ),
                  },
                  { key: 'tasksAssigned', label: 'Assigned', sortable: true },
                  { key: 'tasksCompleted', label: 'Completed', sortable: true },
                  { key: 'tasksPending', label: 'Pending', sortable: true },
                  {
                    key: 'completionRate',
                    label: 'Completion Rate',
                    sortable: true,
                    render: (value: number) => <span className="text-sm font-medium">{value}%</span>,
                  },
                  {
                    key: 'verifiedTaskIncentives',
                    label: 'Total Earned (₹)',
                    sortable: true,
                    render: (value: number) => (
                      <span className="text-sm font-medium">₹{value?.toLocaleString() || '-'}</span>
                    ),
                  },
                  {
                    key: 'totalPerformanceScore',
                    label: 'Performance Score',
                    sortable: true,
                    render: (value: number) => (
                      <Badge
                        variant={value >= 90 ? 'default' : value >= 75 ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {value}
                      </Badge>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        )}

        {/* Salary */}
        {currentView === 'salary' && (
          <Card className="min-w-0">
            <CardHeader className="border-b px-3 py-2 sm:px-4">
              <CardTitle className="text-sm font-semibold">Salary Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <DataTable
                data={filteredSalary}
                compact
                loading={salaryLoading}
                emptyMessage="No salary adjustments match your search."
                columns={[
                  {
                    key: 'employeeName',
                    label: 'Employee',
                    sortable: true,
                    render: (value: string) => (
                      <div className="flex items-center gap-2">
                        <Avatar name={value} size="xs" />
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'type',
                    label: 'Type',
                    sortable: true,
                    render: (value: AdjustmentType) => (
                      <Badge
                        variant={value === 'Credit' || value === 'Bonus' ? 'default' : value === 'Deduction' || value === 'Penalty' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {value}
                      </Badge>
                    ),
                  },
                  {
                    key: 'amount',
                    label: 'Amount (₹)',
                    sortable: true,
                    render: (value: number) => (
                      <span className="text-sm font-medium">₹{value?.toLocaleString() || '-'}</span>
                    ),
                  },
                  { key: 'description', label: 'Description', sortable: true },
                  {
                    key: 'status',
                    label: 'Status',
                    sortable: true,
                    render: (value: string) => (
                      <Badge
                        variant={value === 'Approved' || value === 'Processed' ? 'default' : value === 'Rejected' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {value}
                      </Badge>
                    ),
                  },
                  {
                    key: 'createdAt',
                    label: 'Created',
                    sortable: true,
                    render: (value: Date) => (
                      <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={(data) => { handleCreateTask(data); setIsCreateDialogOpen(false); }} onCancel={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Salary Adjustment Dialog */}
      <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Salary Adjustment</DialogTitle>
          </DialogHeader>
          <SalaryAdjustmentForm onSubmit={() => setIsSalaryDialogOpen(false)} onCancel={() => setIsSalaryDialogOpen(false)} createMutation={createSalaryMutation} />
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <DialogTitle>Delete task</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{taskToDelete?.title}</span>? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm 
              task={selectedTask}
              onSubmit={(data) => { 
                updateMutation.mutate({ id: selectedTask!.id, data: data as any });
                setIsEditDialogOpen(false); 
              }} 
              onCancel={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog with Photo Proof */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Task - Photo Proof Required</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <CompleteTaskForm 
              task={selectedTask}
              onSubmit={(data) => {
                completeMutation.mutate({ id: selectedTask.id, data });
                // Create notification for task completion
                createTaskNotification(
                  selectedTask.assignedUserId,
                  'Task Completed',
                  selectedTask.taskId,
                  selectedTask.title,
                  'Task marked as complete and pending verification'
                );
                setIsCompleteDialogOpen(false);
              }} 
              onCancel={() => setIsCompleteDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Task Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Task Completion</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <VerifyTaskForm 
              task={selectedTask}
              onSubmit={(data) => {
                verifyMutation.mutate({ 
                  id: selectedTask.id, 
                  data,
                  verifiedBy: 'admin-1', // Should come from auth context
                  verifiedByName: 'Admin User' // Should come from auth context
                });
                // Create notification for task verification/rejection
                const notificationType = data.status === 'Verified' ? 'Task Verified' : 'Task Rejected';
                createTaskNotification(
                  selectedTask.assignedUserId,
                  notificationType,
                  selectedTask.taskId,
                  selectedTask.title,
                  data.status === 'Verified' 
                    ? 'Task verified by manager' 
                    : `Task rejected: ${data.verificationNotes || 'No reason provided'}`
                );
                setIsVerifyDialogOpen(false);
              }} 
              onCancel={() => setIsVerifyDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Activity History Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Activity History</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 p-4 rounded-xl">
                <h3 className="font-semibold text-slate-800">{selectedTask.title}</h3>
                <p className="text-sm text-slate-600">{selectedTask.taskId}</p>
              </div>
              {selectedTask.activityHistory && selectedTask.activityHistory.length > 0 ? (
                <div className="space-y-3">
                  {selectedTask.activityHistory.map((activity: TaskActivity, index) => {
                    const getActivityColor = (type: string) => {
                      if (type === 'Created' || type === 'Assigned' || type === 'Started' || type === 'In Progress') return 'bg-sky-100 text-sky-600 border-sky-300';
                      if (type === 'Blocked' || type === 'Rejected' || type === 'Cancelled') return 'bg-rose-100 text-rose-600 border-rose-300';
                      if (type === 'Completed' || type === 'Verified') return 'bg-emerald-100 text-emerald-600 border-emerald-300';
                      if (type === 'Review' || type === 'Due Date Changed' || type === 'Priority Changed') return 'bg-amber-100 text-amber-600 border-amber-300';
                      if (type === 'Photos Uploaded' || type === 'Before Images Added' || type === 'After Images Added' || type === 'Attachment Added') return 'bg-violet-100 text-violet-600 border-violet-300';
                      if (type === 'Comment Added') return 'bg-cyan-100 text-cyan-600 border-cyan-300';
                      if (type === 'Checklist Updated' || type === 'Progress Updated') return 'bg-orange-100 text-orange-600 border-orange-300';
                      return 'bg-slate-100 text-slate-600 border-slate-300';
                    };
                    
                    const iconColor = getActivityColor(activity.activityType);
                    
                    return (
                      <div key={activity.id} className="relative">
                        {index < selectedTask.activityHistory!.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-full bg-gradient-to-b from-slate-200 to-transparent" />
                        )}
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full bg-white border-2 shadow-sm flex items-center justify-center ${iconColor}`}>
                              <Clock className="h-4 w-4" />
                            </div>
                          </div>
                          <div className={`flex-1 p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${iconColor}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-800">{activity.activityType}</span>
                              <span className="text-xs text-slate-600">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-1">{activity.description}</p>
                            <p className="text-xs text-slate-600">By: <span className="font-medium text-slate-700">{activity.performedByName}</span></p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-600 font-medium">No activity history available</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

function CompleteTaskForm({ 
  task, 
  onSubmit, 
  onCancel 
}: { 
  task: Task; 
  onSubmit: (data: CompleteTaskDto) => void; 
  onCancel: () => void; 
}) {
  const [beforePhotoUrls, setBeforePhotoUrls] = useState<File[]>([]);
  const [afterPhotoUrls, setAfterPhotoUrls] = useState<File[]>([]);
  const [notes, setNotes] = useState('');

  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setBeforePhotoUrls([...beforePhotoUrls, ...newFiles]);
    }
  };

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAfterPhotoUrls([...afterPhotoUrls, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (afterPhotoUrls.length === 0) {
      alert('After photo proof is mandatory for task completion');
      return;
    }

    onSubmit({
      completionProof: {
        beforeImages: beforePhotoUrls,
        afterImages: afterPhotoUrls,
        notes,
      },
      completionNotes: notes,
      completedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 font-medium mb-2">
          <Camera className="h-4 w-4 inline mr-2" />
          Photo Proof is Mandatory
        </p>
        <p className="text-xs text-yellow-700">
          You must upload at least one photo as proof of task completion before marking it as complete.
        </p>
      </div>

      <div>
        <Label htmlFor="before-photos">Before Photos (Optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="before-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleBeforePhotoUpload}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
        {beforePhotoUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {beforePhotoUrls.map((file: File, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                Before Photo {index + 1}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="after-photos">After Photos *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="after-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAfterPhotoUpload}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
        {afterPhotoUrls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {afterPhotoUrls.map((file: File, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                After Photo {index + 1}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Completion Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Describe how the task was completed..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={afterPhotoUrls.length === 0}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Complete Task
        </Button>
      </div>
    </form>
  );
}

function VerifyTaskForm({ 
  task, 
  onSubmit, 
  onCancel 
}: { 
  task: Task; 
  onSubmit: (data: VerifyTaskDto) => void; 
  onCancel: () => void; 
}) {
  const [status, setStatus] = useState<'Verified' | 'Rejected'>('Verified');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      status,
      verificationNotes: notes,
      verifiedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {task.completionProof?.afterImages && (
        <div>
          <Label>Completion Proof Photos</Label>
          {task.completionProof.beforeImages && task.completionProof.beforeImages.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-muted-foreground">Before:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {task.completionProof.beforeImages.map((file: File, index: number) => (
                  <Badge key={`before-${index}`} variant="outline" className="text-xs">
                    Before Photo {index + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2">
            <span className="text-xs font-medium text-muted-foreground">After:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {task.completionProof.afterImages.map((file: File, index: number) => (
                <Badge key={`after-${index}`} variant="outline" className="text-xs">
                  After Photo {index + 1}
                </Badge>
              ))}
            </div>
          </div>
          {task.completionProof.videoUrl && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Video Proof Available
              </Badge>
            </div>
          )}
          {task.completionProof.notes && (
            <p className="text-sm text-muted-foreground mt-2">
              Notes: {task.completionProof.notes}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="status">Verification Decision *</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as 'Verified' | 'Rejected')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Verified">Verified</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Verification Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add verification notes..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={status === 'Verified' ? 'default' : 'destructive'}>
          {status === 'Verified' ? 'Verify Task' : 'Reject Task'}
        </Button>
      </div>
    </form>
  );
}
