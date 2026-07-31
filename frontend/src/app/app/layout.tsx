'use client';
import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { AppShell } from '@/layouts/AppShell';
import { MobileAppShell } from '@/layouts/MobileAppShell';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export default function AppLayout({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <AuthGate>
      {isDesktop ? (
        <AppShell>{children}</AppShell>
      ) : (
        <MobileAppShell>{children}</MobileAppShell>
      )}
    </AuthGate>
  );
}
