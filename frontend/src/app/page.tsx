'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.userType === 'SUPER_ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/app');
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  return null;
}
