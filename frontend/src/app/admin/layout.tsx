'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGate } from '@/features/auth/AuthGate';
import { AdminShell } from '@/layouts/AdminShell';
import { MobileAdminShell } from '@/layouts/MobileAdminShell';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      {isDesktop ? (
        <AdminShell>{children}</AdminShell>
      ) : (
        <MobileAdminShell>{children}</MobileAdminShell>
      )}
    </AuthGate>
  );
}
