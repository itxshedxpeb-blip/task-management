'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Settings,
  Shield,
  Building2,
  Trash2,
  LogIn,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const ACTION_ICONS: Record<string, any> = {
  USER_CREATED: UserPlus,
  USER_DELETED: Trash2,
  LOGIN: LogIn,
  SETTINGS_UPDATED: Settings,
  ROLE_CHANGED: Shield,
  COMPANY_CREATED: Building2,
  COMPANY_SUSPENDED: Shield,
};

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: 'text-emerald-500',
  USER_DELETED: 'text-red-500',
  LOGIN: 'text-blue-500',
  SETTINGS_UPDATED: 'text-amber-500',
  ROLE_CHANGED: 'text-violet-500',
  COMPANY_CREATED: 'text-[#f97316]',
  COMPANY_SUSPENDED: 'text-red-500',
};

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-audit-logs', search, actionFilter],
    queryFn: () => adminApi.getAuditLogs({ search, action: actionFilter === 'all' ? undefined : actionFilter }),
  });

  const logsDataResolved = logsData as any;
  const logsList = Array.isArray(logsDataResolved?.data) ? logsDataResolved.data : Array.isArray(logsDataResolved) ? logsDataResolved : [];

  const filteredLogs = logsList.filter((log: any) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-14 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-4">Failed to load audit logs.</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide audit trail of all administrative actions.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="!hover:-translate-y-0 !hover:shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-input px-3 py-2 text-sm"
            >
              <option value="all">All Actions</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="LOGIN">Login</option>
              <option value="SETTINGS_UPDATED">Settings Updated</option>
              <option value="ROLE_CHANGED">Role Changed</option>
              <option value="COMPANY_CREATED">Company Created</option>
              <option value="COMPANY_SUSPENDED">Company Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {logsList.length === 0 ? (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No audit logs yet</h3>
            <p className="text-sm text-muted-foreground">
              Audit events will appear here as administrative actions are performed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="!hover:-translate-y-0 !hover:shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any) => {
                  const Icon = ACTION_ICONS[log.action] || Settings;
                  const iconColor = ACTION_COLORS[log.action] || 'text-muted-foreground';
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                            {log.userName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'SY'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.userName || 'System'}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                          <Badge variant="outline" className="text-xs">
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {log.details || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {log.ipAddress || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
