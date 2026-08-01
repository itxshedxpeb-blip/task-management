'use client';

import { ReactNode, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  onClick?: () => void;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  className?: string;
  activeHref?: string;
}

const isActive = (pathname: string, href?: string) => {
  if (!href) return false;
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(href + '/');
};

const BottomNavItem = memo(function BottomNavItem({
  item,
  isActive,
}: {
  item: BottomNavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  const content = (
    <>
      <div className="relative">
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium leading-tight">
        {item.title}
      </span>
      {isActive && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-primary" />
      )}
    </>
  );

  const className = cn(
    'flex flex-col items-center justify-center gap-1 min-h-[56px] px-3 py-2 rounded-xl transition-all duration-200 relative active:scale-95',
    isActive
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground'
  );

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={className}>
        {content}
      </button>
    );
  }

  if (!item.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
});

export function BottomNavigation({ items, className, activeHref }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom',
        className
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => (
          <BottomNavItem
            key={item.href ?? item.title}
            item={item}
            isActive={isActive(pathname || '', item.href ?? activeHref)}
          />
        ))}
      </div>
    </nav>
  );
}
