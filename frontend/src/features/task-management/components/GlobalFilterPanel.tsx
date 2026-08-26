'use client';

import React, { useState, useMemo } from 'react';
import * as PortalPrimitive from '@radix-ui/react-portal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '../types';
import {
  X,
  Search,
  SlidersHorizontal,
  Check,
  Calendar as CalendarIcon,
  ArrowUpDown,
} from 'lucide-react';

const Portal = PortalPrimitive.Root;

const STATUSES: (TaskStatus | 'all')[] = ['all', 'Todo', 'InProgress', 'Completed', 'CompletedLate', 'Incomplete', 'Overdue'];
const PRIORITIES: (TaskPriority | 'all')[] = ['all', 'Low', 'Medium', 'High', 'Urgent'];

const MOBILE_DATE_PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Custom', value: 'custom' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt:desc' },
  { label: 'Oldest', value: 'createdAt:asc' },
  { label: 'Priority', value: 'priority:desc' },
  { label: 'Status', value: 'status:asc' },
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
    case 'all': return null;
    case 'today': return { from: fmt(startOfDay(now)), to: fmt(startOfDay(now)) };
    case 'yesterday': { const d = new Date(now); d.setDate(d.getDate() - 1); return { from: fmt(startOfDay(d)), to: fmt(startOfDay(d)) }; }
    case 'this-week': {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
      const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
      return { from: fmt(start), to: fmt(end) };
    }
    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: fmt(start), to: fmt(end) };
    }
    default: return null;
  }
}

export function GlobalFilterPanel({ isOpen, onClose, onApply, onClear, filters: initialFilters }: GlobalFilterPanelProps) {
  const [filters, setFilters] = useState<GlobalFilters>(initialFilters);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const updateFilter = <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'datePreset' && value !== 'custom') {
        const range = getDateRange(value as string);
        if (range) { next.dateFrom = range.from; next.dateTo = range.to; }
        else { next.dateFrom = undefined; next.dateTo = undefined; }
        setShowCustomDate(false);
      }
      if (key === 'datePreset' && value === 'custom') {
        setShowCustomDate(true);
      }
      return next;
    });
  };

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([k, v]) => {
      if (k === 'datePreset' && (v === 'today' || v === 'all')) return false;
      if (v === undefined || v === null || v === '' || v === 'all') return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }, [filters]);

  const handleApply = () => { onApply(filters); onClose(); };
  const handleReset = () => { 
    setFilters({ datePreset: 'all' }); 
    setShowCustomDate(false);
    onClear(); 
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <>
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-in fade-in duration-200" onClick={onClose} />
        <div 
          className={cn(
            'fixed bottom-0 left-0 right-0 lg:right-0 lg:top-0 lg:h-full lg:max-w-sm bg-background border-t lg:border-t-0 lg:border-l shadow-2xl z-50',
            'flex flex-col rounded-t-3xl lg:rounded-none',
            'transition-transform duration-300 ease-out',
            isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full',
            'max-h-[85vh] lg:max-h-full'
          )}
          style={{ 
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">{activeCount}</span>
              )}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-base font-bold text-slate-800">Search</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search tasks..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-12 h-12 rounded-2xl text-base"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Date
              </Label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {MOBILE_DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => updateFilter('datePreset', preset.value)}
                    className={cn(
                      'flex-shrink-0 h-10 px-4 rounded-full text-sm font-medium transition-all duration-200',
                      'whitespace-nowrap',
                      filters.datePreset === preset.value
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {showCustomDate && (
                <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input 
                    type="date" 
                    value={filters.dateFrom || ''} 
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="h-12 rounded-2xl"
                  />
                  <Input 
                    type="date" 
                    value={filters.dateTo || ''} 
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-slate-800">Status</Label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateFilter('status', status === 'all' ? undefined : status as TaskStatus)}
                    className={cn(
                      'h-10 px-4 rounded-full text-sm font-medium transition-all duration-200',
                      'whitespace-nowrap',
                      (filters.status === status || (filters.status === undefined && status === 'all'))
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    )}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-slate-800">Priority</Label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => updateFilter('priority', priority === 'all' ? undefined : priority as TaskPriority)}
                    className={cn(
                      'h-10 px-4 rounded-full text-sm font-medium transition-all duration-200',
                      'whitespace-nowrap',
                      (filters.priority === priority || (filters.priority === undefined && priority === 'all'))
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    )}
                  >
                    {priority === 'all' ? 'All' : priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" /> Sort
              </Label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const [field, order] = option.value.split(':');
                      updateFilter('sortBy', field);
                      updateFilter('sortOrder', order as 'asc' | 'desc');
                    }}
                    className={cn(
                      'h-10 px-4 rounded-full text-sm font-medium transition-all duration-200',
                      'whitespace-nowrap',
                      filters.sortBy && `${filters.sortBy}:${filters.sortOrder}` === option.value
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 p-4 bg-background border-t space-y-3 lg:static">
            <div className="flex gap-3">
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="flex-1 h-13 rounded-2xl text-base font-medium"
              >
                Reset
              </Button>
              <Button 
                onClick={handleApply} 
                className="flex-1 h-13 rounded-2xl text-base font-medium bg-blue-500 hover:bg-blue-600"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </>
    </Portal>
  );
}
