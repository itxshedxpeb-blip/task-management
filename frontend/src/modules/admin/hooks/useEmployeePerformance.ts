import { useQuery } from '@tanstack/react-query';
import { employeePerformanceApi } from '../services/employeePerformanceApi';
import type {
  EmployeeListParams,
  EmployeeTasksParams,
} from '../types/employeePerformance';

export function useEmployeeList(params?: EmployeeListParams) {
  return useQuery({
    queryKey: ['admin-employee-performance-list', params],
    queryFn: () => employeePerformanceApi.getEmployees(params),
    staleTime: 60 * 1000,
  });
}

export function useEmployeePerformance(id?: string | null) {
  return useQuery({
    queryKey: ['admin-employee-performance', id],
    queryFn: () => employeePerformanceApi.getEmployeePerformance(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeTasks(id?: string | null, params?: EmployeeTasksParams) {
  return useQuery({
    queryKey: ['admin-employee-tasks', id, params],
    queryFn: () => employeePerformanceApi.getEmployeeTasks(id!, params),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useEmployeeTimeline(id?: string | null, limit?: number) {
  return useQuery({
    queryKey: ['admin-employee-timeline', id, limit],
    queryFn: () => employeePerformanceApi.getEmployeeTimeline(id!, limit),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeReport(id?: string | null) {
  return useQuery({
    queryKey: ['admin-employee-report', id],
    queryFn: () => employeePerformanceApi.getEmployeeReport(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useEmployeeToday(id?: string | null) {
  return useQuery({
    queryKey: ['admin-employee-today', id],
    queryFn: () => employeePerformanceApi.getEmployeeToday(id!),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}
