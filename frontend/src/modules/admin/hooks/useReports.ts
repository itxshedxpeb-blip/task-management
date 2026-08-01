import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/reportsApi';

export function useTaskReport(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['admin-reports-tasks', dateFrom, dateTo],
    queryFn: () => reportsApi.getTaskReport(dateFrom, dateTo),
    staleTime: 60 * 1000,
  });
}

export function usePerformanceReport(dateFrom?: string, dateTo?: string, employeeId?: string) {
  return useQuery({
    queryKey: ['admin-reports-performance', dateFrom, dateTo, employeeId],
    queryFn: () => reportsApi.getPerformance(dateFrom, dateTo, employeeId),
    staleTime: 60 * 1000,
  });
}

export function useReportSummary() {
  return useQuery({
    queryKey: ['admin-reports-summary'],
    queryFn: () => reportsApi.getReportSummary(),
    staleTime: 60 * 1000,
  });
}
