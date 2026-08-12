/**
 * Task Management Hooks
 * React Query hooks for fetching and managing Task Management data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskManagementApi } from '../services/taskManagementApi';
import { api } from '@/core/api';
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
  TaskNotification,
} from '../types';

// ─── Task Hooks ───────────────────────────────────────────────────────────────

export function useTasks(query?: TaskQuery) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskManagementApi.getAll(query),
    staleTime: 30 * 1000, // 30 seconds for dynamic task data
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskManagementApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['task-stats'],
    queryFn: () => taskManagementApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
}

export function useMyTaskStats() {
  return useQuery({
    queryKey: ['my-task-stats'],
    queryFn: () => taskManagementApi.getMyStats(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useDashboardTaskKPIs() {
  return useQuery({
    queryKey: ['dashboard-task-kpis'],
    queryFn: () => taskManagementApi.getDashboardKPIs(),
    staleTime: 30 * 1000, // 30 seconds for dynamic dashboard data
    refetchOnMount: false,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskManagementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-task-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskManagementApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskManagementApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['my-task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteTaskDto }) =>
      taskManagementApi.complete(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-task-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useVerifyTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data, 
      verifiedBy, 
      verifiedByName 
    }: { 
      id: string; 
      data: VerifyTaskDto; 
      verifiedBy: string; 
      verifiedByName: string; 
    }) => taskManagementApi.verify(id, data, verifiedBy, verifiedByName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-task-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Employee Performance Hooks ─────────────────────────────────────────────────

export function useEmployeePerformance(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-performance', employeeId],
    queryFn: () => taskManagementApi.getEmployeePerformance(employeeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
}

export function useEmployeeSalaryLedger(employeeId: string, periodStart: Date, periodEnd: Date) {
  return useQuery({
    queryKey: ['employee-salary-ledger', employeeId, periodStart, periodEnd],
    queryFn: () => taskManagementApi.getEmployeeSalaryLedger(employeeId, periodStart, periodEnd),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

// ─── Salary Adjustment Hooks ────────────────────────────────────────────────────

export function useSalaryAdjustments(query?: SalaryAdjustmentQuery) {
  return useQuery({
    queryKey: ['salary-adjustments', query],
    queryFn: () => taskManagementApi.getSalaryAdjustments(query),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useSalaryAdjustment(id: string) {
  return useQuery({
    queryKey: ['salary-adjustment', id],
    queryFn: () => taskManagementApi.getSalaryAdjustmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateSalaryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSalaryAdjustmentDto) => taskManagementApi.createSalaryAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateSalaryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryAdjustmentDto }) =>
      taskManagementApi.updateSalaryAdjustment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['salary-adjustment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteSalaryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => taskManagementApi.deleteSalaryAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useApproveSalaryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      approvedBy, 
      approvedByName 
    }: { 
      id: string; 
      approvedBy: string; 
      approvedByName: string; 
    }) => taskManagementApi.approveSalaryAdjustment(id, approvedBy, approvedByName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['salary-adjustment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useProcessSalaryAdjustment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, processedBy }: { id: string; processedBy: string }) =>
      taskManagementApi.processSalaryAdjustment(id, processedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['salary-adjustment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Notification Hooks ───────────────────────────────────────────────────────

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const res = await api.get<any>('/notifications', { params: { pageSize: 50 } });
      return res.data?.rows || [];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const res = await api.get<any>('/notifications/unread-count');
      return res.data?.count || 0;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await api.patch<any>(`/notifications/${notificationId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<any>('/notifications/read-all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}
