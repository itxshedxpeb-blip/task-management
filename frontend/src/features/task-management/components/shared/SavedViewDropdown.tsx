'use client';

import { ChevronDown, Star } from 'lucide-react';
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
import { DEFAULT_SAVED_VIEWS } from '../../constants/taskUiDefaults';
import type { SavedView, SavedViewScope } from '../../types';

const SCOPE_LABELS: Record<SavedViewScope, string> = {
  default: 'Default',
  personal: 'Personal Views',
  team: 'Team Views',
  public: 'Public Views',
};

const SCOPE_ORDER: SavedViewScope[] = ['default', 'personal', 'team', 'public'];

interface SavedViewDropdownProps {
  /** Defaults to static UI views when omitted. */
  views?: SavedView[];
  selectedId?: string;
  onSelect: (view: SavedView) => void;
  onTogglePin?: (view: SavedView) => void;
  className?: string;
}

/**
 * Saved views selector (frontend only, no persistence). Groups views by scope
 * and supports pinning a favourite view.
 */
export function SavedViewDropdown({
  views = DEFAULT_SAVED_VIEWS,
  selectedId,
  onSelect,
  onTogglePin,
  className,
}: SavedViewDropdownProps) {
  const selected = views.find((view) => view.id === selectedId) ?? views[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn('justify-between gap-2', className)}>
          <span className="flex items-center gap-1.5 truncate">
            {selected?.isPinned && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
            <span className="truncate">{selected?.name ?? 'Saved Views'}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {SCOPE_ORDER.map((scope) => {
          const scopeViews = views.filter((view) => view.scope === scope);
          if (scopeViews.length === 0) return null;
          return (
            <div key={scope}>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {SCOPE_LABELS[scope]}
              </DropdownMenuLabel>
              {scopeViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onSelect={() => onSelect(view)}
                  className={cn('flex items-center justify-between gap-2', view.id === selected?.id && 'bg-accent')}
                >
                  <span className="truncate">{view.name}</span>
                  {onTogglePin && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={view.isPinned ? `Unpin ${view.name}` : `Pin ${view.name}`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onTogglePin(view);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          onTogglePin(view);
                        }
                      }}
                      className="shrink-0 rounded p-0.5 hover:bg-muted"
                    >
                      <Star
                        className={cn(
                          'h-3.5 w-3.5',
                          view.isPinned ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground',
                        )}
                      />
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="last:hidden" />
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
