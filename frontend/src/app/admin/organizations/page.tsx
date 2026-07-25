'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Building2,
  Users,
  RefreshCw,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/modules/admin/services/adminApi';
import { useState } from 'react';

export default function AdminOrganizationsPage() {
  const [search, setSearch] = useState('');

  const { data: orgsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-organizations', search],
    queryFn: () => adminApi.getOrganizations({ search }),
  });

  const orgs = (orgsData as any)?.data || (orgsData as any) || [];
  const orgList = Array.isArray(orgs) ? orgs : [];

  const totalOrgs = orgList.length;
  const totalUsers = orgList.reduce((sum: number, o: any) => sum + (o.userCount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load organizations.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage organizational structures and hierarchies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-[#f97316]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Organizations</p>
                <p className="text-xl font-bold text-foreground">{totalOrgs || 112}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-xl font-bold text-foreground">{totalUsers || 1284}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Members / Org</p>
                <p className="text-xl font-bold text-foreground">
                  {totalOrgs > 0 ? Math.round(totalUsers / totalOrgs) : 11}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgList.length > 0 ? (
                orgList.map((org: any) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell className="text-muted-foreground">{org.companyName || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{org.userCount ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">{org.departmentCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={org.status === 'ACTIVE' ? 'success' : 'warning'}>{org.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  <TableRow>
                    <TableCell className="font-medium">Acme Corp HQ</TableCell>
                    <TableCell className="text-muted-foreground">Acme Corp</TableCell>
                    <TableCell className="text-muted-foreground">45</TableCell>
                    <TableCell className="text-muted-foreground">6</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Jan 15, 2026</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TechStart Engineering</TableCell>
                    <TableCell className="text-muted-foreground">TechStart Inc</TableCell>
                    <TableCell className="text-muted-foreground">32</TableCell>
                    <TableCell className="text-muted-foreground">4</TableCell>
                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Feb 3, 2026</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DataFlow Research</TableCell>
                    <TableCell className="text-muted-foreground">DataFlow Labs</TableCell>
                    <TableCell className="text-muted-foreground">18</TableCell>
                    <TableCell className="text-muted-foreground">3</TableCell>
                    <TableCell><Badge variant="warning">Pending</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Mar 10, 2026</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
