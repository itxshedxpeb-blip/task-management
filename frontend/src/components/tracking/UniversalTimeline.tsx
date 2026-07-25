'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useTimeline } from '@/features/tracking/hooks/useTracking';
import { ActivityAuditLog } from './ActivityAuditLog';
import { Loader2 } from 'lucide-react';

interface UniversalTimelineProps {
  entityType: string;
  entityId: string;
  className?: string;
}

/**
 * @deprecated Prefer ActivityAuditLog directly.
 * Kept as a thin wrapper so existing imports stay enterprise-safe.
 */
function UniversalTimelineComponent({ entityType, entityId, className }: UniversalTimelineProps) {
  const { isLoading } = useTimeline(entityType, entityId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <ActivityAuditLog entityType={entityType} entityId={entityId} />
    </div>
  );
}

export const UniversalTimeline = memo(UniversalTimelineComponent);
