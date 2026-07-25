'use client';

import { useState } from 'react';
import { useSystemPreferences } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Globe, Clock, Palette, FileText } from 'lucide-react';
import type { SystemPreferences } from '../types';

export function SystemPreferences() {
  const { data: systemPrefs, isLoading } = useSystemPreferences();
  const [formData, setFormData] = useState<Partial<SystemPreferences>>(systemPrefs || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (field: keyof SystemPreferences, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="text-center py-8">Loading...</div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">System Preferences</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">
                <Globe className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="display">
                <Palette className="h-4 w-4 mr-2" />
                Display
              </TabsTrigger>
              <TabsTrigger value="files">
                <FileText className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone || 'Asia/Kolkata'}
                      onValueChange={(value) => handleChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={formData.dateFormat || 'DD/MM/YYYY'}
                      onValueChange={(value) => handleChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select
                      value={formData.timeFormat || '24h'}
                      onValueChange={(value) => handleChange('timeFormat', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24-hour</SelectItem>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language || 'en'}
                      onValueChange={(value) => handleChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="display" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defaultTheme">Default Theme</Label>
                    <Select
                      value={formData.defaultTheme || 'light'}
                      onValueChange={(value) => handleChange('defaultTheme', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency || 'INR'}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fileUploadLimit">File Upload Limit (MB)</Label>
                    <Input
                      id="fileUploadLimit"
                      type="number"
                      value={formData.fileUploadLimit || 10}
                      onChange={(e) => handleChange('fileUploadLimit', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Allowed File Types (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[80px] p-3 border rounded-md"
                      value={formData.allowedFileTypes?.join(', ') || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png'}
                      onChange={(e) => handleChange('allowedFileTypes', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
