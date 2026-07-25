import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api';
import type { EmployeePerformanceStats } from '@/features/task-management/types';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await api.get<BackendResponse<EmployeePerformanceStats[]>>('/tasks/employee-performance');
      return res.data;
    },
  });
}

export function usePersonDetail(employeeId: string) {
  return useQuery({
    queryKey: ['person', employeeId],
    queryFn: async () => {
      const res = await api.get<BackendResponse<EmployeePerformanceStats[]>>('/tasks/employee-performance', {
        params: { employeeId },
      });
      return res.data;
    },
    enabled: !!employeeId,
  });
}
