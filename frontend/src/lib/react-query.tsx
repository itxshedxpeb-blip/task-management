'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { BackendPendingError, isCancelledRequest } from '@/core/api/capabilities';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof BackendPendingError || isCancelledRequest(error)) return false;

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status === 404 || status === 401 || status === 403) return false;
  if (status === undefined || status >= 500) return failureCount < 2;
  return false;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: (query) => {
              // Static data can be cached longer
              if (query.meta?.static) return 10 * 60 * 1000; // 10 minutes
              // User-facing data should be fresher
              return 30 * 1000; // 30 seconds
            },
            gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime in v5)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: shouldRetry,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
