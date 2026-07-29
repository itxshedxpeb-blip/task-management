import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api';
import type { Task, TaskQuery, TaskStatus, TaskPriority } from '@/features/task-management/types';
import dayjs from 'dayjs';

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

export function useTasks(params?: {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  /** When true, skips the default 7-day window (shows all tasks). */
  showAll?: boolean;
}) {
  return useQuery({
    queryKey: ['module-tasks', params],
    queryFn: async () => {
      const query: Record<string, any> = {};
      if (params?.page) query.page = params.page;
      if (params?.pageSize) query.pageSize = params.pageSize;
      if (params?.status) query.status = params.status;
      if (params?.priority) query.priority = params.priority;
      if (params?.search) query.search = params.search;
      if (params?.sortBy) query.sortBy = params.sortBy;
      if (params?.sortOrder) query.sortOrder = params.sortOrder;
      if (params?.dateFrom) query.dateFrom = params.dateFrom;
      if (params?.dateTo) query.dateTo = params.dateTo;
      if (!params?.showAll && !params?.dateFrom && !params?.dateTo) {
        query.dateFrom = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
        query.dateTo = dayjs().format('YYYY-MM-DD');
      }
      const res = await api.get<BackendResponse<PaginatedResponse<Task>>>('/tasks', { params: query });
      return res.data;
    },
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: ['module-task', id],
    queryFn: async () => {
      const res = await api.get<BackendResponse<Task>>(`/tasks/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<BackendResponse<Task>>('/tasks', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      qc.invalidateQueries({ queryKey: ['dashboard-today-tasks'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch<BackendResponse<Task>>(`/tasks/${id}`, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['module-tasks'] });
      qc.invalidateQueries({ queryKey: ['module-task', variables.id] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<BackendResponse<void>>(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.patch<BackendResponse<Task>>(`/tasks/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      api.post<BackendResponse<Task>>(`/tasks/${id}/comments`, { text }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['module-task', variables.id] });
    },
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, itemId, completed }: { taskId: string; itemId: string; completed: boolean }) =>
      api.patch<BackendResponse<Task>>(`/tasks/${taskId}/checklist/${itemId}`, { completed }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['module-task', variables.taskId] });
    },
  });
}
