'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { AdminShell } from '@/layouts/AdminShell';
import { MobileAdminShell } from '@/layouts/MobileAdminShell';

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      {isDesktop ? (
        <AdminShell>{children}</AdminShell>
      ) : (
        <MobileAdminShell>{children}</MobileAdminShell>
      )}
    </>
  );
}
