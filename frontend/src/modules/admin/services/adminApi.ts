import { api } from '@/core/api';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  rows: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const adminApi = {
  login: (data: { email: string; password: string }) =>
    api.post<BackendResponse<{ accessToken: string; sessionId: string; user: any }>>('/auth/login', data),

  getDashboardStats: () =>
    api.get<BackendResponse<any>>('/admin/dashboard/stats'),

  getEmployees: (params?: any) =>
    api.get<BackendResponse<PaginatedResponse<any>>>('/admin/users', { params }),

  getEmployeeById: (id: string) =>
    api.get<BackendResponse<any>>(`/admin/users/${id}`),

  createEmployee: (data: any) =>
    api.post<BackendResponse<any>>('/admin/users', data),

  updateEmployee: (id: string, data: any) =>
    api.patch<BackendResponse<any>>(`/admin/users/${id}`, data),

  deleteEmployee: (id: string) =>
    api.delete<BackendResponse<void>>(`/admin/users/${id}`),

  toggleEmployeeStatus: (id: string) =>
    api.patch<BackendResponse<any>>(`/admin/users/${id}/toggle-status`),

  getAllTasks: (params?: any) =>
    api.get<BackendResponse<PaginatedResponse<any>>>('/tasks', { params }),

  getReports: () =>
    api.get<BackendResponse<any>>('/admin/reports'),

  getSystemSettings: () =>
    api.get<BackendResponse<any>>('/admin/settings'),

  updateSystemSettings: (data: any) =>
    api.patch<BackendResponse<any>>('/admin/settings', data),
};
