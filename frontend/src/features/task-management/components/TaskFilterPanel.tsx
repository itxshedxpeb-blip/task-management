'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { TaskStatus, TaskPriority, LinkedModule, TaskCategory } from '../types';
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

interface TaskFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  currentFilters: TaskFilters;
  employees: Array<{ id: string; name: string }>;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  category?: TaskCategory;
  linkedModule?: LinkedModule;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  hasImages?: boolean;
  hasChecklist?: boolean;
  hasAttachments?: boolean;
  tags?: string[];
}

const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Blocked', 'Review', 'Completed', 'Cancelled', 'Reopened'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const CATEGORIES: TaskCategory[] = ['General', 'Office', 'Field Work', 'Maintenance', 'Installation', 'Inspection', 'Documentation', 'Meeting', 'Training', 'Other'];
const MODULES: LinkedModule[] = ['General'];

export const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  currentFilters,
  employees,
}) => {
  const [filters, setFilters] = useState<TaskFilters>(currentFilters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const updateFilter = (key: keyof TaskFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: TaskFilters = {};
    setFilters(emptyFilters);
    onClearFilters();
    onClose();
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof TaskFilters];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof TaskFilters];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    }).length;
  };

  return (
    <div className={cn('border-l bg-background', isOpen ? 'w-full sm:w-80' : 'w-0 overflow-hidden transition-all duration-300')}>
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm">Priority</Label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => updateFilter('priority', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label className="text-sm">Assigned To</Label>
            <Select
              value={filters.assignedTo || 'all'}
              onValueChange={(value) => updateFilter('assignedTo', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All employees</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm">Category</Label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Linked Module */}
          <div className="space-y-2">
            <Label className="text-sm">Linked Module</Label>
            <Select
              value={filters.linkedModule || 'all'}
              onValueChange={(value) => updateFilter('linkedModule', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                {MODULES.map(module => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date Range */}
          <div className="space-y-2">
            <Label className="text-sm">Due Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.dueDateFrom ? filters.dueDateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('dueDateFrom', e.target.value ? new Date(e.target.value) : undefined)}
              />
              <Input
                type="date"
                value={filters.dueDateTo ? filters.dueDateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('dueDateTo', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Created Date Range */}
          <div className="space-y-2">
            <Label className="text-sm">Created Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={filters.createdDateFrom ? filters.createdDateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('createdDateFrom', e.target.value ? new Date(e.target.value) : undefined)}
              />
              <Input
                type="date"
                value={filters.createdDateTo ? filters.createdDateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('createdDateTo', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <Label className="text-sm">Quick Filters</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasImages"
                  checked={filters.hasImages || false}
                  onCheckedChange={(checked) => updateFilter('hasImages', checked)}
                />
                <Label htmlFor="hasImages" className="text-sm cursor-pointer">
                  Has Images
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasChecklist"
                  checked={filters.hasChecklist || false}
                  onCheckedChange={(checked) => updateFilter('hasChecklist', checked)}
                />
                <Label htmlFor="hasChecklist" className="text-sm cursor-pointer">
                  Has Checklist
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAttachments"
                  checked={filters.hasAttachments || false}
                  onCheckedChange={(checked) => updateFilter('hasAttachments', checked)}
                />
                <Label htmlFor="hasAttachments" className="text-sm cursor-pointer">
                  Has Attachments
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleApply} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button variant="outline" onClick={handleClear} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
