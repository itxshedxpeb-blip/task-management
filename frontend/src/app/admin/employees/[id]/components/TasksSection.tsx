'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { dayjs, formatDate } from '@/lib/date-utils';
import { ProgressBar } from '@/features/task-management/components/shared/ProgressBar';
import { StatusBadge } from '@/features/task-management/components/shared/StatusBadge';
import { PriorityBadge } from '@/features/task-management/components/shared/PriorityBadge';
import type { TaskCategory, TaskPriority, TaskStatus } from '@/features/task-management/types';
import { useEmployeeTasks } from '@/modules/admin/hooks/useEmployeePerformance';
import type { EmployeeTaskRow } from '@/modules/admin/types/employeePerformance';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: TaskStatus[] = ['Draft', 'Todo', 'InProgress', 'OnHold', 'Completed', 'Archived', 'Cancelled'];
const PRIORITY_OPTIONS: TaskPriority[] = ['None', 'Low', 'Medium', 'High', 'Urgent'];
const CATEGORY_OPTIONS: TaskCategory[] = [
  'General',
  'Office',
  'Field Work',
  'Maintenance',
  'Installation',
  'Inspection',
  'Documentation',
  'Meeting',
  'Training',
  'Other',
];

type SortKey = 'createdAt' | 'dueDate' | 'completedAt' | 'priority' | 'progress' | 'title';

function SortableHeader({
  label,
  sortKey,
  sortBy,
  sortOrder,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sortBy: SortKey;
  sortOrder: 'asc' | 'desc';
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortBy === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      {label}
      {active && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

export function TasksSection({ employeeId }: { employeeId: string }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TaskStatus>('all');
  const [priority, setPriority] = useState<'all' | TaskPriority>('all');
  const [category, setCategory] = useState<'all' | TaskCategory>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      status: status !== 'all' ? status : undefined,
      priority: priority !== 'all' ? priority : undefined,
      category: category !== 'all' ? category : undefined,
      overdue: overdueOnly,
      sortBy,
      sortOrder,
    }),
    [page, search, status, priority, category, overdueOnly, sortBy, sortOrder],
  );

  const { data, isLoading, error, refetch } = useEmployeeTasks(employeeId, params);

  const rows: EmployeeTaskRow[] = (data as any)?.data?.rows || [];
  const pagination = (data as any)?.data?.pagination;

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder(key === 'title' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const isOverdue = (row: EmployeeTaskRow) =>
    row.dueDate &&
    row.status !== 'Completed' &&
    row.status !== 'Archived' &&
    row.status !== 'Cancelled' &&
    dayjs(row.dueDate).isBefore(dayjs(), 'day');

  return (
    <Card id="tasks" className="scroll-mt-24">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold">Assigned Tasks</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Switch checked={overdueOnly} onCheckedChange={(v) => { setOverdueOnly(v); setPage(1); }} />
            Overdue only
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={(v) => { setPriority(v as any); setPage(1); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {PRIORITY_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v as any); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error ? (
          <div className="py-10 text-center">
            <p className="mb-2 text-sm text-muted-foreground">Failed to load tasks.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>
                    <SortableHeader label="Title" sortKey="title" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell w-[120px]">
                    <SortableHeader label="Progress" sortKey="progress" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <SortableHeader label="Created" sortKey="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <SortableHeader label="Due" sortKey="dueDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}><Skeleton className="h-6 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      No tasks match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs tabular-nums text-muted-foreground">#{row.taskId}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <Link
                          href={`/app/tasks/${row.id}`}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:underline"
                        >
                          {row.title}
                        </Link>
                      </TableCell>
                      <TableCell><PriorityBadge priority={row.priority} className="text-[10px]" /></TableCell>
                      <TableCell><StatusBadge status={row.status} className="text-[10px]" /></TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{row.category || '—'}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={row.progress} size="sm" className="min-w-[60px]" />
                          <span className="text-xs tabular-nums text-muted-foreground">{row.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{formatDate(row.createdAt)}</TableCell>
                      <TableCell className={cn('hidden text-xs sm:table-cell', isOverdue(row) ? 'font-semibold text-red-500' : 'text-muted-foreground')}>
                        {formatDate(row.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7" title="Open task">
                          <Link href={`/app/tasks/${row.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs text-muted-foreground">Page {page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
