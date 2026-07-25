'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export type NavigationRole = 'owner' | 'admin' | 'employee';

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: NavigationRole[];
  children?: NavigationItem[];
}

const DASHBOARD_ITEM: NavigationItem = {
  title: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  roles: ['owner', 'admin', 'employee'],
};

const TASK_MANAGEMENT_ITEM: NavigationItem = {
  title: 'Task Management',
  href: '/dashboard/task-management',
  icon: CheckSquare,
  roles: ['owner', 'admin', 'employee'],
};

const SETTINGS_ITEM: NavigationItem = {
  title: 'Settings',
  href: '/settings',
  icon: Settings,
  roles: ['owner', 'admin'],
};

export function useNavigationItems(userRole: NavigationRole = 'owner') {
  return useMemo(() => {
    const tree: NavigationItem[] = [];

    if (DASHBOARD_ITEM.roles.includes(userRole)) tree.push(DASHBOARD_ITEM);
    if (TASK_MANAGEMENT_ITEM.roles.includes(userRole)) tree.push(TASK_MANAGEMENT_ITEM);
    if (SETTINGS_ITEM.roles.includes(userRole)) tree.push(SETTINGS_ITEM);

    return { items: tree, isLoading: false };
  }, [userRole]);
}
