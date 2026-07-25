'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Inbox,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/features/task-management/hooks/useTaskManagement';
import { useAuth } from '@/features/auth/AuthContext';
import type { TaskNotification } from '@/features/task-management/types';

const NOTIF_ICON: Record<string, typeof Bell> = {
  'Task Assigned': User,
  'Task Verified': CheckCircle2,
  'Task Rejected': XCircle,
  'Task Completed': CheckCircle2,
  'Task Due Soon': Clock,
  'Task Overdue': AlertTriangle,
};

const NOTIF_COLOR: Record<string, string> = {
  'Task Assigned': 'text-blue-400 bg-blue-500/10',
  'Task Verified': 'text-emerald-400 bg-emerald-500/10',
  'Task Rejected': 'text-red-400 bg-red-500/10',
  'Task Completed': 'text-emerald-400 bg-emerald-500/10',
  'Task Due Soon': 'text-amber-400 bg-amber-500/10',
  'Task Overdue': 'text-red-400 bg-red-500/10',
};

function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationItem({ notification }: { notification: TaskNotification }) {
  const markAsRead = useMarkNotificationAsRead();
  const Icon = NOTIF_ICON[notification.type] || Bell;
  const colorClass = NOTIF_COLOR[notification.type] || 'text-muted-foreground bg-muted';

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border border-border transition-all cursor-pointer hover:bg-card-hover',
        !notification.isRead && 'bg-primary/5 border-primary/20'
      )}
      onClick={handleClick}
    >
      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-foreground">{notification.title}</p>
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Link
            href={`/app/tasks/${notification.taskId}`}
            className="text-[10px] text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.taskTitle}
          </Link>
          <span className="text-[10px] text-muted-foreground">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading, error, refetch } = useNotifications(user?.id);
  const markAllRead = useMarkAllNotificationsAsRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const allNotifications = notifications || [];
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const displayNotifications = filter === 'unread'
    ? allNotifications.filter((n) => !n.isRead)
    : allNotifications;

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">Notifications, messages, and task assignments.</p>
          </div>
        </div>
        <Card className="hover-translate-none">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Failed to load notifications</p>
            <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notifications, messages, and task assignments.
            {unreadCount > 0 && (
              <span className="ml-2 text-primary font-medium">{unreadCount} unread</span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate(user?.id || '')}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({allNotifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Notifications list */}
      <Card className="hover-translate-none">
        <CardContent className="p-0">
          {isLoading ? (
            <NotificationSkeleton />
          ) : displayNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? 'All caught up! Check back later.'
                  : 'You will see notifications here when you have updates.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
