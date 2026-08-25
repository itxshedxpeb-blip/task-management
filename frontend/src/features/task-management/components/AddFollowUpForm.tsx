'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { USER_ACTIVITY_TYPES } from '../constants/activityConfig';
import {
  CalendarClock,
  ArrowRight,
  Sparkles,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '../types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'Todo', label: 'Pending' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'OnHold', label: 'On Hold' },
  { value: 'Cancelled', label: 'Cancelled' },
];

interface AddFollowUpFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    activityType: string;
    description: string;
    nextFollowUpDate?: string;
    nextFollowUpTime?: string;
    nextFollowUpAction?: string;
    status?: TaskStatus;
    progress?: number;
  }) => Promise<void>;
  currentStatus?: TaskStatus;
  currentProgress?: number;
}

export function AddFollowUpForm({
  open,
  onOpenChange,
  onSubmit,
  currentStatus,
  currentProgress = 0,
}: AddFollowUpFormProps) {
  const [activityType, setActivityType] = useState('ProgressUpdate');
  const [description, setDescription] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [progressValue, setProgressValue] = useState<number>(currentProgress);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!activityType) {
      newErrors.activityType = 'Activity type is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 1) {
      newErrors.description = 'Description cannot be empty';
    }

    if (scheduleFollowUp) {
      if (!followUpDate) {
        newErrors.followUpDate = 'Follow-up date is required';
      }
      if (!followUpTime) {
        newErrors.followUpTime = 'Follow-up time is required';
      }
      if (!nextAction.trim()) {
        newErrors.nextAction = 'Next action is required when scheduling a follow-up';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        activityType,
        description: description.trim(),
        ...(scheduleFollowUp && {
          nextFollowUpDate: followUpDate,
          nextFollowUpTime: followUpTime,
          nextFollowUpAction: nextAction.trim(),
        }),
        ...(statusUpdate && { status: statusUpdate as TaskStatus }),
        ...(progressValue !== currentProgress && { progress: progressValue }),
      });

      // Reset form
      setActivityType('ProgressUpdate');
      setDescription('');
      setScheduleFollowUp(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setNextAction('');
      setStatusUpdate('');
      setProgressValue(currentProgress);
      setErrors({});

      toast.success('Activity added successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to add activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset on close
      setActivityType('ProgressUpdate');
      setDescription('');
      setScheduleFollowUp(false);
      setFollowUpDate('');
      setFollowUpTime('');
      setNextAction('');
      setStatusUpdate('');
      setProgressValue(currentProgress);
      setErrors({});
    }
    onOpenChange(newOpen);
  };

  const selectedStatusLabel = STATUS_OPTIONS.find(s => s.value === statusUpdate)?.label || statusUpdate;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            Add Follow-up
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record what happened, what was discussed, or schedule a follow-up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activity-type" className="text-sm font-medium">
              Update Type
            </Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activity-type" className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p className="text-xs text-destructive mt-1">{errors.activityType}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Activity / Update
            </Label>
            <Textarea
              id="description"
              placeholder="What happened? Describe what was done, discussed, found, or completed..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              rows={4}
              className={cn(
                'rounded-xl resize-none transition-all duration-200',
                errors.description ? 'border-destructive focus-visible:ring-destructive/30' : 'focus-visible:ring-primary/30'
              )}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Progress Update */}
          <div className="space-y-2">
            <Label htmlFor="progress-update" className="text-sm font-medium">
              Progress
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  id="progress-update"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value, 10))}
                  className="h-2 rounded-full cursor-pointer accent-primary"
                />
              </div>
              <div className="w-16 text-center">
                <span className="text-lg font-bold text-foreground tabular-nums">
                  {progressValue}%
                </span>
              </div>
            </div>
            {progressValue !== currentProgress && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-xs text-muted-foreground">Progress will change:</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border text-foreground">
                  {currentProgress}%
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {progressValue}%
                </span>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="space-y-2">
            <Label htmlFor="status-update" className="text-sm font-medium">
              Status Update
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <Select
              value={statusUpdate || '__none__'}
              onValueChange={(v) => setStatusUpdate(v === '__none__' ? '' : v)}
            >
              <SelectTrigger id="status-update" className="h-11 rounded-xl">
                <SelectValue placeholder="No status change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No status change</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Change Preview */}
            {statusUpdate && currentStatus && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                <span className="text-xs text-muted-foreground">Status will change:</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border text-foreground">
                  {currentStatus}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {selectedStatusLabel}
                </span>
              </div>
            )}
          </div>

          {/* Schedule Follow-up Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] transition-colors hover:border-primary/30">
            <Checkbox
              id="schedule-followup"
              checked={scheduleFollowUp}
              onCheckedChange={(checked) => setScheduleFollowUp(checked === true)}
              className="h-5 w-5"
            />
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <Label htmlFor="schedule-followup" className="cursor-pointer text-sm font-medium text-foreground">
                Schedule next follow-up
              </Label>
            </div>
          </div>

          {/* Follow-up fields (conditional) with smooth transition */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              scheduleFollowUp ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="space-y-3 p-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-purple-50/50">
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">Schedule Details</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="followup-date" className="text-xs font-medium text-muted-foreground">
                    Follow-up Date *
                  </Label>
                  <Input
                    id="followup-date"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => {
                      setFollowUpDate(e.target.value);
                      if (errors.followUpDate) setErrors((prev) => ({ ...prev, followUpDate: '' }));
                    }}
                    className={cn(
                      'h-10 rounded-lg transition-colors',
                      errors.followUpDate
                        ? 'border-destructive focus-visible:ring-destructive/30'
                        : 'border-violet-200 focus-visible:ring-violet-500/30 focus-visible:border-violet-400'
                    )}
                  />
                  {errors.followUpDate && (
                    <p className="text-[11px] text-destructive">{errors.followUpDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="followup-time" className="text-xs font-medium text-muted-foreground">
                    Follow-up Time *
                  </Label>
                  <Input
                    id="followup-time"
                    type="time"
                    value={followUpTime}
                    onChange={(e) => {
                      setFollowUpTime(e.target.value);
                      if (errors.followUpTime) setErrors((prev) => ({ ...prev, followUpTime: '' }));
                    }}
                    className={cn(
                      'h-10 rounded-lg transition-colors',
                      errors.followUpTime
                        ? 'border-destructive focus-visible:ring-destructive/30'
                        : 'border-violet-200 focus-visible:ring-violet-500/30 focus-visible:border-violet-400'
                    )}
                  />
                  {errors.followUpTime && (
                    <p className="text-[11px] text-destructive">{errors.followUpTime}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="next-action" className="text-xs font-medium text-muted-foreground">
                  Next Action *
                </Label>
                <Input
                  id="next-action"
                  placeholder="e.g. Test super-admin login and verify permissions"
                  value={nextAction}
                  onChange={(e) => {
                    setNextAction(e.target.value);
                    if (errors.nextAction) setErrors((prev) => ({ ...prev, nextAction: '' }));
                  }}
                  className={cn(
                    'h-10 rounded-lg transition-colors',
                    errors.nextAction
                      ? 'border-destructive focus-visible:ring-destructive/30'
                      : 'border-violet-200 focus-visible:ring-violet-500/30 focus-visible:border-violet-400'
                  )}
                />
                {errors.nextAction && (
                  <p className="text-[11px] text-destructive">{errors.nextAction}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Add Update
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
