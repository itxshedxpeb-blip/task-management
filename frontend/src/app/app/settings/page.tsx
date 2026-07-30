'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Palette,
  Lock,
  Save,
  RefreshCw,
  Download,
  Smartphone,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/theme/ThemeProvider';
import { config } from '@/lib/config';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    email: true,
    taskAssigned: true,
    taskCompleted: true,
    comments: true,
    dueDateReminder: true,
  });

  const [appVersions, setAppVersions] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    const fetchAppVersions = async () => {
      try {
        setLoadingApps(true);
        const response = await fetch(`${config.backendUrl}/app-version`);
        const data = await response.json();
        setAppVersions(data.data || []);
      } catch (error) {
        console.error('Failed to fetch app versions:', error);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchAppVersions();
  }, []);

  const handleDownloadApp = async (versionId: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/app-version/${versionId}/download`);
      const data = await response.json();
      if (data.data?.downloadUrl) {
        window.open(data.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to download app:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account settings.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" /> Theme
          </TabsTrigger>
          <TabsTrigger value="mobile-app" className="gap-2">
            <Smartphone className="h-4 w-4" /> Mobile App
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Lock className="h-4 w-4" /> Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                      theme === 'light' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                      theme === 'dark' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-600" />
                    Dark
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile-app">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Mobile App Downloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingApps ? (
                <div className="text-center py-8 text-muted-foreground">Loading app versions...</div>
              ) : appVersions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No app versions available</div>
              ) : (
                <div className="space-y-4">
                  {appVersions
                    .filter((v) => v.isActive)
                    .map((version) => (
                    <div
                      key={version.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{version.versionName}</h4>
                            {version.isLatest && (
                              <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">Latest</span>
                            )}
                            {version.isMandatory && (
                              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">Mandatory</span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div>Version Code: {version.versionCode}</div>
                            <div>Platform: {version.platform}</div>
                            <div>Size: {formatFileSize(version.fileSize)}</div>
                            <div>Downloads: {version.downloadCount}</div>
                          </div>

                          {version.releaseNotes && (
                            <div className="text-sm">
                              <p className="font-medium text-foreground mb-1">Release Notes:</p>
                              <p className="text-muted-foreground">{version.releaseNotes}</p>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Uploaded: {new Date(version.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDownloadApp(version.id)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
