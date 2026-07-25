'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ContentWrapper = function ContentWrapper({ children, className }: ContentWrapperProps) {
  return (
    <div className={cn('pl-4 pr-4 py-5 md:pr-5 md:py-6 lg:pr-6 lg:py-7 2xl:pr-8 w-full max-w-full overflow-x-hidden', className)}>
      {children}
    </div>
  );
};
