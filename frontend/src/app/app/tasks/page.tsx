'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Inbox,
  Filter,
  Trash2,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, toInputDate } from '@/lib/date-utils';
import { useTasks, useCreateTask, useDeleteTask, useMoveTask } from '@/modules/tasks/hooks/useTasks';
import { useAuth } from '@/features/auth/AuthContext';
import type { TaskStatus, TaskPriority } from '@/features/task-management/types';
import { STATUS_LABELS, STATUS_TRANSITIONS } from '@/features/task-management/constants/taskConfig';
import { StatusSmartBadge, PrioritySmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import { CountdownTimer } from '@/features/task-management/components/shared/CountdownTimer';
import { getDaysOverdue } from '@/features/task-management/utils/taskFormatters';
import { GlobalFilterPanel, type GlobalFilters } from '@/features/task-management/components/GlobalFilterPanel';

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

const STATUS_TABS = ['all', 'Draft', 'Todo', 'InProgress', 'OnHold', 'Completed'];

function DeleteTaskDialog({ taskId, taskTitle, open, onOpenChange }: { taskId: string; taskTitle: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const deleteTask = useDeleteTask();
  const router = useRouter();

  const handleDelete = async () => {
    await deleteTask.mutateAsync(taskId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{taskTitle}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteTask.isPending}>
            {deleteTask.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateTaskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Todo');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      assignedUserId: user?.id || '',
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('Todo');
    setDueDate('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ct-title">Title *</Label>
          <Input id="ct-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-desc">Description</Label>
          <Textarea id="ct-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="OnHold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ct-due">Due Date</Label>
          <Input id="ct-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={createTask.isPending || !title.trim()}>
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteTaskTitle, setDeleteTaskTitle] = useState('');
  const [statusDropdownTaskId, setStatusDropdownTaskId] = useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({ datePreset: 'last-7-days' });
  const moveTask = useMoveTask();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pageSize = 15;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownTaskId(null);
      }
    };
    if (statusDropdownTaskId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusDropdownTaskId]);

  const { data, isLoading, error, refetch } = useTasks({
    page,
    pageSize,
    search: globalFilters.search || search || undefined,
    status: (globalFilters.status || (statusFilter !== 'all' ? statusFilter : undefined)) as TaskStatus | undefined,
    priority: (globalFilters.priority || (priorityFilter !== 'all' ? priorityFilter : undefined)) as TaskPriority | undefined,
    sortBy: globalFilters.sortBy,
    sortOrder: globalFilters.sortOrder,
    dateFrom: globalFilters.dateFrom,
    dateTo: globalFilters.dateTo,
    showAll: !!globalFilters.dateFrom || !!globalFilters.dateTo,
  });

  const allTasks = useMemo(() => data?.rows || [], [data?.rows]);
  const pagination = data?.pagination;

  const tasks = useMemo(() => {
    if (!globalFilters.completion) return allTasks;
    const now = new Date();
    return allTasks.filter((task) => {
      switch (globalFilters.completion) {
        case 'on-time':
          return (task.status === 'Completed' || task.status === 'Archived') &&
            task.completedAt && new Date(task.completedAt) <= new Date(task.dueDate);
        case 'late':
          return (task.status === 'Completed' || task.status === 'Archived') &&
            task.completedAt && new Date(task.completedAt) > new Date(task.dueDate);
        case 'incomplete':
          return task.status !== 'Completed' && task.status !== 'Archived' && task.status !== 'Cancelled';
        case 'overdue':
          return task.status !== 'Completed' && task.status !== 'Archived' && task.status !== 'Cancelled' &&
            new Date(task.dueDate) < now;
        default:
          return true;
      }
    });
  }, [allTasks, globalFilters.completion]);

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load tasks</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      {deleteTaskId && (
        <DeleteTaskDialog
          taskId={deleteTaskId}
          taskTitle={deleteTaskTitle}
          open={!!deleteTaskId}
          onOpenChange={(v) => { if (!v) { setDeleteTaskId(null); setDeleteTaskTitle(''); } }}
        />
      )}
    </div>
  );
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your tasks.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Task</Button>
          </DialogTrigger>
          <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusFilter(tab); setPage(1); }}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
              statusFilter === tab
                ? 'bg-blue-500/15 text-blue-500'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab === 'all' ? 'All' : tab === 'InProgress' ? 'In Progress' : tab === 'OnHold' ? 'On Hold' : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterPanelOpen(true)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5" />
            Filters
            {Object.keys(globalFilters).filter(k => {
              const v = globalFilters[k as keyof GlobalFilters];
              if (k === 'datePreset' && v === 'last-7-days') return false;
              return v !== undefined && v !== null && v !== '';
            }).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {Object.keys(globalFilters).filter(k => {
                  const v = globalFilters[k as keyof GlobalFilters];
                  if (k === 'datePreset' && v === 'last-7-days') return false;
                  return v !== undefined && v !== null && v !== '';
                }).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <GlobalFilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        onApply={(f) => { setGlobalFilters(f); setPage(1); }}
        onClear={() => { setGlobalFilters({ datePreset: 'last-7-days' }); setPage(1); }}
        filters={globalFilters}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton />
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium mb-1">No tasks found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Create your first task to get started.'}
              </p>
              {!search && statusFilter === 'all' && priorityFilter === 'all' && (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                  <TableHead className="hidden md:table-cell">Countdown</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const isOverdue = getDaysOverdue(task.dueDate) !== null && getDaysOverdue(task.dueDate)! > 0 && task.status !== 'Completed' && task.status !== 'Archived' && task.status !== 'Cancelled';
                  return (
                    <TableRow
                      key={task.id}
                      className={cn('cursor-pointer', isOverdue && 'bg-red-500/5 hover:bg-red-500/10')}
                      onClick={() => router.push(`/app/tasks/${task.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        TSK-{String(task.taskId).padStart(3, '0')}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground hover:text-primary transition-colors">
                          {task.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <PrioritySmartBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="relative" ref={statusDropdownTaskId === task.id ? dropdownRef : undefined}>
                          {STATUS_TRANSITIONS[task.status as TaskStatus]?.length > 0 ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatusDropdownTaskId(statusDropdownTaskId === task.id ? null : task.id);
                                }}
                                className="flex items-center gap-1.5 group"
                              >
                                <StatusSmartBadge
                                  status={task.status as TaskStatus}
                                  dueDate={task.dueDate}
                                  completedAt={task.completedAt}
                                />
                                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                              {statusDropdownTaskId === task.id && (
                                <div className="absolute z-50 top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px]">
                                  {STATUS_TRANSITIONS[task.status as TaskStatus].map((nextStatus) => (
                                    <button
                                      key={nextStatus}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveTask.mutate({ id: task.id, status: nextStatus });
                                        setStatusDropdownTaskId(null);
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                                    >
                                      <span className={cn('h-2 w-2 rounded-full', {
                                        'bg-gray-400': nextStatus === 'Draft',
                                        'bg-blue-500': nextStatus === 'Todo',
                                        'bg-orange-500': nextStatus === 'InProgress',
                                        'bg-yellow-500': nextStatus === 'OnHold',
                                        'bg-emerald-500': nextStatus === 'Completed',
                                        'bg-gray-600': nextStatus === 'Archived',
                                        'bg-red-500': nextStatus === 'Cancelled',
                                      })} />
                                      {STATUS_LABELS[nextStatus]}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <StatusSmartBadge
                              status={task.status as TaskStatus}
                              dueDate={task.dueDate}
                              completedAt={task.completedAt}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <CountdownTimer
                          dueDate={task.dueDate}
                          completed={task.status === 'Completed' || task.status === 'Archived'}
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTaskId(task.id);
                            setDeleteTaskTitle(task.title);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
