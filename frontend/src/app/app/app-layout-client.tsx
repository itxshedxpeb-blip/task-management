'use client';
import { ReactNode } from 'react';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { AppShell } from '@/layouts/AppShell';
import { MobileAppShell } from '@/layouts/MobileAppShell';

export function AppLayoutClient({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <>
      {isDesktop ? (
        <AppShell>{children}</AppShell>
      ) : (
        <MobileAppShell>{children}</MobileAppShell>
      )}
    </>
  );
}
