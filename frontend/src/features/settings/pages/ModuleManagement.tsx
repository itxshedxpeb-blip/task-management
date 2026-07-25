'use client';

import { SettingsLayout } from '../components/SettingsLayout';
import { useModules, useUpdateModule } from '../hooks/useSettings';
import { MODULES } from '../constants/settingsConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import {
  type LucideIcon,
  CheckSquare,
  Lock,
  Eye,
  EyeOff,
  Power,
} from 'lucide-react';
import type { Module } from '../types';

const moduleIcons: Record<string, LucideIcon> = {
  'task-management': CheckSquare,
};

export function ModuleManagement() {
  const { data: modules, isLoading } = useModules();
  const updateModule = useUpdateModule();

  const safeModules = (modules as Module[] | undefined) || MODULES;

  const handleToggleEnabled = (moduleId: string, currentValue: boolean) => {
    updateModule.mutate({
      id: moduleId,
      data: { isEnabled: !currentValue },
    });
  };

  const handleToggleVisible = (moduleId: string, currentValue: boolean) => {
    updateModule.mutate({
      id: moduleId,
      data: { isVisible: !currentValue },
    });
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Dynamic Module Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Enable or disable modules from here. Disabled modules will be hidden from the sidebar and navigation.
              Design and Automation modules are hidden by default and can be enabled when needed.
            </p>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <CardSkeleton count={6} />
          ) : safeModules.map((module, index) => {
            const Icon = moduleIcons[module.name] || CheckSquare;
            return (
              <Card key={`${module.id}-${index}`} className={!module.isEnabled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.isEnabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{module.displayName}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={module.isEnabled ? 'success' : 'secondary'}>
                      {module.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant={module.isVisible ? 'default' : 'secondary'}>
                      {module.isVisible ? 'Visible' : 'Hidden'}
                    </Badge>
                    {module.isLocked && (
                      <Badge variant="destructive">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  {/* Toggle Controls */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Power className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Enable Module</span>
                      </div>
                      <Button
                        variant={module.isEnabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleEnabled(module.id, module.isEnabled)}
                        disabled={module.isLocked}
                      >
                        {module.isEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {module.isVisible ? (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">Show in Sidebar</span>
                      </div>
                      <Button
                        variant={module.isVisible ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleVisible(module.id, module.isVisible)}
                        disabled={!module.isEnabled || module.isLocked}
                      >
                        {module.isVisible ? 'Visible' : 'Hidden'}
                      </Button>
                    </div>
                  </div>

                  {/* Required Permissions */}
                  {module.requiredPermissions && module.requiredPermissions.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Required Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.requiredPermissions.map((permission, index) => (
                          <Badge key={`${permission}-${index}`} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Module Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{safeModules.length}</p>
                <p className="text-xs text-muted-foreground">Total Modules</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {safeModules.filter(m => m.isEnabled).length}
                </p>
                <p className="text-xs text-muted-foreground">Enabled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {safeModules.filter(m => !m.isEnabled).length}
                </p>
                <p className="text-xs text-muted-foreground">Disabled</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {safeModules.filter(m => m.isLocked).length}
                </p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
