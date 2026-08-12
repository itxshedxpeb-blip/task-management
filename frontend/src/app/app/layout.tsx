import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { AppLayoutClient } from './app-layout-client';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppLayoutClient>{children}</AppLayoutClient>
    </AuthGate>
  );
}
