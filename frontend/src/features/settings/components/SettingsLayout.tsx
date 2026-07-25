'use client';

import { useState, memo } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Building2,
  GitBranch,
  Users,
  Shield,
  Lock,
  Grid3x3,
  Settings as SettingsIcon,
  LayoutDashboard,
  Menu,
  ArrowLeft,
} from 'lucide-react';
import { ROUTES } from '@/core/routes';
import { componentTextSizes } from '@/lib/design-system';
import { ContentWrapper } from '@/components/layout/ContentWrapper';

interface SettingsNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  section: string;
}

const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    route: ROUTES.settingsDashboard,
    section: 'overview',
  },
  {
    id: 'company',
    label: 'Company',
    icon: <Building2 className="h-4 w-4" />,
    route: ROUTES.settingsCompany,
    section: 'organization',
  },
  {
    id: 'branches',
    label: 'Branches',
    icon: <GitBranch className="h-4 w-4" />,
    route: ROUTES.settingsBranches,
    section: 'organization',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />,
    route: ROUTES.settingsUsers,
    section: 'access',
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: <Shield className="h-4 w-4" />,
    route: ROUTES.settingsRoles,
    section: 'access',
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: <Lock className="h-4 w-4" />,
    route: ROUTES.settingsPermissions,
    section: 'access',
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: <Grid3x3 className="h-4 w-4" />,
    route: ROUTES.settingsModules,
    section: 'system',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: <SettingsIcon className="h-4 w-4" />,
    route: ROUTES.settingsPreferences,
    section: 'system',
  },
];

const SECTIONS = {
  overview: 'Overview',
  organization: 'Organization',
  access: 'Access Control',
  system: 'System',
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export const SettingsLayout = memo(function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeItem = SETTINGS_NAV_ITEMS.find((item) => pathname === item.route);

  const groupedNavItems = SETTINGS_NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, SettingsNavItem[]>);

  return (
    <div className="flex flex-col lg:flex-row min-h-0 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Settings
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card overflow-y-auto transform transition-transform duration-300 lg:relative lg:transform-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4">
          <div className="hidden lg:flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Settings
            </h2>
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/dashboard'}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section}>
                <h3 className={cn(componentTextSizes.kpiCard.label, 'font-semibold text-muted-foreground uppercase tracking-wider mb-2')}>
                  {SECTIONS[section as keyof typeof SECTIONS] || section}
                </h3>
                <nav className="space-y-1">
                  {items.map((item, index) => (
                    <Button
                      key={`${item.id}-${index}`}
                      variant={pathname === item.route ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start text-xs sm:text-sm',
                        pathname === item.route && 'bg-primary text-primary-foreground'
                      )}
                      onClick={() => {
                        window.location.href = item.route;
                        setSidebarOpen(false);
                      }}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <ContentWrapper>
          {activeItem && (
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                {activeItem.icon}
                {activeItem.label}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Configure your {activeItem.label.toLowerCase()} settings
              </p>
            </div>
          )}
          {children}
        </ContentWrapper>
      </div>
    </div>
  );
});
