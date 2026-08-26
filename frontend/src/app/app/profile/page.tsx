'use client';

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useMyTaskStats } from '@/features/task-management/hooks/useTaskManagement';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, error: statsError } = useMyTaskStats();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const s = stats as any;

  // Handle API error gracefully - show default values if stats fail
  if (statsError) {
    console.error('Failed to load task stats:', statsError);
  }

  const statCards = [
    { label: 'Total Tasks', value: s?.totalTasks ?? 0, icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: s?.completedTasks ?? 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'In Progress', value: s?.inProgressTasks ?? 0, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Overdue', value: s?.overdueTasks ?? 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  // If stats error, show error message but still render the page
  if (statsError && !statsLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your profile.</p>
          </div>
          <Button variant="outline" onClick={() => setEditOpen(true)} className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>

        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load task statistics</p>
                <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-6 gap-4">
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-2xl sm:text-xl font-bold">{initials}</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-bold text-foreground">{user?.name || 'Employee'}</h2>
                <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{user?.role}</Badge>
                  {user?.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm text-foreground truncate">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">User Type</p>
                  <p className="text-sm text-foreground truncate">{user?.userType?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md w-[95%] mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={() => setEditOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your profile.</p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)} className="w-full sm:w-auto">
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-6 gap-4">
            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-500 text-2xl sm:text-xl font-bold">{initials}</span>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold text-foreground">{user?.name || 'Employee'}</h2>
              <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{user?.role}</Badge>
                {user?.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm text-foreground truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">User Type</p>
                <p className="text-sm text-foreground truncate">{user?.userType?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 sm:h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                    <div className={cn('h-8 w-8 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center', stat.bg)}>
                      <Icon className={cn('h-4 w-4', stat.color)} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md w-[95%] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={() => setEditOpen(false)}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
