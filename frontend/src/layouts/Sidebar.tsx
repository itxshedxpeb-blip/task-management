'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, X, LayoutDashboard, CheckSquare, Users, Calendar, Columns, Grid3X3, BarChart3, Wallet, FileText, Settings } from 'lucide-react';
import {
  useSidebarIsOpen,
  useSidebarIsCollapsed,
  useSidebarStore,
} from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  currentPath?: string;
  userRole?: 'owner' | 'admin' | 'employee';
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'My Tasks', href: '/dashboard/task-management', icon: CheckSquare },
  { title: 'Team', href: '/dashboard/task-management', icon: Users },
  { title: 'Calendar', href: '/dashboard/task-management', icon: Calendar },
  { title: 'Kanban Board', href: '/dashboard/task-management', icon: Columns },
  { title: 'Priority Matrix', href: '/dashboard/task-management', icon: Grid3X3 },
  { title: 'Performance', href: '/dashboard/task-management', icon: BarChart3 },
  { title: 'Salary', href: '/dashboard/task-management', icon: Wallet },
  { title: 'Reports', href: '/dashboard/task-management', icon: FileText },
  { title: 'Settings', href: '/settings', icon: Settings },
];

const ACTIVE_STYLE: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(58,190,255,0.18), rgba(58,190,255,0.10))',
  borderColor: 'rgba(58,190,255,0.25)',
};

const isLeafActive = (pathname: string, href?: string) => !!href && pathname === href;

const flattenForRail = (items: NavItem[]): NavItem[] => items;

export const Sidebar = memo(function Sidebar({ currentPath, userRole = 'owner' }: SidebarProps) {
  const nextPathname = usePathname();
  const pathname = currentPath || nextPathname;
  const isOpen = useSidebarIsOpen();
  const isCollapsed = useSidebarIsCollapsed();
  const collapseSidebar = useSidebarStore((state) => state.collapseSidebar);
  const expandSidebar = useSidebarStore((state) => state.expandSidebar);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const setSidebarOpen = useSidebarStore((state) => state.setSidebarOpen);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    if (isDesktop && !isOpen) {
      setSidebarOpen(true);
    }
  }, [isDesktop, isOpen, setSidebarOpen]);

  const railItems = useMemo(() => flattenForRail(NAV_ITEMS), []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col overflow-hidden',
          'w-[250px]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isCollapsed && 'lg:w-[72px]'
        )}
      >
        <div className={cn(
          'flex items-center justify-between border-b border-border flex-shrink-0',
          isCollapsed ? 'justify-center h-[64px] px-0' : 'h-[56px] px-5'
        )}>
          {!isCollapsed && <h1 className="text-2xl font-bold text-foreground truncate tracking-tight">Task Management System</h1>}
          <div className={cn(isCollapsed ? 'hidden lg:block' : '')}>
            <button
              type="button"
              onClick={() => (isCollapsed ? expandSidebar() : collapseSidebar())}
              className="p-3 rounded-lg hover:bg-card-hover transition-colors text-foreground hidden lg:flex items-center justify-center"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-3 rounded-lg hover:bg-card-hover transition-colors text-foreground lg:hidden flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3" aria-label="Primary">
          {isCollapsed ? (
            <ul className="space-y-[2px] px-1">
              {railItems.map((item, index) => {
                const Icon = item.icon;
                const active = isLeafActive(pathname, item.href);
                return (
                  <li key={`${item.href}-${index}`}>
                    <Link
                      href={item.href}
                      title={item.title}
                      aria-label={item.title}
                      className={cn(
                        'flex items-center justify-center w-full h-10 rounded-lg transition-all duration-220 glass-sidebar-hover',
                        active ? 'text-primary' : 'text-foreground'
                      )}
                      style={active ? ACTIVE_STYLE : undefined}
                    >
                      <Icon size={20} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="space-y-0.5 px-2">
              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const active = isLeafActive(pathname, item.href);
                return (
                  <li key={`${item.href}-${index}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 pl-4 pr-3 h-12 rounded-xl transition-all duration-220 glass-sidebar-hover',
                        active ? 'text-primary' : 'text-foreground'
                      )}
                      style={active ? ACTIVE_STYLE : undefined}
                    >
                      <Icon size={20} />
                      <span className="flex-1 font-medium text-sm truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <div className={cn('border-t border-border flex-shrink-0', isCollapsed ? 'p-4' : 'px-4 py-3')}>
        </div>
      </aside>
    </>
  );
});
