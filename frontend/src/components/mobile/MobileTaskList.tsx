'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import TaskCard from './TaskCard';
import type { Task, TaskStatus, TaskPriority } from '@/features/task-management/types';

interface MobileTaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateTask?: () => void;
  onTaskClick?: (task: Task) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'Todo', label: 'Todo' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'OnHold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Priority' },
  { value: 'Urgent', label: 'Urgent' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export function MobileTaskList({
  tasks,
  isLoading = false,
  onRefresh,
  onCreateTask,
  onTaskClick,
  className,
}: MobileTaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const activeFiltersCount =
    (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 h-10"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {onCreateTask && (
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onCreateTask}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-in slide-in-from-top-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tasks found
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Create your first task to get started'}
            </p>
            {onCreateTask && (
              <Button
                className="mt-4"
                onClick={onCreateTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </p>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8 text-xs"
                >
                  Refresh
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}