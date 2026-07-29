'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '../types';
import {
  X,
  Search,
  SlidersHorizontal,
  Check,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';

const STATUSES: TaskStatus[] = ['Draft', 'Todo', 'InProgress', 'OnHold', 'Completed', 'Archived', 'Cancelled'];
const PRIORITIES: TaskPriority[] = ['None', 'Low', 'Medium', 'High', 'Urgent'];

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last Week', value: 'last-week' },
  { label: 'Next Week', value: 'next-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'Next Month', value: 'next-month' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last 7 Days', value: 'last-7-days' },
  { label: 'Last 30 Days', value: 'last-30-days' },
  { label: 'Custom Range', value: 'custom' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Priority High', value: 'priority:desc' },
  { label: 'Priority Low', value: 'priority:asc' },
  { label: 'Due Date', value: 'dueDate:asc' },
  { label: 'Recently Updated', value: 'updatedAt:desc' },
  { label: 'Task Name', value: 'title:asc' },
];

export interface GlobalFilters {
  search?: string;
  datePreset?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  completion?: 'on-time' | 'late' | 'incomplete' | 'overdue';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface GlobalFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: GlobalFilters) => void;
  onClear: () => void;
  filters: GlobalFilters;
}

function getDateRange(preset: string): { from: string; to: string } | null {
  const now = new Date();
  const startOfDay = (d: Date) => { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; };
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'today': return { from: fmt(startOfDay(now)), to: fmt(startOfDay(now)) };
    case 'tomorrow': { const d = new Date(now); d.setDate(d.getDate() + 1); return { from: fmt(startOfDay(d)), to: fmt(startOfDay(d)) }; }
    case 'yesterday': { const d = new Date(now); d.setDate(d.getDate() - 1); return { from: fmt(startOfDay(d)), to: fmt(startOfDay(d)) }; }
    case 'this-week': {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'last-week': {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay() - 7); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'next-week': {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 7); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'next-month': {
      const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'this-quarter': {
      const qStart = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qStart, 1);
      const end = new Date(now.getFullYear(), qStart + 3, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'this-year': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'last-7-days': {
      const end = new Date(now);
      const start = new Date(now); start.setDate(now.getDate() - 7);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'last-30-days': {
      const end = new Date(now);
      const start = new Date(now); start.setDate(now.getDate() - 30);
      return { from: fmt(start), to: fmt(end) };
    }
    default: return null;
  }
}

export function GlobalFilterPanel({ isOpen, onClose, onApply, onClear, filters: initialFilters }: GlobalFilterPanelProps) {
  const [filters, setFilters] = useState<GlobalFilters>(initialFilters);

  const updateFilter = <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'datePreset' && value !== 'custom') {
        const range = getDateRange(value as string);
        if (range) { next.dateFrom = range.from; next.dateTo = range.to; }
      }
      return next;
    });
  };

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      if (k === 'datePreset' && v === 'last-7-days') return false;
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }, [filters]);

  const handleApply = () => { onApply(filters); onClose(); };
  const handleClear = () => { setFilters({ datePreset: 'last-7-days' }); onClear(); onClose(); };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      <div className={cn(
        'fixed right-0 top-0 h-full w-full max-w-sm bg-background border-l shadow-xl z-50',
        'flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs">{activeCount}</Badge>
            )}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Task name, description, ID..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Date Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" /> Date Range
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateFilter('datePreset', preset.value)}
                  className={cn(
                    'px-2 py-1.5 text-xs rounded-md border transition-colors',
                    filters.datePreset === preset.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 hover:bg-muted border-transparent',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {filters.datePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input type="date" value={filters.dateFrom || ''} onChange={(e) => updateFilter('dateFrom', e.target.value)} />
                <Input type="date" value={filters.dateTo || ''} onChange={(e) => updateFilter('dateTo', e.target.value)} />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={filters.status || 'all'} onValueChange={(v) => updateFilter('status', v === 'all' ? undefined : v as TaskStatus)}>
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={filters.priority || 'all'} onValueChange={(v) => updateFilter('priority', v === 'all' ? undefined : v as TaskPriority)}>
              <SelectTrigger><SelectValue placeholder="All priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Completion */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Completion
            </Label>
            <Select value={filters.completion || 'all'} onValueChange={(v) => updateFilter('completion', v === 'all' ? undefined : v as GlobalFilters['completion'])}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="on-time">Completed On Time</SelectItem>
                <SelectItem value="late">Completed Late</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="overdue">Currently Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
            </Label>
            <Select
              value={filters.sortBy ? `${filters.sortBy}:${filters.sortOrder}` : 'newest'}
              onValueChange={(v) => {
                const [field, order] = v.split(':');
                updateFilter('sortBy', field);
                updateFilter('sortOrder', order as 'asc' | 'desc');
              }}
            >
              <SelectTrigger><SelectValue placeholder="Newest first" /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex gap-2">
          <Button onClick={handleApply} className="flex-1">
            <Check className="h-4 w-4 mr-2" /> Apply
          </Button>
          <Button variant="outline" onClick={handleClear} className="flex-1">
            <X className="h-4 w-4 mr-2" /> Clear
          </Button>
        </div>
      </div>
    </>
  );
}
