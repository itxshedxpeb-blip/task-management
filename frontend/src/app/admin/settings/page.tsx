'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Mail,
  Shield,
  Bell,
  Database,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/modules/admin/services/adminApi';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    platformName: 'TaskFlow Enterprise',
    supportEmail: 'support@taskflow.io',
    maxCompanies: '100',
    maxUsersPerCompany: '500',
    enableRegistration: true,
    maintenanceMode: false,
    smtpHost: 'smtp.taskflow.io',
    smtpPort: '587',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireTwoFactor: false,
    dataRetentionDays: '365',
    enableAuditLogs: true,
    enableAnalytics: true,
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSystemSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure platform-wide settings and system preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Saved
            </Badge>
          )}
          <Button
            className="bg-[#f97316] hover:bg-[#f97316]/90 text-white"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#f97316]" />
            General
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={settings.platformName}
                onChange={(e) => updateSetting('platformName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCompanies">Max Companies</Label>
              <Input
                id="maxCompanies"
                type="number"
                value={settings.maxCompanies}
                onChange={(e) => updateSetting('maxCompanies', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Users Per Company</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.maxUsersPerCompany}
                onChange={(e) => updateSetting('maxUsersPerCompany', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Open Registration</p>
              <p className="text-xs text-muted-foreground">Allow new companies to self-register</p>
            </div>
            <button
              onClick={() => updateSetting('enableRegistration', !settings.enableRegistration)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableRegistration ? 'bg-[#f97316]' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableRegistration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">Temporarily disable access for non-admin users</p>
            </div>
            <button
              onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#f97316]" />
            Email (SMTP)
          </CardTitle>
          <CardDescription>Configure outgoing email settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => updateSetting('smtpHost', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={settings.smtpPort}
                onChange={(e) => updateSetting('smtpPort', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#f97316]" />
            Security
          </CardTitle>
          <CardDescription>Authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSetting('maxLoginAttempts', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Min Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Require Two-Factor Auth</p>
              <p className="text-xs text-muted-foreground">Enforce 2FA for all admin accounts</p>
            </div>
            <button
              onClick={() => updateSetting('requireTwoFactor', !settings.requireTwoFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireTwoFactor ? 'bg-[#f97316]' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data & Retention */}
      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-[#f97316]" />
            Data & Retention
          </CardTitle>
          <CardDescription>Data management and retention policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataRetention">Data Retention (days)</Label>
              <Input
                id="dataRetention"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => updateSetting('dataRetentionDays', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Audit Logs</p>
              <p className="text-xs text-muted-foreground">Track all administrative actions</p>
            </div>
            <button
              onClick={() => updateSetting('enableAuditLogs', !settings.enableAuditLogs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableAuditLogs ? 'bg-[#f97316]' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableAuditLogs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Analytics</p>
              <p className="text-xs text-muted-foreground">Collect platform usage analytics</p>
            </div>
            <button
              onClick={() => updateSetting('enableAnalytics', !settings.enableAnalytics)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableAnalytics ? 'bg-[#f97316]' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
