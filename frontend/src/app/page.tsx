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
    if (user?.userType === 'SYSTEM_ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/app');
    }
  }, [user, isLoading, isAuthenticated, router]);

  return null;
}
