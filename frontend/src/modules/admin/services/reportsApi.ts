import { api } from '@/core/api';

export interface TaskReport {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  avgCompletionHours: number;
  completionRate: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface PerformanceEmployee {
  employeeId: string;
  employeeName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksVerified: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  onTimeRate: number;
}

export interface ReportSummary {
  totalTasks: number;
  openTasks: number;
  completedToday: number;
  overdueTasks: number;
  totalUsers: number;
  totalDepartments: number;
}

interface BackendResponse<T> {
  message?: string;
  data: T;
}

export const reportsApi = {
  getTaskReport: (dateFrom?: string, dateTo?: string) =>
    api.get<BackendResponse<TaskReport>>('/reports/tasks', {
      params: { dateFrom, dateTo },
    }),

  getPerformance: (dateFrom?: string, dateTo?: string, employeeId?: string) =>
    api.get<BackendResponse<PerformanceEmployee[]>>('/reports/performance', {
      params: { dateFrom, dateTo, employeeId },
    }),

  getReportSummary: () =>
    api.get<BackendResponse<ReportSummary>>('/reports/summary'),
};
