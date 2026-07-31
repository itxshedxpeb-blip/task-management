import { api } from '@/core/api';
import type {
  EmployeeListParams,
  EmployeeListItem,
  EmployeePerformance,
  EmployeeReport,
  EmployeeTaskRow,
  EmployeeTasksParams,
  EmployeeTimelineEvent,
  PaginationMeta,
} from '../types/employeePerformance';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

export const employeePerformanceApi = {
  getEmployees: (params?: EmployeeListParams) =>
    api.get<BackendResponse<{ rows: EmployeeListItem[]; pagination: PaginationMeta }>>(
      '/admin/employees',
      { params },
    ),

  getEmployeePerformance: (id: string) =>
    api.get<BackendResponse<EmployeePerformance>>(`/admin/employees/${id}`),

  getEmployeeTasks: (id: string, params?: EmployeeTasksParams) =>
    api.get<BackendResponse<{ rows: EmployeeTaskRow[]; pagination: PaginationMeta }>>(
      `/admin/employees/${id}/tasks`,
      { params },
    ),

  getEmployeeTimeline: (id: string, limit?: number) =>
    api.get<BackendResponse<EmployeeTimelineEvent[]>>(`/admin/employees/${id}/timeline`, {
      params: limit ? { limit } : undefined,
    }),

  getEmployeeReport: (id: string) =>
    api.get<BackendResponse<EmployeeReport>>(`/admin/employees/${id}/report`),
};
