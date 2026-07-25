'use client';

import { useState } from 'react';
import {
  Plus,
  Zap,
  Play,
  Pause,
  Clock,
  Bell,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
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

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  actionType: string;
  isActive: boolean;
  lastRun?: string;
  runCount: number;
}

const MOCK_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'auto-1',
    name: 'Auto-assign overdue tasks',
    description: 'Automatically notify managers when a task becomes overdue.',
    triggerType: 'Task Overdue',
    actionType: 'Send Notification',
    isActive: true,
    lastRun: '2026-07-25T10:30:00Z',
    runCount: 45,
  },
  {
    id: 'auto-2',
    name: 'Status change notification',
    description: 'Notify the team when a task status changes to Review.',
    triggerType: 'Status Changed',
    actionType: 'Send Notification',
    isActive: true,
    lastRun: '2026-07-25T09:15:00Z',
    runCount: 128,
  },
  {
    id: 'auto-3',
    name: 'Weekly digest',
    description: 'Send a weekly summary of completed tasks to team leads.',
    triggerType: 'Schedule',
    actionType: 'Send Email',
    isActive: false,
    lastRun: '2026-07-21T08:00:00Z',
    runCount: 12,
  },
  {
    id: 'auto-4',
    name: 'New task welcome',
    description: 'Send a welcome message to assignees when a new task is created.',
    triggerType: 'Task Created',
    actionType: 'Send Notification',
    isActive: true,
    lastRun: '2026-07-25T11:00:00Z',
    runCount: 256,
  },
  {
    id: 'auto-5',
    name: 'Auto-close completed tasks',
    description: 'Automatically close tasks that have been in Completed status for 7 days.',
    triggerType: 'Schedule',
    actionType: 'Update Task Status',
    isActive: false,
    lastRun: '2026-07-20T00:00:00Z',
    runCount: 8,
  },
];

const TRIGGER_ICONS: Record<string, typeof Clock> = {
  'Task Overdue': AlertTriangle,
  'Status Changed': ArrowRight,
  'Schedule': Clock,
  'Task Created': Plus,
};

const ACTION_ICONS: Record<string, typeof Bell> = {
  'Send Notification': Bell,
  'Send Email': Bell,
  'Update Task Status': ArrowRight,
};

function AutomationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="hover-translate-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateRuleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setName('');
    setDescription('');
    setTrigger('');
    setAction('');
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Create Automation Rule</DialogTitle>
        <DialogDescription>Set up an automated workflow rule.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auto-name">Name *</Label>
          <Input
            id="auto-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auto-desc">Description</Label>
          <Textarea
            id="auto-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this rule do?"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trigger</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Task Created">Task Created</SelectItem>
                <SelectItem value="Status Changed">Status Changed</SelectItem>
                <SelectItem value="Task Overdue">Task Overdue</SelectItem>
                <SelectItem value="Task Completed">Task Completed</SelectItem>
                <SelectItem value="Schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Send Notification">Send Notification</SelectItem>
                <SelectItem value="Send Email">Send Email</SelectItem>
                <SelectItem value="Update Task Status">Update Task Status</SelectItem>
                <SelectItem value="Assign Task">Assign Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || !trigger || !action}>Create Rule</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default function AutomationsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  const toggleRule = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up automated workflows and rules.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <CreateRuleDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Dialog>
      </div>

      <div className="space-y-3">
        {automations.map((rule) => {
          const TriggerIcon = TRIGGER_ICONS[rule.triggerType] || Zap;
          const ActionIcon = ACTION_ICONS[rule.actionType] || Zap;

          return (
            <Card key={rule.id} className="hover-translate-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                    rule.isActive ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Zap className={cn('h-5 w-5', rule.isActive ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                      <Badge variant={rule.isActive ? 'success' : 'secondary'} className="text-[9px]">
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{rule.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <TriggerIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{rule.triggerType}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <ActionIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{rule.actionType}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        · {rule.runCount} runs
                      </span>
                      {rule.lastRun && (
                        <span className="text-[10px] text-muted-foreground">
                          · Last: {new Date(rule.lastRun).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
                    title={rule.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="h-7 w-7 text-primary" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
