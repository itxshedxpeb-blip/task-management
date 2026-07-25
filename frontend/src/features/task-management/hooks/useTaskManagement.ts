/**
 * Task Management Hooks
 * React Query hooks for fetching and managing Task Management data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskManagementApi } from '../services/taskManagementApi';
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

export function useDashboardTaskKPIs() {
  return useQuery({
    queryKey: ['dashboard-task-kpis'],
    queryFn: () => taskManagementApi.getDashboardKPIs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Mock notification storage (in production, this would be a real notification service)
const mockNotifications: TaskNotification[] = [];

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      // In production, this would fetch from a real notification API
      await new Promise(resolve => setTimeout(resolve, 200));
      return userId 
        ? mockNotifications.filter(n => n.userId === userId)
        : mockNotifications;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      // In production, this would call a real API
      await new Promise(resolve => setTimeout(resolve, 100));
      const notification = mockNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
      return notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // In production, this would call a real API
      await new Promise(resolve => setTimeout(resolve, 100));
      mockNotifications.forEach(n => {
        if (n.userId === userId) {
          n.isRead = true;
        }
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Helper function to create notifications (called by task mutations)
export function createTaskNotification(
  userId: string,
  type: 'Task Assigned' | 'Task Verified' | 'Task Rejected' | 'Task Completed',
  taskId: string,
  taskTitle: string,
  message: string
): TaskNotification {
  const notification: TaskNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title: type,
    message,
    taskId,
    taskTitle,
    isRead: false,
    createdAt: new Date(),
  };
  
  mockNotifications.push(notification);
  return notification;
}
