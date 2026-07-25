'use client';

import Link from 'next/link';
import {
  Building2,
  MapPin,
  Users,
  Shield,
  Tag,
  Puzzle,
} from 'lucide-react';

const SETTINGS_ITEMS = [
  {
    title: 'Company',
    description: 'Company profile, branding, and general information',
    href: '/app/settings/company',
    icon: Building2,
  },
  {
    title: 'Branches',
    description: 'Manage office locations and branch offices',
    href: '/app/settings/branches',
    icon: MapPin,
  },
  {
    title: 'Users',
    description: 'Invite and manage workspace users',
    href: '/app/settings/users',
    icon: Users,
  },
  {
    title: 'Roles',
    description: 'Define roles and access levels',
    href: '/app/settings/roles',
    icon: Shield,
  },
  {
    title: 'Permissions',
    description: 'Configure granular permission policies',
    href: '/app/settings/permissions',
    icon: Shield,
  },
  {
    title: 'Labels',
    description: 'Create and manage task labels and tags',
    href: '/app/settings/labels',
    icon: Tag,
  },
  {
    title: 'Modules',
    description: 'Enable or disable workspace modules',
    href: '/app/settings/modules',
    icon: Puzzle,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace configuration and preferences.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-card p-5 hover:bg-card-hover transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
