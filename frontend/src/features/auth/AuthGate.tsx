'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { ROUTES } from '@/core/routes';

/**
 * Auth gate for protected routes.
 *
 * Instead of blocking the entire UI while auth initializes, we render the
 * children immediately (so the page shell / layout paints) and overlay a
 * lightweight loading indicator only when auth is actively checking.
 * Once auth resolves, the indicator vanishes and children get full access.
 *
 * If the user is not authenticated after the check, they are redirected.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated, isLoading, router]);

  // Render children immediately – no blocking skeleton.
  // While auth is still loading, overlay a subtle top-bar spinner.
  return (
    <>
      {children}
      {isLoading && (
        <div
          className="fixed inset-x-0 top-0 z-[9999] h-0.5 animate-pulse bg-primary/60"
          role="status"
          aria-live="polite"
          aria-label="Checking session"
        />
      )}
    </>
  );
}
