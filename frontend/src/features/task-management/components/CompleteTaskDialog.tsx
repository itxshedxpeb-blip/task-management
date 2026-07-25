'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from './ImageUpload';
import { TaskChecklist } from './TaskChecklist';
import { CompleteTaskDto, ChecklistItem } from '../types';

interface CompleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompleteTaskDto) => void;
  isLoading?: boolean;
  existingBeforeImages?: File[];
  existingChecklist?: ChecklistItem[];
}

export const CompleteTaskDialog: React.FC<CompleteTaskDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  existingBeforeImages = [],
  existingChecklist = [],
}) => {
  const [afterImages, setAfterImages] = useState<File[]>([]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState<number | undefined>();
  const [completionChecklist, setCompletionChecklist] = useState<ChecklistItem[]>(
    existingChecklist.map(item => ({ ...item, completed: false, completedAt: undefined, completedBy: undefined }))
  );

  const handleSubmit = () => {
    if (!completionNotes.trim() || afterImages.length === 0) {
      return;
    }

    const data: CompleteTaskDto = {
      completionProof: {
        beforeImages: existingBeforeImages,
        afterImages: afterImages,
        notes: completionNotes.trim(),
      },
      completionNotes: completionNotes.trim(),
      completionChecklist,
      timeSpent,
      completedAt: new Date(),
    };

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setAfterImages([]);
    setCompletionNotes('');
    setTimeSpent(undefined);
    setCompletionChecklist(
      existingChecklist.map(item => ({ ...item, completed: false, completedAt: undefined, completedBy: undefined }))
    );
  };

  const isValid = completionNotes.trim() && afterImages.length > 0;

  const checklistProgress = completionChecklist.length > 0
    ? Math.round((completionChecklist.filter(item => item.completed).length / completionChecklist.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning */}
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  Completion Requirements
                </p>
                <p className="text-xs text-amber-700">
                  You must provide after images and completion notes to complete this task.
                  This is mandatory for verification purposes.
                </p>
              </div>
            </div>
          </Card>

          {/* After Images - MANDATORY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                After Work Images
              </Label>
              <Badge variant="destructive" className="text-xs">
                Mandatory
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload images showing the completed work. These are required for task verification.
            </p>
            <ImageUpload
              images={afterImages}
              onImagesChange={setAfterImages}
              label="After Work Images"
              description="Upload images showing the completed work"
              required={true}
              maxImages={10}
            />
          </div>

          {/* Completion Notes - MANDATORY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="completionNotes" className="text-base font-semibold after:content-['*'] after:ml-0.5 after:text-red-500">
                Work Summary
              </Label>
              <Badge variant="destructive" className="text-xs">
                Mandatory
              </Badge>
            </div>
            <Textarea
              id="completionNotes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe the work completed, any challenges faced, and final outcome..."
              rows={4}
              className="text-sm"
            />
          </div>

          {/* Completion Checklist */}
          {existingChecklist.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Completion Checklist
                </Label>
                <Badge variant="outline" className="text-xs">
                  {checklistProgress}% Complete
                </Badge>
              </div>
              <TaskChecklist
                items={completionChecklist}
                onChange={setCompletionChecklist}
                editable={false}
                showProgress={true}
              />
            </div>
          )}

          {/* Time Spent */}
          <div className="space-y-3">
            <Label htmlFor="timeSpent">Time Spent (Hours)</Label>
            <Input
              id="timeSpent"
              type="number"
              step="0.5"
              min="0"
              value={timeSpent || ''}
              onChange={(e) => setTimeSpent(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter actual hours spent"
              className="text-sm"
            />
          </div>

          {/* Before Images Reference */}
          {existingBeforeImages.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Before Images Reference</Label>
              <Card className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {existingBeforeImages.slice(0, 4).map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Before ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {existingBeforeImages.length > 4 && (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{existingBeforeImages.length - 4} more
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className={cn(
              !isValid && 'opacity-50'
            )}
          >
            {isLoading ? 'Completing...' : 'Complete Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
