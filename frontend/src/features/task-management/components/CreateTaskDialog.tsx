'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toInputDate } from '@/lib/date-utils';
import { ImageUpload } from './ImageUpload';
import { TaskChecklist } from './TaskChecklist';
import { CreateTaskDto, TaskPriority, TaskCategory, LinkedModule, ChecklistItem } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskDto) => void;
  isLoading?: boolean;
  employees?: Array<{ id: string; name: string }>;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  employees = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [category, setCategory] = useState<TaskCategory>('General');
  const [linkedModule, setLinkedModule] = useState<LinkedModule | undefined>();
  const [linkedRecordId, setLinkedRecordId] = useState('');
  const [incentiveValue, setIncentiveValue] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [beforeImages, setBeforeImages] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleSubmit = () => {
    if (!title.trim() || !assignedUserId) {
      return;
    }

    const data: CreateTaskDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      assignedUserId,
      startDate,
      reminderDate,
      priority,
      category,
      linkedModule,
      linkedRecordId: linkedRecordId || undefined,
      incentiveValue,
      estimatedHours,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
      beforeImages: beforeImages.length > 0 ? beforeImages : undefined,
      checklist: checklist.length > 0 ? checklist.map(item => ({
        text: item.text,
        order: item.order,
      })) : undefined,
    };

    onSubmit(data);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedUserId('');
    setStartDate(undefined);
    setReminderDate(undefined);
    setPriority('Medium');
    setCategory('General');
    setLinkedModule(undefined);
    setLinkedRecordId('');
    setIncentiveValue(0);
    setEstimatedHours(undefined);
    setTags([]);
    setTagInput('');
    setNotes('');
    setBeforeImages([]);
    setChecklist([]);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const getLinkedRecords = (): Array<{ id: string; name: string }> => {
    return [];
  };

  const isValid = title.trim() && assignedUserId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Task Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Assignment & Dates */}
            <Card className="p-4 space-y-3">
              <div>
                <Label htmlFor="assignedUser" className="after:content-['*'] after:ml-0.5 after:text-red-500">
                  Assigned To
                </Label>
                <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={toInputDate(startDate)}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="reminderDate">Reminder Date</Label>
                  <Input
                    id="reminderDate"
                    type="date"
                    value={toInputDate(reminderDate)}
                    onChange={(e) => setReminderDate(e.target.value ? new Date(e.target.value) : undefined)}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Priority & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Field Work">Field Work</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Module Connection */}
            <Card className="p-4 space-y-3">
              <div>
                <Label htmlFor="linkedModule">Connect to Module (Optional)</Label>
                <Select value={linkedModule} onValueChange={(v) => setLinkedModule(v as LinkedModule)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {linkedModule && (
                <div>
                  <Label htmlFor="linkedRecord">Select Record</Label>
                  <Select value={linkedRecordId} onValueChange={setLinkedRecordId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select record" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLinkedRecords().length > 0 ? getLinkedRecords().map((record) => (
                        <SelectItem key={record.id} value={record.id}>
                          {record.name}
                        </SelectItem>
                      )) : (
                        <SelectItem value="none" disabled>No records available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>

            {/* Time & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={estimatedHours || ''}
                  onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="incentiveValue">Incentive Value</Label>
                <Input
                  id="incentiveValue"
                  type="number"
                  value={incentiveValue}
                  onChange={(e) => setIncentiveValue(Number(e.target.value))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="mt-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag and press Enter"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={2}
                className="mt-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4 mt-4">
            <ImageUpload
              images={beforeImages}
              onImagesChange={setBeforeImages}
              label="Before Work Images"
              description="Upload images showing the current situation, problem evidence, or existing damage"
              required={false}
              maxImages={10}
            />
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4 mt-4">
            <TaskChecklist
              items={checklist}
              onChange={setChecklist}
              editable={true}
              showProgress={true}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
