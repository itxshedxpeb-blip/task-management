/**
 * Task Management API Service
 * API calls for Task Management, Employee Performance, and Salary Adjustments
 *
 * Real backend only — errors propagate (no mock fallbacks).
 */

import { api } from '@/core/api';
import { guardModuleApi } from '@/core/api/capabilities';
import {
  Task,
  EmployeePerformanceStats,
  SalaryAdjustment,
  EmployeeSalaryLedger,
  CreateTaskDto,
  UpdateTaskDto,
  CompleteTaskDto,
  VerifyTaskDto,
  CreateSalaryAdjustmentDto,
  UpdateSalaryAdjustmentDto,
  TaskQuery,
  TaskStats,
  DashboardTaskKPIs,
  SalaryAdjustmentQuery,
} from '../types';

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

export const taskManagementApi = guardModuleApi('task', {
  // Task CRUD
  async getAll(query?: TaskQuery): Promise<Task[]> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;
    if (query?.pageSize) params.pageSize = query.pageSize;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    if (query?.filter?.search) params.search = query.filter.search;
    if (query?.filter?.status) params.status = query.filter.status;
    if (query?.filter?.priority) params.priority = query.filter.priority;
    if (query?.filter?.assignedUserId) params.assignedUserId = query.filter.assignedUserId;
    if (query?.filter?.linkedModule) params.linkedModule = query.filter.linkedModule;
    if (query?.filter?.dueDateFrom) params.dueDateFrom = String(query.filter.dueDateFrom);
    if (query?.filter?.dueDateTo) params.dueDateTo = String(query.filter.dueDateTo);
    const res = await api.get<BackendResponse<PaginatedResponse<Task>>>('/tasks', { params });
    return res.data.rows;
  },

  async getById(id: string): Promise<Task> {
    const res = await api.get<BackendResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const res = await api.post<BackendResponse<Task>>('/tasks', data);
    return res.data;
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const res = await api.patch<BackendResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<BackendResponse<void>>(`/tasks/${id}`);
  },

  // Task Completion with Photo Proof
  async complete(id: string, data: CompleteTaskDto): Promise<Task> {
    const res = await api.post<BackendResponse<Task>>(`/tasks/${id}/complete`, data);
    return res.data;
  },

  // Task Verification
  async verify(id: string, data: VerifyTaskDto, verifiedBy: string, verifiedByName: string): Promise<Task> {
    const res = await api.post<BackendResponse<Task>>(`/tasks/${id}/verify`, { ...data, verifiedBy, verifiedByName });
    return res.data;
  },

  // Stats
  async getStats(): Promise<TaskStats> {
    const res = await api.get<BackendResponse<TaskStats>>('/tasks/stats');
    return res.data;
  },

  async getDashboardKPIs(): Promise<DashboardTaskKPIs> {
    const res = await api.get<BackendResponse<DashboardTaskKPIs>>('/tasks/dashboard-kpis');
    return res.data;
  },

  // Employee Performance
  async getEmployeePerformance(employeeId?: string): Promise<EmployeePerformanceStats[]> {
    const params = employeeId ? { employeeId } : undefined;
    const res = await api.get<BackendResponse<EmployeePerformanceStats[]>>('/tasks/employee-performance', { params });
    return res.data;
  },

  async getEmployeeSalaryLedger(employeeId: string, periodStart: Date, periodEnd: Date): Promise<EmployeeSalaryLedger> {
    const res = await api.get<BackendResponse<EmployeeSalaryLedger>>(`/tasks/employee-salary-ledger/${employeeId}`, {
      params: { periodStart: periodStart.toISOString(), periodEnd: periodEnd.toISOString() }
    });
    return res.data;
  },

  // Salary Adjustments CRUD
  async getSalaryAdjustments(query?: SalaryAdjustmentQuery): Promise<SalaryAdjustment[]> {
    const res = await api.get<BackendResponse<PaginatedResponse<SalaryAdjustment>>>('/tasks/salary-adjustments', { params: query });
    return res.data.rows;
  },

  async getSalaryAdjustmentById(id: string): Promise<SalaryAdjustment> {
    const res = await api.get<BackendResponse<SalaryAdjustment>>(`/tasks/salary-adjustments/${id}`);
    return res.data;
  },

  async createSalaryAdjustment(data: CreateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    const res = await api.post<BackendResponse<SalaryAdjustment>>('/tasks/salary-adjustments', data);
    return res.data;
  },

  async updateSalaryAdjustment(id: string, data: UpdateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    const res = await api.patch<BackendResponse<SalaryAdjustment>>(`/tasks/salary-adjustments/${id}`, data);
    return res.data;
  },

  async deleteSalaryAdjustment(id: string): Promise<void> {
    await api.delete<BackendResponse<void>>(`/tasks/salary-adjustments/${id}`);
  },

  async approveSalaryAdjustment(id: string, approvedBy: string, approvedByName: string): Promise<SalaryAdjustment> {
    const res = await api.post<BackendResponse<SalaryAdjustment>>(`/tasks/salary-adjustments/${id}/approve`, { approvedBy, approvedByName });
    return res.data;
  },

  async processSalaryAdjustment(id: string, processedBy: string): Promise<SalaryAdjustment> {
    const res = await api.post<BackendResponse<SalaryAdjustment>>(`/tasks/salary-adjustments/${id}/process`, { processedBy });
    return res.data;
  },
});
