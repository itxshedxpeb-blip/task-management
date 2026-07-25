'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useStatus, useChangeStatus, usePipeline } from '@/features/tracking/hooks/useTracking';
import type { StatusPipeline } from '@/features/tracking/types';

interface UniversalStatusPipelineProps {
  entityType: string;
  entityId: string;
  allowStatusChange?: boolean;
}

const statusIcon = (color?: string) => {
  const cls = color ? '' : 'text-muted-foreground';
  return { cls };
};

function UniversalStatusPipelineComponent({ entityType, entityId, allowStatusChange = true }: UniversalStatusPipelineProps) {
  const { data: statusData } = useStatus(entityType, entityId);
  const { data: pipelineData } = usePipeline(entityType);
  const changeStatus = useChangeStatus(entityType, entityId);

  const statusInfo = statusData?.data;
  const pipeline = pipelineData?.data ?? [];
  const currentStatus = statusInfo?.currentStatus;
  const allowedTransitions = statusInfo?.allowedTransitions ?? [];
  const history = statusInfo?.history ?? [];

  if (!pipeline.length && !currentStatus) {
    return null;
  }

  const currentStep = pipeline.find(s => s.status === currentStatus);

  const handleStatusChange = (newStatus: string) => {
    changeStatus.mutate({ status: newStatus });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {pipeline.map((step, idx) => {
          const isActive = step.status === currentStatus;
          const isPast = history.some(h => h.toStatus === step.status);
          const isPending = !isActive && !isPast;

          return (
            <div key={step.id} className="flex items-center gap-1">
              {idx > 0 && (
                <div className={cn(
                  'w-6 h-px',
                  isPast ? 'bg-primary' : 'bg-muted-foreground/30'
                )} />
              )}
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                isActive && 'bg-primary/10 text-primary ring-1 ring-primary',
                isPast && !isActive && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                isPending && 'bg-muted text-muted-foreground'
              )}>
                {isPast && !isActive && <CheckCircle2 className="w-3 h-3" />}
                {isActive && <Clock className="w-3 h-3" />}
                {isPending && <AlertCircle className="w-3 h-3" />}
                <span>{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {allowStatusChange && allowedTransitions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              Change Status <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {pipeline
              .filter(s => allowedTransitions.includes(s.status))
              .map(step => (
                <DropdownMenuItem
                  key={step.id}
                  onClick={() => handleStatusChange(step.status)}
                  disabled={changeStatus.isPending}
                >
                  {step.label}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export const UniversalStatusPipeline = memo(UniversalStatusPipelineComponent);
