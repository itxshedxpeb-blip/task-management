'use client';

import { useState, useEffect } from 'react';
import { Settings, RefreshCw, AlertTriangle, Save, Monitor, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res: any = await adminApi.getSystemSettings();
        setSettings(res?.data || res || {});
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    // PWA install prompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await adminApi.updateSystemSettings(settings);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsPWAInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-muted-foreground">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>System Name</Label>
            <Input
              value={settings.systemName || 'TaskFlow'}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input
              type="email"
              value={settings.supportEmail || ''}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enforce Strong Passwords</p>
              <p className="text-xs text-muted-foreground">Require uppercase, lowercase, numbers and symbols</p>
            </div>
            <Switch
              checked={settings.enforceStrongPasswords ?? true}
              onCheckedChange={(v) => setSettings({ ...settings, enforceStrongPasswords: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Enable 2FA for all users</p>
            </div>
            <Switch
              checked={settings.enable2FA ?? false}
              onCheckedChange={(v) => setSettings({ ...settings, enable2FA: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.sessionTimeout || 60}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 60 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Send email notifications for task updates</p>
            </div>
            <Switch
              checked={settings.emailNotifications ?? true}
              onCheckedChange={(v) => setSettings({ ...settings, emailNotifications: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Overdue Task Alerts</p>
              <p className="text-xs text-muted-foreground">Send alerts when tasks become overdue</p>
            </div>
            <Switch
              checked={settings.overdueAlerts ?? true}
              onCheckedChange={(v) => setSettings({ ...settings, overdueAlerts: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Install App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPWAInstallable && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Monitor className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Install as App</div>
                  <div className="text-sm text-muted-foreground">
                    Install this website as a Progressive Web App on your device
                  </div>
                </div>
              </div>
              <Button onClick={handleInstallPWA} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Install
              </Button>
            </div>
          )}
          
          {!isPWAInstallable && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>PWA installation is not available on this device.</p>
              <p className="mt-2">On Chrome/Edge, look for the install icon in the address bar.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
