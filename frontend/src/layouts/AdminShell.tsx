'use client';

import { ReactNode, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Shield,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from '@/components/pwa/PWAInstallButton';
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
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useSidebarIsOpen,
  useSidebarIsCollapsed,
  useSidebarStore,
  SIDEBAR_EXPANDED,
  SIDEBAR_COLLAPSED,
} from '@/store/useSidebarStore';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Employees', href: '/admin/employees', icon: Users },
  { title: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { title: 'Mobile App', href: '/admin/mobile-app', icon: Smartphone },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
];

const isActive = (pathname: string, href: string) => {
  if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
};

const AdminSidebarNav = memo(function AdminSidebarNav({
  pathname,
  collapsed,
}: {
  pathname: string;
  collapsed: boolean;
}) {
  if (collapsed) {
    return (
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Admin navigation">
        <ul className="space-y-[2px] px-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.title}
                  className={cn(
                    'flex items-center justify-center w-full h-10 rounded-lg transition-all duration-200',
                    active
                      ? 'bg-[#f97316]/15 text-[#f97316]'
                      : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
                  )}
                >
                  <Icon size={20} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3" aria-label="Admin navigation">
      <div className="mb-1">
        <p className="px-5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          ADMINISTRATION
        </p>
        <ul className="space-y-0.5 px-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 h-10 rounded-lg transition-all duration-200',
                    active
                      ? 'bg-[#f97316]/15 text-[#f97316] font-medium'
                      : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
                  )}
                >
                  <Icon size={18} />
                  <span className="flex-1 text-sm truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
});

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme, isMounted } = useTheme();
  const isOpen = useSidebarIsOpen();
  const isCollapsed = useSidebarIsCollapsed();
  const collapseSidebar = useSidebarStore((s) => s.collapseSidebar);
  const expandSidebar = useSidebarStore((s) => s.expandSidebar);
  const toggleSidebar = useSidebarStore((s) => s.toggleSidebar);
  const setSidebarOpen = useSidebarStore((s) => s.setSidebarOpen);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const sidebarWidth = isDesktop
    ? isCollapsed
      ? SIDEBAR_COLLAPSED
      : SIDEBAR_EXPANDED
    : 0;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  return (
    <div className="min-h-screen bg-background">
      {isOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col overflow-hidden',
          isDesktop
            ? isCollapsed
              ? 'w-[72px]'
              : 'w-[250px]'
            : isOpen
              ? 'w-[250px]'
              : '-translate-x-full'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-border flex-shrink-0 transition-all',
            isCollapsed || (!isDesktop && !isOpen)
              ? 'justify-center h-16 px-0'
              : 'justify-between h-14 px-5'
          )}
        >
          {(!isCollapsed || !isDesktop) && (
            <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight truncate">
                TaskFlow Admin
              </span>
            </Link>
          )}

          {isCollapsed && isDesktop && (
            <Link href="/admin/dashboard" title="TaskFlow Admin" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}

          {isDesktop && (
            <button
              type="button"
              onClick={() => (isCollapsed ? expandSidebar() : collapseSidebar())}
              className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {!isDesktop && (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-card-hover transition-colors text-muted-foreground"
              aria-label="Close sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        <AdminSidebarNav pathname={pathname || '/'} collapsed={isCollapsed && isDesktop} />

        <div className={cn('border-t border-border flex-shrink-0', isCollapsed ? 'p-3' : 'px-4 py-3')}>
          {!isCollapsed || !isDesktop ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#f97316]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[#f97316] text-xs font-semibold">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-[#f97316]/15 flex items-center justify-center" title={user?.name || 'Super Admin'}>
                <span className="text-[#f97316] text-xs font-semibold">{initials}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main
        className="transition-all duration-300 min-h-screen"
        style={{ marginLeft: sidebarWidth }}
      >
        <header className="h-14 bg-navbar border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-9 w-9 lg:hidden"
            >
              <span className="sr-only">Toggle sidebar</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search..."
                className="h-9 w-64 lg:w-80 pl-10 pr-3 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <PWAInstallButton variant="icon" showInHeader />
            
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 flex items-center justify-center p-0 bg-[#f97316] text-white text-[9px] border-0">
                0
              </Badge>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hidden sm:flex"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {isMounted && (theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />)}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2 ml-1">
                  <div className="w-7 h-7 rounded-full bg-[#f97316]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#f97316] text-[10px] font-semibold">{initials}</span>
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user?.name || 'Super Admin'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium text-foreground">{user?.name || 'Super Admin'}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">System Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
