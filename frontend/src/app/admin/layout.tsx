'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGate } from '@/features/auth/AuthGate';
import { AdminShell } from '@/layouts/AdminShell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
