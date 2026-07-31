'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Download, Trash2, Smartphone, Calendar, FileText, HardDrive, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { config } from '@/lib/config';
import { getAccessToken } from '@/core/auth/session';

interface AppVersion {
  id: string;
  versionName: string;
  versionCode: number;
  platform: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  releaseNotes?: string;
  minimumSupportedVersion?: string;
  isLatest: boolean;
  isMandatory: boolean;
  isActive: boolean;
  downloadCount: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMobileAppPage() {
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    versionName: '',
    versionCode: '',
    platform: 'ANDROID',
    releaseNotes: '',
    minimumSupportedVersion: '',
    isMandatory: false,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchLatestVersion = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.backendUrl}/app-version/latest/ANDROID`);
      if (response.ok) {
        const data = await response.json();
        setLatestVersion(data.data || null);
      } else {
        setLatestVersion(null);
      }
    } catch (error) {
      console.error('Failed to fetch latest version:', error);
      setLatestVersion(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${config.backendUrl}/app-version/latest/ANDROID`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          if (response.ok) {
            const data = await response.json();
            setLatestVersion(data.data || null);
          } else {
            setLatestVersion(null);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch latest version:', error);
          setLatestVersion(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();
    return () => controller.abort();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/vnd.android.package-archive', 'application/octet-stream', 'application/zip', 'application/x-apk'];
      const allowedExtensions = ['apk', 'aab'];
      const extension = file.name.toLowerCase().split('.').pop();
      
      if (!allowedExtensions.includes(extension || '')) {
        alert('Only APK and AAB files are allowed');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    if (!formData.versionName || !formData.versionCode) {
      alert('Version name and version code are required');
      return;
    }

    try {
      setUploading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('versionName', formData.versionName);
      formDataToSend.append('versionCode', formData.versionCode);
      formDataToSend.append('platform', formData.platform);
      formDataToSend.append('releaseNotes', formData.releaseNotes);
      formDataToSend.append('minimumSupportedVersion', formData.minimumSupportedVersion);
      formDataToSend.append('isMandatory', formData.isMandatory.toString());

      console.log('Uploading to:', `${config.backendUrl}/app-version/upload`);
      const token = getAccessToken();
      console.log('Token exists:', !!token);
      
      const response = await fetch(`${config.backendUrl}/app-version/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { message: errorText || 'Upload failed' };
        }
        throw new Error(error.message || 'Upload failed');
      }

      await fetchLatestVersion();
      setUploadDialogOpen(false);
      resetForm();
      alert('APK uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(`${config.backendUrl}/app-version/ANDROID`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          releaseNotes: formData.releaseNotes,
          isMandatory: formData.isMandatory,
        }),
      });

      if (response.ok) {
        await fetchLatestVersion();
        alert('Metadata updated successfully');
      }
    } catch (error) {
      console.error('Failed to update metadata:', error);
      alert('Failed to update metadata');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this APK?')) {
      return;
    }

    try {
      const token = getAccessToken();
      const response = await fetch(`${config.backendUrl}/app-version/ANDROID`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchLatestVersion();
        alert('APK deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete APK:', error);
      alert('Failed to delete APK');
    }
  };

  const handleDownload = () => {
    const downloadUrl = `${config.backendUrl}/app-version/download/ANDROID`;
    window.open(downloadUrl, '_blank');
  };

  const resetForm = () => {
    setFormData({
      versionName: '',
      versionCode: '',
      platform: 'ANDROID',
      releaseNotes: '',
      minimumSupportedVersion: '',
      isMandatory: false,
    });
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mobile App Distribution</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Android app distribution.</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload APK
        </Button>
      </div>

      {!latestVersion ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg font-medium">No Android App Available</p>
            <p className="text-muted-foreground text-sm mt-2">Upload an APK to make it available for download.</p>
            <Button onClick={() => setUploadDialogOpen(true)} className="mt-6">
              <Upload className="h-4 w-4 mr-2" />
              Upload APK
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Task Management Android App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-foreground">
                Version {latestVersion.versionName}
              </h3>
              <Badge variant={latestVersion.isMandatory ? 'destructive' : 'outline'}>
                {latestVersion.isMandatory ? 'Mandatory Update' : 'Optional'}
              </Badge>
              <Badge variant="default">
                {latestVersion.downloadCount} Downloads
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Version Code: {latestVersion.versionCode}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                <span>{formatFileSize(latestVersion.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(latestVersion.uploadedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span>Android</span>
              </div>
            </div>

            {latestVersion.releaseNotes && (
              <div className="text-sm">
                <p className="font-medium text-foreground mb-2">Release Notes:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{latestVersion.releaseNotes}</p>
              </div>
            )}

            {latestVersion.minimumSupportedVersion && (
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Minimum Supported Version: {latestVersion.minimumSupportedVersion}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button onClick={handleDownload} size="lg" className="flex-1">
                <Download className="h-5 w-5 mr-2" />
                Download Android App
              </Button>
              <Button onClick={() => setUploadDialogOpen(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Replace APK
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Uploaded by {latestVersion.uploadedByName} • Last updated {formatDate(latestVersion.updatedAt)}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Android APK</DialogTitle>
            <DialogDescription>
              Upload a new APK to replace the existing one. This will automatically replace the previous version.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">APK/AAB File</Label>
              <Input
                id="file"
                type="file"
                accept=".apk,.aab"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="versionName">Version Name</Label>
              <Input
                id="versionName"
                placeholder="e.g., 1.0.0"
                value={formData.versionName}
                onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="versionCode">Version Code</Label>
              <Input
                id="versionCode"
                type="number"
                placeholder="e.g., 1"
                value={formData.versionCode}
                onChange={(e) => setFormData({ ...formData, versionCode: e.target.value })}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumSupportedVersion">Minimum Supported Version (Optional)</Label>
              <Input
                id="minimumSupportedVersion"
                placeholder="e.g., 1.0.0"
                value={formData.minimumSupportedVersion}
                onChange={(e) => setFormData({ ...formData, minimumSupportedVersion: e.target.value })}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseNotes">Release Notes (Optional)</Label>
              <Textarea
                id="releaseNotes"
                placeholder="Describe what's new in this version..."
                value={formData.releaseNotes}
                onChange={(e) => setFormData({ ...formData, releaseNotes: e.target.value })}
                disabled={uploading}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isMandatory"
                checked={formData.isMandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, isMandatory: checked })}
                disabled={uploading}
              />
              <Label htmlFor="isMandatory">Mandatory Update</Label>
            </div>

            {uploading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload APK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
