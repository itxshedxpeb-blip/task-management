'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  CheckCircle,
  FileText,
  Play,
  Pause,
  User,
  Calendar,
  Tag,
  ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/date-utils';
import { TaskActivity, TaskActivityType } from '../types';

interface ActivityTimelineProps {
  activities: TaskActivity[];
  maxHeight?: string;
}

const getActivityIcon = (activityType: TaskActivityType) => {
  switch (activityType) {
    case 'Created':
      return Clock;
    case 'Assigned':
      return User;
    case 'Started':
    case 'In Progress':
      return Play;
    case 'On Hold':
      return Pause;
    case 'Completed':
      return CheckCircle;
    case 'Archived':
    case 'Cancelled':
      return Clock;
    case 'Reassigned':
      return User;
    case 'Priority Changed':
      return Tag;
    case 'Due Date Changed':
      return Calendar;
    case 'Progress Updated':
      return Clock;
    case 'Checklist Updated':
      return ListChecks;
    default:
      return FileText;
  }
};

const getActivityColor = (activityType: TaskActivityType) => {
  switch (activityType) {
    case 'Created':
    case 'Assigned':
    case 'Started':
    case 'In Progress':
      return 'text-sky-400';
    case 'Cancelled':
      return 'text-rose-400';
    case 'Completed':
      return 'text-emerald-400';
    case 'On Hold':
    case 'Due Date Changed':
    case 'Priority Changed':
      return 'text-amber-400';
    case 'Checklist Updated':
    case 'Progress Updated':
      return 'text-orange-400';
    default:
      return 'text-slate-400';
  }
};

const getActivityBgColor = (activityType: TaskActivityType) => {
  switch (activityType) {
    case 'Created':
    case 'Assigned':
    case 'Started':
    case 'In Progress':
      return 'bg-sky-50 border-sky-200';
    case 'Cancelled':
      return 'bg-rose-50 border-rose-200';
    case 'Completed':
      return 'bg-emerald-50 border-emerald-200';
    case 'On Hold':
    case 'Due Date Changed':
    case 'Priority Changed':
      return 'bg-amber-50 border-amber-200';
    case 'Checklist Updated':
    case 'Progress Updated':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

const getActivityBadgeVariant = (activityType: TaskActivityType): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (activityType) {
    case 'Completed':
      return 'default';
    case 'Cancelled':
      return 'destructive';
    case 'On Hold':
    case 'Due Date Changed':
    case 'Priority Changed':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  maxHeight = '400px',
}) => {
  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-sm text-muted-foreground">
          No activity recorded
        </div>
      </Card>
    );
  }

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Activity Timeline</h3>
        <Badge variant="outline" className="text-xs">
          {activities.length}
        </Badge>
      </div>

      <div 
        className="space-y-4 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {sortedActivities.map((activity, index) => {
          const Icon = getActivityIcon(activity.activityType);
          const iconColor = getActivityColor(activity.activityType);
          const bgColor = getActivityBgColor(activity.activityType);
          const badgeVariant = getActivityBadgeVariant(activity.activityType);

          return (
            <div key={activity.id} className="relative">
              {/* Timeline Line */}
              {index < sortedActivities.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-gradient-to-b from-slate-200 to-transparent" />
              )}

              <div className="flex gap-3">
                {/* Icon */}
                <div className={cn(
                  'relative z-10 h-8 w-8 rounded-full bg-white border-2 shadow-sm flex items-center justify-center shrink-0',
                  iconColor
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <Card className={cn('flex-1 p-3 border-2 transition-all duration-200 hover:shadow-md', bgColor)}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={badgeVariant} className="text-[10px]">
                        {activity.activityType}
                      </Badge>
                      <span className="text-sm font-medium text-gray-800">
                        {activity.performedByName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 whitespace-nowrap">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700">
                    {activity.description}
                  </p>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="text-[10px] text-slate-600 space-y-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="font-medium capitalize text-slate-700">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
