import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { AdminLayoutClient } from './admin-layout-client';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthGate>
  );
}
