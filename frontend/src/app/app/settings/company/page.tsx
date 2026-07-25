'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Save,
  Loader2,
  CheckCircle,
  Upload,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/core/api';

export default function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: 'Acme Corp',
    email: 'admin@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'United States',
    website: 'https://acme.com',
    description: 'Leading provider of enterprise solutions.',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch('/company/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Company Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your company profile, branding, and general information.
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
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="!hover:-translate-y-0 !hover:shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Company Information</CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="!hover:-translate-y-0 !hover:shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Address</CardTitle>
              <CardDescription>Company registered address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={form.zip}
                    onChange={(e) => updateField('zip', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="!hover:-translate-y-0 !hover:shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
              <CardDescription>Company logo for branding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 2MB. Recommended: 256x256px
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="!hover:-translate-y-0 !hover:shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium text-foreground">45</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Departments</span>
                <span className="font-medium text-foreground">6</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Tasks</span>
                <span className="font-medium text-foreground">342</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="info">Professional</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
