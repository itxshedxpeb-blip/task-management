'use client';

import { useState } from 'react';
import { useCompany, useUpdateCompany } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Building2, Mail, Phone, Globe, MapPin, FileText } from 'lucide-react';
import type { Company } from '../types';

export function CompanyManagement() {
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();
  const [formData, setFormData] = useState<Partial<Company>>(company || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany.mutate(formData);
  };

  const handleChange = (field: keyof Company, value: unknown) => {
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
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="text-sm font-medium">Company Name *</label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ''}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label htmlFor="legalCompanyName" className="text-sm font-medium">Legal Company Name *</label>
                  <Input
                    id="legalCompanyName"
                    value={formData.legalCompanyName || ''}
                    onChange={(e) => handleChange('legalCompanyName', e.target.value)}
                    placeholder="Your Company Pvt Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Email *</label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="info@yourcompany.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mobile" className="text-sm font-medium">Mobile *</label>
                  <Input
                    id="mobile"
                    value={formData.mobile || ''}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label htmlFor="supportEmail" className="text-sm font-medium">Support Email</label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail || ''}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    placeholder="support@yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="supportPhone" className="text-sm font-medium">Support Phone</label>
                <Input
                  id="supportPhone"
                  value={formData.supportPhone || ''}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  placeholder="+91 9876543211"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Business Park"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="India"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode || ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="400001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstNumber">GST Number *</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber || ''}
                    onChange={(e) => handleChange('gstNumber', e.target.value)}
                    placeholder="27AAPFU0939J1ZP"
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber">PAN Number *</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber || ''}
                    onChange={(e) => handleChange('panNumber', e.target.value)}
                    placeholder="AAPFU0939J"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cinNumber">CIN Number</Label>
                  <Input
                    id="cinNumber"
                    value={formData.cinNumber || ''}
                    onChange={(e) => handleChange('cinNumber', e.target.value)}
                    placeholder="U72900MH2020PTC123456"
                  />
                </div>
                <div>
                  <Label htmlFor="msmeNumber">MSME Number</Label>
                  <Input
                    id="msmeNumber"
                    value={formData.msmeNumber || ''}
                    onChange={(e) => handleChange('msmeNumber', e.target.value)}
                    placeholder="UDYAM-MH-20-0123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Branding & Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor || '#3b82f6'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.primaryColor || '#3b82f6'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor || '#8b5cf6'}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.secondaryColor || '#8b5cf6'}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor || '#10b981'}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.accentColor || '#10b981'}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="themeMode">Theme Mode</Label>
                <Select
                  value={formData.themeMode || 'light'}
                  onValueChange={(value) => handleChange('themeMode', value)}
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
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={formData.facebook || ''}
                    onChange={(e) => handleChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.instagram || ''}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourcompany"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin || ''}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <Label htmlFor="x">X (Twitter)</Label>
                  <Input
                    id="x"
                    type="url"
                    value={formData.x || ''}
                    onChange={(e) => handleChange('x', e.target.value)}
                    placeholder="https://x.com/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={updateCompany.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateCompany.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
