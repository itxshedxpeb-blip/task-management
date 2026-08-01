'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  ListTodo,
  Columns,
  Calendar,
  Compass,
  StickyNote,
  User,
  Settings,
  Menu,
  Bell,
  LogOut,
  Search,
  X,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { title: 'Tasks', href: '/app/tasks', icon: ListTodo },
  { title: 'Today', href: '/app/today', icon: Calendar },
  { title: 'Calendar', href: '/app/calendar', icon: Calendar },
  { title: 'Reports', href: '/app/reports', icon: BarChart3 },
  { title: 'Menu', href: '/app/priority-matrix', icon: Menu },
];

const MORE_MENU_ITEMS: NavItem[] = [
  { title: 'Board', href: '/app/board', icon: Columns },
  { title: 'Priority Matrix', href: '/app/priority-matrix', icon: Compass },
  { title: 'Notes', href: '/app/notes', icon: StickyNote },
  { title: 'Profile', href: '/app/profile', icon: User },
  { title: 'Settings', href: '/app/settings', icon: Settings },
];

interface MobileAppShellProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  rightAction?: ReactNode;
  className?: string;
}

export function MobileAppShell({
  children,
  title,
  showBackButton = false,
  rightAction,
  className,
}: MobileAppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const isMorePage = pathname === '/app/priority-matrix';

  // Use bottom nav for mobile, regular shell for desktop
  if (isDesktop) {
    // Import and use regular AppShell for desktop
    const { AppShell } = require('./AppShell');
    return <AppShell>{children}</AppShell>;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* App Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => router.back()}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    TF
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">
                  TaskFlow
                </span>
              </div>
            )}
            
            {title && !showBackButton && (
              <h1 className="text-lg font-semibold text-foreground ml-2">
                {title}
              </h1>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {showSearch ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-40 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setShowSearch(true)}
                  className="h-10 w-10"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-10 w-10 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="h-10 w-10"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-semibold">
                          {initials}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/app/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/app/settings')}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {rightAction}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn('flex-1 overflow-y-auto -webkit-overflow-scrolling: touch', className)} style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="pb-20">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!isMorePage && (
        <BottomNavigation items={BOTTOM_NAV_ITEMS} />
      )}

      {/* More Menu for "More" tab */}
      {isMorePage && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom">
          <div className="p-4 grid grid-cols-2 gap-3">
            {MORE_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'default' : 'outline'}
                  className="h-14 justify-start gap-3"
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}