'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime, dayjs } from '@/lib/date-utils';
import {
  getActivityConfig,
} from '../constants/activityConfig';
import {
  Plus,
  MessageSquare,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Calendar,
  Tag,
  FileText,
  Info,
  Play,
  Pause,
  XCircle,
  Archive,
  Pencil,
  ListChecks,
  AlertCircle,
} from 'lucide-react';

// Icon lookup map — avoids dynamic imports
const ICON_MAP: Record<string, React.ElementType> = {
  Plus,
  MessageSquare,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Calendar,
  Tag,
  FileText,
  Info,
  Play,
  Pause,
  XCircle,
  Archive,
  Pencil,
  ListChecks,
  AlertCircle,
};

export interface TimelineActivity {
  id: string;
  taskId: string;
  activityType: string;
  description: string;
  performedBy: string;
  performedByName: string;
  metadata?: Record<string, unknown>;
  nextFollowUpDate?: string | null;
  nextFollowUpTime?: string | null;
  nextFollowUpAction?: string | null;
  taskStatus?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface ActivityFollowUpTimelineProps {
  activities: TimelineActivity[];
  maxHeight?: string;
}

function getActivityIcon(type: string): React.ElementType {
  const config = getActivityConfig(type);
  return ICON_MAP[config.icon] || Info;
}

function isOverdue(followUpDate: string | null | undefined): boolean {
  if (!followUpDate) return false;
  const today = dayjs().startOf('day');
  const due = dayjs(followUpDate);
  return due.isBefore(today);
}

function formatFollowUpDate(date: string | null | undefined): string {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format('DD MMM YYYY') : '';
}

function formatFollowUpTime(time: string | null | undefined): string {
  if (!time) return '';
  // time is HH:mm format
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export const ActivityFollowUpTimeline: React.FC<ActivityFollowUpTimelineProps> = ({
  activities,
  maxHeight,
}) => {
  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Activity & Follow-up
          </h3>
          <Badge variant="outline" className="text-xs">
            0
          </Badge>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No activity recorded yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add a follow-up to start tracking progress
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort chronologically (oldest first for timeline display)
  const sorted = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Activity &amp; Follow-up
        </h3>
        <Badge variant="outline" className="text-xs">
          {activities.length}
        </Badge>
      </div>

      <div
        className="space-y-4"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {sorted.map((activity, index) => {
          const config = getActivityConfig(activity.activityType);
          const Icon = getActivityIcon(activity.activityType);
          const hasFollowUp = !!(activity.nextFollowUpDate);
          const overdue = hasFollowUp && isOverdue(activity.nextFollowUpDate!);

          return (
            <div key={activity.id} className="relative">
              {/* Timeline vertical line */}
              {index < sorted.length - 1 && (
                <div className="absolute left-[17px] top-[34px] bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
              )}

              <div className="flex gap-3">
                {/* Timeline dot/icon */}
                <div
                  className={cn(
                    'relative z-10 h-[34px] w-[34px] rounded-full border-2 shadow-sm flex items-center justify-center shrink-0',
                    config.bgColor,
                    config.borderColor,
                  )}
                >
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>

                {/* Activity card */}
                <div className="flex-1 min-w-0">
                  <Card className={cn('border', config.borderColor, config.bgColor)}>
                    <CardContent className="p-3 sm:p-4">
                      {/* Header: type badge + timestamp */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-medium shrink-0',
                            config.color,
                            config.bgColor,
                          )}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">
                          {formatDateTime(activity.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {activity.description}
                      </p>

                      {/* Next Follow-up section */}
                      {hasFollowUp && (
                        <div className={cn(
                          'mt-3 p-2.5 rounded-lg border',
                          overdue
                            ? 'bg-red-50 border-red-200'
                            : 'bg-violet-50 border-violet-200',
                        )}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {overdue ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-violet-500" />
                            )}
                            <span className={cn(
                              'text-xs font-semibold',
                              overdue ? 'text-red-600' : 'text-violet-700',
                            )}>
                              {overdue ? '⚠ Follow-up Overdue' : 'Next Follow-up'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p className="font-medium text-foreground">
                              {formatFollowUpDate(activity.nextFollowUpDate)}
                              {activity.nextFollowUpTime && (
                                <> • {formatFollowUpTime(activity.nextFollowUpTime)}</>
                              )}
                            </p>
                            {activity.nextFollowUpAction && (
                              <p className="mt-1">
                                <span className="font-medium text-foreground">Next Action:</span>{' '}
                                {activity.nextFollowUpAction}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Progress indicator */}
                      {activity.metadata && typeof activity.metadata === 'object' && (() => {
                        const meta = activity.metadata as Record<string, unknown>;
                        const hasProgress = 'progress' in meta && meta.progress !== undefined;
                        const progressChange = meta.progressChange as Record<string, unknown> | undefined;
                        const statusChange = meta.statusChange as Record<string, string> | undefined;
                        return (
                          <>
                            {hasProgress && (
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                                  Progress: {String(meta.progress)}%
                                </Badge>
                                {progressChange &&
                                  'from' in progressChange &&
                                  'to' in progressChange && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {String(progressChange.from)}% → {String(progressChange.to)}%
                                  </span>
                                )}
                              </div>
                            )}
                            {statusChange && 'to' in statusChange && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-[10px]">
                                  Status: {statusChange.to}
                                </Badge>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {/* Fallback: task status from field */}
                      {!activity.metadata && activity.taskStatus && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-[10px]">
                            Status: {activity.taskStatus}
                          </Badge>
                        </div>
                      )}

                      {/* Footer: performed by */}
                      <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5">
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[8px] font-semibold text-primary">
                            {activity.performedByName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Added by <span className="font-medium text-foreground">{activity.performedByName}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
