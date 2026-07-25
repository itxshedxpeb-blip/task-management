'use client';

import { useState } from 'react';
import {
  Puzzle,
  ArrowLeft,
  CheckSquare,
  Columns,
  Calendar,
  BarChart3,
  Zap,
  FileText,
  Users,
  Settings,
  Bell,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MODULES = [
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Create, assign, and track tasks with status workflows and priorities',
    icon: CheckSquare,
    enabled: true,
    core: true,
  },
  {
    id: 'board',
    name: 'Kanban Board',
    description: 'Visual board view for task management with drag-and-drop',
    icon: Columns,
    enabled: true,
    core: false,
  },
  {
    id: 'calendar',
    name: 'Calendar View',
    description: 'Calendar integration for deadline tracking and scheduling',
    icon: Calendar,
    enabled: true,
    core: false,
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Generate reports and visualize team performance metrics',
    icon: BarChart3,
    enabled: true,
    core: false,
  },
  {
    id: 'automations',
    name: 'Automations',
    description: 'Set up automated workflows and triggers for repetitive tasks',
    icon: Zap,
    enabled: false,
    core: false,
  },
  {
    id: 'templates',
    name: 'Task Templates',
    description: 'Pre-built task templates for common project types',
    icon: FileText,
    enabled: true,
    core: false,
  },
  {
    id: 'people',
    name: 'People Directory',
    description: 'Organization chart and team member directory',
    icon: Users,
    enabled: true,
    core: false,
  },
  {
    id: 'notifications',
    name: 'Smart Notifications',
    description: 'Configurable notification rules and digest emails',
    icon: Bell,
    enabled: true,
    core: false,
  },
  {
    id: 'comments',
    name: 'Comments & Mentions',
    description: 'Task comments with @mention notifications',
    icon: MessageSquare,
    enabled: true,
    core: false,
  },
];

export default function ModuleSettingsPage() {
  const [modules, setModules] = useState(MODULES);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Module Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enable or disable workspace modules and features.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {modules.filter((m) => m.enabled).length} / {modules.length} modules active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.id}
              className={`relative !hover:-translate-y-0 !hover:shadow-sm transition-all ${
                !module.enabled ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {module.core ? (
                    <Badge variant="secondary" className="text-[10px]">Core</Badge>
                  ) : (
                    <button
                      onClick={() => toggleModule(module.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        module.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          module.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
