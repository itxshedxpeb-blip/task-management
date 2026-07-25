'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTaskDto, LinkedModule, Task, TaskPriority } from '../types';
import { useUsers } from '@/features/settings/hooks/useSettings';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskDto) => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const { data: users = [] } = useUsers();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedUserId: task?.assignedUserId || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    startDate: task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
    priority: (task?.priority || 'Medium') as TaskPriority,
    linkedModule: (task?.linkedModule || 'General') as LinkedModule,
    linkedRecordId: task?.linkedRecordId || '',
    linkedRecordName: task?.linkedRecordName || '',
    incentiveValue: task?.incentiveValue?.toString() || '',
    notes: task?.notes || '',
  });

  const modules: LinkedModule[] = ['General'];
  const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (start > due) {
        alert('Start date must be before due date');
        return;
      }
    }

    const selectedUser = users.find((u) => u.id === formData.assignedUserId);

    const dto: CreateTaskDto = {
      title: formData.title,
      description: formData.description,
      assignedUserId: formData.assignedUserId,
      dueDate: new Date(formData.dueDate),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      priority: formData.priority,
      linkedModule: formData.linkedModule,
      linkedRecordId: formData.linkedRecordId || undefined,
      linkedRecordName: formData.linkedRecordName || undefined,
      incentiveValue: parseFloat(formData.incentiveValue) || 0,
      notes: formData.notes || undefined,
    };

    onSubmit(dto);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedUserId">Assigned User *</Label>
          <Select value={formData.assignedUserId} onValueChange={(value) => setFormData({ ...formData, assignedUserId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((prio) => (
                <SelectItem key={prio} value={prio}>
                  {prio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="incentiveValue">Incentive Value (₹) *</Label>
          <Input
            id="incentiveValue"
            type="number"
            value={formData.incentiveValue}
            onChange={(e) => setFormData({ ...formData, incentiveValue: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedModule">Linked Module</Label>
          <Select value={formData.linkedModule} onValueChange={(value) => setFormData({ ...formData, linkedModule: value as LinkedModule })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modules.map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="linkedRecordId">Linked Record ID</Label>
          <Input
            id="linkedRecordId"
            value={formData.linkedRecordId}
            onChange={(e) => setFormData({ ...formData, linkedRecordId: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="linkedRecordName">Linked Record Name</Label>
        <Input
          id="linkedRecordName"
          value={formData.linkedRecordName}
          onChange={(e) => setFormData({ ...formData, linkedRecordName: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  );
}
