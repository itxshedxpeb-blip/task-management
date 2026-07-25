import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api';
import type { TaskStats, DashboardTaskKPIs, Task } from '@/features/task-management/types';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

interface DashboardStats {
  stats: TaskStats;
  kpis: DashboardTaskKPIs;
  todayTasks: Task[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    performedBy: string;
    performedByName: string;
    timestamp: string;
  }>;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get<BackendResponse<TaskStats>>('/tasks/stats');
      return res.data;
    },
  });
}

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const res = await api.get<BackendResponse<DashboardTaskKPIs>>('/tasks/dashboard-kpis');
      return res.data;
    },
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: ['dashboard-today-tasks'],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      const res = await api.get<BackendResponse<{ rows: Task[]; pagination: any }>>('/tasks', {
        params: { dueDateFrom: startOfDay.toISOString(), dueDateTo: endOfDay.toISOString(), pageSize: 20 },
      });
      return res.data.rows;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard-recent-activity'],
    queryFn: async () => {
      const res = await api.get<BackendResponse<{ rows: Task[]; pagination: any }>>('/tasks', {
        params: { pageSize: 10, sortBy: 'updatedAt', sortOrder: 'desc' },
      });
      return res.data.rows;
    },
  });
}
