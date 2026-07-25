'use client';

import { useState } from 'react';
import {
  Plus,
  FileText,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
  Play,
  Copy,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCreateTask } from '@/modules/tasks/hooks/useTasks';
import type { TaskPriority, TaskCategory } from '@/features/task-management/types';

interface TaskTemplateItem {
  id: string;
  name: string;
  description: string;
  category: TaskCategory;
  defaultPriority: TaskPriority;
  checklist: string[];
  useCount: number;
}

const MOCK_TEMPLATES: TaskTemplateItem[] = [
  {
    id: 'tpl-1',
    name: 'New Employee Onboarding',
    description: 'Standard checklist for onboarding new team members with all necessary steps.',
    category: 'General',
    defaultPriority: 'Medium',
    checklist: ['Setup workstation', 'Assign mentor', 'Schedule orientation', 'Create accounts', 'Review policies'],
    useCount: 24,
  },
  {
    id: 'tpl-2',
    name: 'Site Inspection',
    description: 'Field work inspection template with safety and quality checks.',
    category: 'Inspection',
    defaultPriority: 'High',
    checklist: ['Document site conditions', 'Take photos', 'Complete safety checklist', 'Note any issues', 'Submit report'],
    useCount: 18,
  },
  {
    id: 'tpl-3',
    name: 'Equipment Maintenance',
    description: 'Regular maintenance schedule for office and field equipment.',
    category: 'Maintenance',
    defaultPriority: 'Medium',
    checklist: ['Check equipment status', 'Perform cleaning', 'Replace consumables', 'Test functionality', 'Log maintenance record'],
    useCount: 12,
  },
  {
    id: 'tpl-4',
    name: 'Client Meeting',
    description: 'Template for preparing and following up on client meetings.',
    category: 'Meeting',
    defaultPriority: 'High',
    checklist: ['Prepare agenda', 'Send calendar invite', 'Gather materials', 'Follow up on action items', 'Send meeting notes'],
    useCount: 31,
  },
  {
    id: 'tpl-5',
    name: 'Documentation Review',
    description: 'Review and update project documentation.',
    category: 'Documentation',
    defaultPriority: 'Low',
    checklist: ['Review existing docs', 'Update outdated sections', 'Add new content', 'Proofread', 'Publish changes'],
    useCount: 9,
  },
  {
    id: 'tpl-6',
    name: 'Installation Task',
    description: 'Standard procedure for installing equipment or software.',
    category: 'Installation',
    defaultPriority: 'High',
    checklist: ['Verify requirements', 'Prepare tools/materials', 'Perform installation', 'Test and verify', 'Document completion'],
    useCount: 15,
  },
];

function TemplateSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="hover-translate-none">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-8 rounded mb-3" />
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4 mb-4" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateTemplateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('General');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [checklistText, setChecklistText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the backend
    setName('');
    setDescription('');
    setCategory('General');
    setPriority('Medium');
    setChecklistText('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Create Template</DialogTitle>
        <DialogDescription>Create a reusable task template for your team.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tpl-name">Name *</Label>
          <Input
            id="tpl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-desc">Description</Label>
          <Textarea
            id="tpl-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Template description"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['General', 'Office', 'Field Work', 'Maintenance', 'Installation', 'Inspection', 'Documentation', 'Meeting', 'Training', 'Other'].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tpl-checklist">Checklist Items (one per line)</Label>
          <Textarea
            id="tpl-checklist"
            value={checklistText}
            onChange={(e) => setChecklistText(e.target.value)}
            placeholder={"Step 1\nStep 2\nStep 3"}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>Create Template</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function TemplatesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const createTask = useCreateTask();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleApplyTemplate = async (template: TaskTemplateItem) => {
    setApplyingId(template.id);
    try {
      await createTask.mutateAsync({
        title: template.name,
        description: template.description,
        priority: template.defaultPriority,
        status: 'Pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedUserId: '',
        incentiveValue: 0,
        checklist: template.checklist.map((text, idx) => ({
          text,
          order: idx,
        })),
      });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Reusable task and project templates.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_TEMPLATES.map((template) => (
          <Card key={template.id} className="hover-translate-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {template.category}
                </Badge>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>

              {template.checklist.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {template.checklist.length} steps
                  </p>
                  <div className="space-y-0.5">
                    {template.checklist.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground/70 truncate pl-4">
                        {i + 1}. {item}
                      </p>
                    ))}
                    {template.checklist.length > 3 && (
                      <p className="text-[10px] text-muted-foreground/50 pl-4">
                        +{template.checklist.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Used {template.useCount} times</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => handleApplyTemplate(template)}
                  disabled={applyingId === template.id}
                >
                  <Play className="h-3 w-3 mr-1" />
                  {applyingId === template.id ? 'Creating...' : 'Use Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
