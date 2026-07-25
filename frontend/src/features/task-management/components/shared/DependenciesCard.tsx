'use client';

import { Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import type { TaskDependency, TaskRelationshipType } from '../../types';

const RELATIONSHIP_ORDER: TaskRelationshipType[] = [
  'Depends On',
  'Blocked By',
  'Blocking',
  'Related To',
  'Duplicate Of',
];

interface DependenciesCardProps {
  dependencies?: TaskDependency[];
  loading?: boolean;
  onNavigate?: (dependency: TaskDependency) => void;
  className?: string;
}

/** Read-only display of task relationships, grouped by relationship type. */
export function DependenciesCard({ dependencies = [], loading = false, onNavigate, className }: DependenciesCardProps) {
  return (
    <Card className={cn('hover:translate-y-0 hover:shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Dependencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : dependencies.length === 0 ? (
          <EmptyState
            icon={<Link2 className="h-6 w-6" />}
            title="No dependencies"
            description="This task has no linked or dependent tasks."
          />
        ) : (
          <div className="space-y-4">
            {RELATIONSHIP_ORDER.map((relationship) => {
              const items = dependencies.filter((dep) => dep.relationship === relationship);
              if (items.length === 0) return null;
              return (
                <div key={relationship} className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {relationship}
                  </p>
                  {items.map((dependency) => {
                    const interactive = typeof onNavigate === 'function';
                    return (
                      <div
                        key={dependency.id}
                        className={cn(
                          'flex items-center justify-between gap-2 rounded-md border bg-card p-2',
                          interactive && 'cursor-pointer hover:bg-accent/50',
                        )}
                        onClick={interactive ? () => onNavigate?.(dependency) : undefined}
                        {...(interactive
                          ? {
                              role: 'button',
                              tabIndex: 0,
                              'aria-label': `Open ${dependency.taskRef} ${dependency.title}`,
                              onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  onNavigate?.(dependency);
                                }
                              },
                            }
                          : {})}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{dependency.title}</p>
                          <span className="text-[10px] font-mono text-muted-foreground">{dependency.taskRef}</span>
                        </div>
                        <StatusBadge status={dependency.status} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
