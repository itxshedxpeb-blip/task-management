'use client';

import { memo } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { useSettingsStats } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { ROUTES } from '@/core/routes';
import type { SettingsStats } from '../types';
import {
  Users,
  Package,
  CheckCircle,
  UserCog,
  FileText,
} from 'lucide-react';

// Move static quickActions outside component to prevent recreation
const QUICK_ACTIONS = [
  { icon: <UserCog className="h-4 w-4" />, label: 'Manage Users', href: ROUTES.settingsUsers },
  { icon: <Package className="h-4 w-4" />, label: 'Manage Modules', href: ROUTES.settingsModules },
];

export const SettingsDashboard = memo(function SettingsDashboard() {
  const { data: stats, isLoading } = useSettingsStats();
  const typedStats = stats as SettingsStats | undefined;

  const kpiData = typedStats ? [
    {
      title: 'Total Users',
      value: typedStats.totalUsers.toString(),
      change: 5,
      color: 'text-blue-600',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Active Users',
      value: typedStats.activeUsers.toString(),
      change: 8,
      color: 'text-green-600',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: 'Enabled Modules',
      value: typedStats.enabledModules.toString(),
      change: 0,
      color: 'text-purple-600',
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: 'Pending Approvals',
      value: typedStats.pendingApprovals.toString(),
      change: 3,
      color: 'text-yellow-600',
      icon: <FileText className="h-5 w-5" />,
    },
  ] : [];

  return (
    <SettingsLayout>
      <div className="space-y-4 sm:space-y-6 w-full overflow-hidden">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            kpiData.map((kpi, index) => (
              <KPICard
                key={`${kpi.title}-${index}`}
                data={kpi}
                onClick={() => {}}
              />
            ))
          )}
        </div>


        {/* Quick Actions */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {QUICK_ACTIONS.map((action, index) => (
                <Button
                  key={`${action.label}-${index}`}
                  variant="outline"
                  className="justify-start text-xs sm:text-sm"
                  onClick={() => window.location.href = action.href}
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </SettingsLayout>
  );
});
