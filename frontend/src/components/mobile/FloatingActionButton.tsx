'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FloatingActionButton({
  onClick,
  icon,
  label,
  variant = 'primary',
  size = 'md',
  className,
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl',
    destructive: 'bg-destructive text-destructive-foreground shadow-lg hover:shadow-xl',
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={onClick}
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        size="icon"
      >
        {icon}
      </Button>
      {label && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg shadow-md whitespace-nowrap animate-in slide-in-from-left-2">
          {label}
        </div>
      )}
    </div>
  );
}