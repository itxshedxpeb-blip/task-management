'use client';

import { ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CONSTRUCTION_TASK_TEMPLATES } from '../../constants/taskUiDefaults';
import type { TaskTemplate } from '../../types';

interface TemplateSelectorProps {
  /** Defaults to construction task templates when omitted. */
  templates?: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
  triggerLabel?: string;
  className?: string;
}

/**
 * Construction task template picker. Selecting a template hands
 * the chosen template back to the caller for form pre-fill.
 */
export function TemplateSelector({
  templates = CONSTRUCTION_TASK_TEMPLATES,
  onSelect,
  triggerLabel = 'Use Template',
  className,
}: TemplateSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', className)}>
          <FileText className="h-4 w-4" />
          <span>{triggerLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Construction Templates
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onSelect={() => onSelect(template)}
            className="flex flex-col items-start gap-0.5 py-2"
          >
            <span className="text-sm font-medium">{template.name}</span>
            <span className="text-xs text-muted-foreground">{template.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
