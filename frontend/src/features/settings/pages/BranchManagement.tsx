'use client';

import { useState } from 'react';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import type { Branch } from '../types';
import { Column } from '@/components/data-table/DataTable';

export function BranchManagement() {
  const { data: branches, isLoading } = useBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const branchesList = (branches as Branch[]) || [];
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});

  const columns: Column<Branch>[] = [
    { key: 'branchCode', label: 'Branch Code', sortable: true },
    { key: 'branchName', label: 'Branch Name', sortable: true },
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'contactPerson', label: 'Contact Person', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile', label: 'Mobile', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (value: boolean) => (
        value ? <span className="text-blue-600">✓</span> : '-'
      ),
    },
  ];

  const handleCreate = () => {
    setEditingBranch(null);
    setFormData({
      isActive: true,
      isDefault: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData(branch);
    setIsDialogOpen(true);
  };

  const handleDelete = (branch: Branch) => {
    if (confirm(`Are you sure you want to delete ${branch.branchName}?`)) {
      deleteBranch.mutate(branch.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch.mutate({ id: editingBranch.id, data: formData });
    } else {
      createBranch.mutate(formData as Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsDialogOpen(false);
  };

  const handleChange = (field: keyof Branch, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const rowActions = (branch: Branch) => (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => handleEdit(branch)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(branch)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Branch Management</h2>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>

        <DataTable
          data={branchesList}
          columns={columns}
          loading={isLoading}
          rowActions={rowActions}
          emptyMessage="No branches found"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branchCode">Branch Code *</Label>
                    <Input
                      id="branchCode"
                      value={formData.branchCode || ''}
                      onChange={(e) => handleChange('branchCode', e.target.value)}
                      placeholder="HQ"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name *</Label>
                    <Input
                      id="branchName"
                      value={formData.branchName || ''}
                      onChange={(e) => handleChange('branchName', e.target.value)}
                      placeholder="Headquarters"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Business Park"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Maharashtra"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="India"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode || ''}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      placeholder="400001"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gstNumber">GST Number *</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber || ''}
                      onChange={(e) => handleChange('gstNumber', e.target.value)}
                      placeholder="27AAPFU0939J1ZP"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson || ''}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="mumbai@yourcompany.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile || ''}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault || false}
                      onChange={(e) => handleChange('isDefault', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isDefault">Set as Default Branch</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive !== false}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBranch.isPending || updateBranch.isPending}>
                  {editingBranch ? 'Update' : 'Create'} Branch
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
}
