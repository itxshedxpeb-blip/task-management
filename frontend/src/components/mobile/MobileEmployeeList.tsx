'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  UserCheck,
  UserX,
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
import MobileEmployeeCard from './MobileEmployeeCard';
import type { EmployeeListItem } from '@/modules/admin/types/employeePerformance';

interface MobileEmployeeListProps {
  employees: EmployeeListItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onCreateEmployee?: () => void;
  onEditEmployee?: (employee: EmployeeListItem) => void;
  onToggleStatus?: (employee: EmployeeListItem) => void;
  onDeleteEmployee?: (employee: EmployeeListItem) => void;
  total?: number;
  className?: string;
}

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function MobileEmployeeList({
  employees,
  isLoading = false,
  onRefresh,
  onCreateEmployee,
  onEditEmployee,
  onToggleStatus,
  onDeleteEmployee,
  total,
  className,
}: MobileEmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchQuery === '' ||
      (employee.name &&
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || employee.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && employee.isActive) ||
      (statusFilter === 'inactive' && !employee.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeFiltersCount =
    (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
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
          
          {onCreateEmployee && (
            <Button
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={onCreateEmployee}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-in slide-in-from-top-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        )}
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-muted/30 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No employees found
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Add your first employee to get started'}
            </p>
            {onCreateEmployee && (
              <Button className="mt-4" onClick={onCreateEmployee}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {total ?? filteredEmployees.length} employee
                {(total ?? filteredEmployees.length) !== 1 ? 's' : ''}
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
              {filteredEmployees.map((employee) => (
                <MobileEmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={onEditEmployee}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDeleteEmployee}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}