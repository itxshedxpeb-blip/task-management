'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Bell, Search, Settings, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { componentTextSizes } from '@/lib/design-system';
import { useTheme } from '@/theme/ThemeProvider';
import { Breadcrumbs } from './Breadcrumbs';
import { useAuth } from '@/features/auth/AuthContext';
import { useSidebarStore } from '@/store/useSidebarStore';

interface TopbarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Topbar = memo(function Topbar({ title, subtitle, showBackButton, onBackClick }: TopbarProps) {
  const { logout } = useAuth();
  const { theme, setTheme, isMounted } = useTheme();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <header className="h-[56px] bg-navbar border-b border-border flex items-center justify-between pl-0 pr-4 md:pr-5 lg:pr-6 2xl:pr-8 sticky top-0 z-20 w-full">
      {/* Left side */}
      <div className="flex items-center gap-1 min-w-0 flex-shrink">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-10 w-10 flex-shrink-0 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBackClick} className="h-10 w-10 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Button>
        )}

        <div className="min-w-0">
          {title ? (
            <>
              <h1 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-foreground truncate">{title}</h1>
              {subtitle ? (
                <p className="text-xs text-muted-foreground hidden sm:block truncate">{subtitle}</p>
              ) : (
                <Breadcrumbs className="hidden sm:flex" />
              )}
            </>
          ) : (
            <Breadcrumbs className="hidden sm:flex" />
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Search - compact on tablet, full on desktop */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-44 lg:w-80 xl:w-[360px] pl-10 h-10 text-sm"
          />
        </div>
        <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 flex-shrink-0">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 flex-shrink-0">
          <Bell className="h-5 w-5" />
          <Badge className={cn('absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-[10px] font-medium')}>
            3
          </Badge>
        </Button>

        {/* Theme */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="h-10 w-10 hidden sm:flex flex-shrink-0">
          {isMounted && (theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />)}
        </Button>

        {/* Settings */}
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="h-10 w-10 hidden sm:flex flex-shrink-0">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-border flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-medium">JD</span>
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Owner</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
});
