'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/date-utils';
import { Task } from '../types';
import { ActivityTimeline } from './ActivityTimeline';
import { TaskChecklist } from './TaskChecklist';
import { BeforeAfterGallery } from './BeforeAfterGallery';
import { Play, Pause, RotateCcw, Bell, History, MoreVertical } from 'lucide-react';

interface TaskDetailPageProps {
  task: Task;
  onBack: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  isAdmin?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

export const TaskDetailPage: React.FC<TaskDetailPageProps> = ({
  task,
  onBack,
  onEdit,
  onComplete,
  onDelete,
  isAdmin = false,
  currentUserId = 'current-user',
  currentUserName = 'Current User',
}) => {
  const canEdit = isAdmin || task.assignedUserId === currentUserId;
  const canComplete = task.assignedUserId === currentUserId && task.status !== 'Completed';
  const canDelete = isAdmin;

  // Time tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(task.timeSpent || 0);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  const toggleTracking = () => {
    if (isTracking) {
      // Stop tracking
      if (trackingInterval) {
        clearInterval(trackingInterval);
        setTrackingInterval(null);
      }
      setIsTracking(false);
    } else {
      // Start tracking
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      setTrackingInterval(interval);
      setIsTracking(true);
    }
  };

  const resetTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setIsTracking(false);
    setTimeElapsed(0);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  const beforeUrls = useMemo(
    () => task.completionProof?.beforeImages?.map(file => URL.createObjectURL(file)) || [],
    [task.completionProof?.beforeImages]
  );
  const afterUrls = useMemo(
    () => task.completionProof?.afterImages?.map(file => URL.createObjectURL(file)) || [],
    [task.completionProof?.afterImages]
  );

  useEffect(() => {
    return () => {
      beforeUrls.forEach(url => URL.revokeObjectURL(url));
      afterUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [beforeUrls, afterUrls]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'InProgress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'OnHold':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Archived':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'High':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{task.title}</h1>
            <p className="text-sm text-muted-foreground">{task.taskId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Tracking */}
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleTracking}
            >
              {isTracking ? (
                <Pause className="h-4 w-4 text-red-600" />
              ) : (
                <Play className="h-4 w-4 text-green-600" />
              )}
            </Button>
            <span className="text-sm font-mono font-medium">
              {Math.floor(timeElapsed / 3600)}:{Math.floor((timeElapsed % 3600) / 60).toString().padStart(2, '0')}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={resetTracking}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <History className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {canComplete && (
            <Button size="sm" onClick={onComplete}>
              Complete
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className={cn('border', getStatusColor(task.status))}>
          {task.status}
        </Badge>
        <Badge className={cn('border', getPriorityColor(task.priority))}>
          {task.priority}
        </Badge>
        {task.category && (
          <Badge variant="outline">{task.category}</Badge>
        )}
        {task.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assigned To */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>Assigned To</span>
              </div>
              <p className="text-sm font-medium">{task.assignedUserName}</p>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due Date</span>
              </div>
              <p className="text-sm font-medium">
                {formatDate(task.dueDate)}
              </p>
            </div>

            {/* Start Date */}
            {task.startDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Start Date</span>
                </div>
                <p className="text-sm font-medium">
                  {formatDate(task.startDate)}
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      task.progress === 100 ? 'bg-green-500' : 'bg-primary'
                    )}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{task.progress}%</span>
              </div>
            </div>

            {/* Estimated Hours */}
            {task.estimatedHours && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Estimated Hours</span>
                </div>
                <p className="text-sm font-medium">{task.estimatedHours}h</p>
              </div>
            )}

            {/* Time Spent */}
            {task.timeSpent && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Time Spent</span>
                </div>
                <p className="text-sm font-medium">{task.timeSpent}h</p>
              </div>
            )}

            {/* Incentive */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Incentive</span>
              </div>
              <p className="text-sm font-medium">₹{task.incentiveValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Description</span>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Notes</span>
              </div>
              <p className="text-sm text-muted-foreground">{task.notes}</p>
            </div>
          )}

          {/* Linked Module */}
          {task.linkedModule && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Linked To</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{task.linkedModule}</Badge>
                {task.linkedRecordName && (
                  <span className="text-sm font-medium">{task.linkedRecordName}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="linked">Linked</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <ActivityTimeline activities={task.activityHistory || []} />
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="mt-4">
          <TaskChecklist
            items={task.checklist || []}
            onChange={() => {}}
            editable={canEdit}
            showProgress={true}
            disabled={!canEdit}
          />
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-4">
          <BeforeAfterGallery
            beforeImages={task.completionProof?.beforeImages || []}
            afterImages={task.completionProof?.afterImages || []}
          />
          {task.completionProof?.notes && (
            <Card className="mt-4 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Completion Notes</span>
              </div>
              <p className="text-sm">{task.completionProof.notes}</p>
            </Card>
          )}
        </TabsContent>

        {/* Linked Modules Tab */}
        <TabsContent value="linked" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Modules</CardTitle>
            </CardHeader>
            <CardContent>
              {task.linkedModule ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.linkedModule}</p>
                      {task.linkedRecordName && (
                        <p className="text-sm text-muted-foreground">{task.linkedRecordName}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No modules linked to this task
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Task Assigned</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(task.createdAt)}
                    </p>
                  </div>
                </div>
                
                {task.status === 'Completed' && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Task Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(task.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-4">
          {/* Completion Details */}
          {task.completionProof && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completion Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed At</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(task.completedAt) || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded At</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(task.completionProof.uploadedAt) || '-'}
                    </p>
                  </div>
                </div>
                {task.completionProof.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{task.completionProof.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          {task.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{task.internalNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="font-medium">{task.createdByName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {formatDateTime(task.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Updated At</p>
                  <p className="font-medium">
                    {formatDateTime(task.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Task ID</p>
                  <p className="font-medium">{task.taskId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
