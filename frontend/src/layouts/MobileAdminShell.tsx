'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  Smartphone,
  Menu,
  Bell,
  LogOut,
  Search,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  href?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Employees', href: '/admin/employees', icon: Users },
  { title: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'More', icon: Menu, onClick: () => undefined },
];

const MORE_MENU_ITEMS: NavItem[] = [
  { title: 'Settings', href: '/admin/settings', icon: Settings },
  { title: 'Mobile App', href: '/admin/mobile-app', icon: Smartphone },
];

interface MobileAdminShellProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  rightAction?: ReactNode;
  className?: string;
}

export function MobileAdminShell({
  children,
  title,
  showBackButton = false,
  rightAction,
  className,
}: MobileAdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  const isMorePage =
    pathname === '/admin/settings' || pathname === '/admin/mobile-app';

  const navItems = BOTTOM_NAV_ITEMS.map((item) =>
    item.title === 'More'
      ? { ...item, onClick: () => setMoreOpen(true) }
      : item
  );

  // Use bottom nav for mobile, regular shell for desktop
  if (isDesktop) {
    const { AdminShell } = require('./AdminShell');
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* App Bar */}
      <header className="flex-shrink-0 bg-background border-b border-border">
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
                <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground tracking-tight">
                  Admin
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
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                        <span className="text-[#f97316] text-xs font-semibold">
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
      <BottomNavigation items={navItems} activeHref={isMorePage ? pathname : undefined} />

      {/* More Menu bottom sheet */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 animate-in fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl border-t border-border animate-in slide-in-from-bottom-4">
            <div className="mx-auto mt-3 mb-2 h-1 w-10 rounded-full bg-muted" />
            <div className="px-4 pb-6 pt-2 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground px-1">
                More Options
              </h2>
              {MORE_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isItemActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setMoreOpen(false);
                      router.push(item.href!);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all active:scale-[0.98]',
                      isItemActive
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-muted/20'
                    )}
                  >
                    <span
                      className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
                        isItemActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}