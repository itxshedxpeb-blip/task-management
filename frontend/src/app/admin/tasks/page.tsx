'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import { formatDate } from '@/lib/date-utils';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useDeleteTask, useCreateTask } from '@/modules/tasks/hooks/useTasks';
import { STATUS_LABELS } from '@/features/task-management/constants/taskConfig';
import { StatusSmartBadge, PrioritySmartBadge } from '@/features/task-management/components/shared/SmartBadge';
import { CountdownTimer } from '@/features/task-management/components/shared/CountdownTimer';
import { getDaysOverdue } from '@/features/task-management/utils/taskFormatters';
import { GlobalFilterPanel, type GlobalFilters } from '@/features/task-management/components/GlobalFilterPanel';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import MobileRichTaskCard from '@/components/mobile/MobileRichTaskCard';
import type { TaskPriority } from '@/features/task-management/types';

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  employees 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  employees: Array<{ id: string; name: string }>;
}) {
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignedUserId, setAssignedUserId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedUserId: assignedUserId || undefined,
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setAssignedUserId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
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
          <div>
            <Label htmlFor="assignee">Assign To (Optional)</Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                ))}
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

export default function AdminTasksPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({ datePreset: 'last-7-days' });
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const deleteTask = useDeleteTask();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const params: Record<string, any> = { page, pageSize };
      if (globalFilters.search || search) params.search = globalFilters.search || search;
      if (globalFilters.status || statusFilter !== 'all') params.status = globalFilters.status || statusFilter;
      if (globalFilters.priority || priorityFilter !== 'all') params.priority = globalFilters.priority || priorityFilter;
      if (globalFilters.sortBy) params.sortBy = globalFilters.sortBy;
      if (globalFilters.sortOrder) params.sortOrder = globalFilters.sortOrder;
      if (globalFilters.dateFrom) params.dateFrom = globalFilters.dateFrom;
      if (globalFilters.dateTo) params.dateTo = globalFilters.dateTo;
      const res: any = await adminApi.getAllTasks(params);
      const data = res?.data || res;
      setTasks(data?.rows || []);
      setPagination(data?.pagination || null);
      
      // Also fetch employees for task assignment
      const empRes: any = await adminApi.getEmployees();
      setEmployees(empRes?.data || empRes || []);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, statusFilter, priorityFilter, globalFilters]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredTasks = useMemo(() => {
    if (!globalFilters.completion) return tasks;
    return tasks.filter((task: any) => {
      switch (globalFilters.completion) {
        case 'on-time':
          return task.status === 'Completed';
        case 'late':
          return task.status === 'CompletedLate';
        case 'incomplete':
          return task.status === 'Incomplete';
        case 'overdue':
          return task.status === 'Overdue';
        default:
          return true;
      }
    });
  }, [tasks, globalFilters.completion]);

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load tasks</p>
            <Button onClick={() => fetchData()} variant="outline" size="sm" className="mt-3">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      {deleteId && (
        <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) { setDeleteId(null); setDeleteTitle(''); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deleteTitle}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteId(null); setDeleteTitle(''); }}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                await deleteTask.mutateAsync(deleteId);
                setDeleteId(null);
                setDeleteTitle('');
                fetchData();
              }} disabled={deleteTask.isPending}>
                {deleteTask.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

  if (!isDesktop) {
    return (
      <div className="pb-20">
        {/* Mobile sticky header */}
        <div className="mobile-sticky-header border-b border-border px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">All Tasks</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(pagination?.total ?? filteredTasks.length)} task
                {(pagination?.total ?? filteredTasks.length) !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" className="h-9" onClick={() => fetchData()}>
              <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-11"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="flex-1 h-10"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Todo">Todo</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="OnHold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="flex-1 h-10"><SelectValue placeholder="Priority" /></SelectTrigger>
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
              className="h-10 relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Filters</span>
              {Object.keys(globalFilters).filter(k => {
                const v = globalFilters[k as keyof GlobalFilters];
                if (k === 'datePreset' && v === 'last-7-days') return false;
                return v !== undefined && v !== null && v !== '';
              }).length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 flex items-center justify-center text-[9px]">
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

        {/* Mobile card list */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
            ))
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground mb-1">No tasks found</p>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            filteredTasks.map((task: any) => (
              <MobileRichTaskCard
                key={task.id}
                task={task}
                href={`/app/tasks/${task.id}`}
                onDelete={(t) => {
                  setDeleteId(t.id);
                  setDeleteTitle(t.title);
                }}
              />
            ))
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 pb-4">
            <p className="text-xs text-muted-foreground">
              {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-1">
                {page}/{pagination.totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {deleteId && (
          <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) { setDeleteId(null); setDeleteTitle(''); } }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{deleteTitle}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDeleteId(null); setDeleteTitle(''); }}>Cancel</Button>
                <Button variant="destructive" onClick={async () => {
                  await deleteTask.mutateAsync(deleteId);
                  setDeleteId(null);
                  setDeleteTitle('');
                  fetchData();
                }} disabled={deleteTask.isPending}>
                  {deleteTask.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all tasks in the system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Task
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
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
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="InProgress">In Progress</SelectItem>
              <SelectItem value="OnHold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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
          ) : filteredTasks.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium mb-1">No tasks found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created Date</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task: any) => {
                  const isOverdue = task.status === 'Overdue' || task.status === 'CompletedLate';
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
                        <StatusSmartBadge
                          status={task.status}
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatDate(task.createdAt)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(task.id);
                            setDeleteTitle(task.title);
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

      <CreateTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} employees={employees} />
    </div>
  );
}
