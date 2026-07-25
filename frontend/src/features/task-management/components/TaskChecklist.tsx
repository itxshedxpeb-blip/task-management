'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChecklistItem } from '../types';

interface TaskChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  disabled?: boolean;
  showProgress?: boolean;
  editable?: boolean;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  items,
  onChange,
  disabled = false,
  showProgress = true,
  editable = true,
}) => {
  const [newItemText, setNewItemText] = useState('');

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemText.trim() || disabled) return;

    const newItem: ChecklistItem = {
      id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newItemText.trim(),
      completed: false,
      order: items.length,
    };

    onChange([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    if (disabled) return;

    const updatedItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          completed: !item.completed,
          completedAt: !item.completed ? new Date() : undefined,
          completedBy: !item.completed ? 'current-user' : undefined,
        };
      }
      return item;
    });

    onChange(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    if (disabled || !editable) return;

    const updatedItems = items.filter(item => item.id !== id);
    onChange(updatedItems);
  };

  const handleUpdateItemText = (id: string, text: string) => {
    if (disabled || !editable) return;

    const updatedItems = items.map(item => {
      if (item.id === id) {
        return { ...item, text };
      }
      return item;
    });

    onChange(updatedItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      {showProgress && items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-xs">
              {progress}%
            </Badge>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                progress === 100 ? 'bg-green-500' : 'bg-primary'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">
            {completedCount} of {items.length} items completed
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              {editable && !disabled && (
                <div className="cursor-grab mt-0.5">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Checkbox */}
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggleItem(item.id)}
                disabled={disabled}
                className="mt-0.5"
              />

              {/* Text */}
              <div className="flex-1 min-w-0">
                {editable && !disabled ? (
                  <Input
                    value={item.text}
                    onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                    disabled={disabled}
                    className={cn(
                      'text-sm h-8',
                      item.completed && 'line-through text-muted-foreground'
                    )}
                    placeholder="Checklist item"
                  />
                ) : (
                  <p
                    className={cn(
                      'text-sm',
                      item.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.text}
                  </p>
                )}
              </div>

              {/* Delete Button */}
              {editable && !disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Completion Info */}
            {item.completed && item.completedAt && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                Completed {item.completedAt.toLocaleDateString()}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add New Item */}
      {editable && !disabled && (
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add checklist item..."
            disabled={disabled}
            className="flex-1 text-sm"
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItemText.trim() || disabled}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && !editable && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No checklist items
        </div>
      )}
    </div>
  );
};
