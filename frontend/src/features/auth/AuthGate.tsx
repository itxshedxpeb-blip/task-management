'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { ROUTES } from '@/core/routes';

/** Shared client auth gate for dashboard + settings (and any protected shell). */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
