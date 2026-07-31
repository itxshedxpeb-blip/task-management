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
  href: string;
  icon: LucideIcon;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Employees', href: '/admin/employees', icon: Users },
  { title: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { title: 'More', href: '/admin/reports', icon: Menu },
];

const MORE_MENU_ITEMS: NavItem[] = [
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Mobile App', href: '/admin/mobile-app', icon: Smartphone },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
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

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  const isMorePage = pathname === '/admin/reports';

  // Use bottom nav for mobile, regular shell for desktop
  if (isDesktop) {
    const { AdminShell } = require('./AdminShell');
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <main className={cn('flex-1 overflow-y-auto', className)}>
        {children}
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