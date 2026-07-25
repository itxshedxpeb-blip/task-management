import { api } from '@/core/api';

export const adminApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/admin/auth/login', data),
  getDashboardStats: () =>
    api.get('/admin/dashboard/stats'),
  getCompanies: (params?: any) =>
    api.get('/admin/companies', { params }),
  createCompany: (data: any) =>
    api.post('/admin/companies', data),
  updateCompany: (id: string, data: any) =>
    api.patch(`/admin/companies/${id}`, data),
  deleteCompany: (id: string) =>
    api.delete(`/admin/companies/${id}`),
  suspendCompany: (id: string) =>
    api.patch(`/admin/companies/${id}/suspend`),
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  createUser: (data: any) =>
    api.post('/admin/users', data),
  updateUser: (id: string, data: any) =>
    api.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  getAuditLogs: (params?: any) =>
    api.get('/admin/audit-logs', { params }),
  getOrganizations: (params?: any) =>
    api.get('/admin/organizations', { params }),
  getPlans: (params?: any) =>
    api.get('/admin/plans', { params }),
  getAnalytics: () =>
    api.get('/admin/analytics'),
  getSystemSettings: () =>
    api.get('/admin/settings'),
  updateSystemSettings: (data: any) =>
    api.patch('/admin/settings', data),
};
