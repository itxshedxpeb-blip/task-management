'use client';
import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { AppShell } from '@/layouts/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
