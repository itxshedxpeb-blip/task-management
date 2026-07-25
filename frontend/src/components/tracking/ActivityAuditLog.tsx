'use client';

import { memo, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTimeline } from '@/features/tracking/hooks/useTracking';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Filter,
  Loader2,
  MessageSquare,
  Paperclip,
  Pencil,
  PlusCircle,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { TimelineEntry } from '@/features/tracking/types';

interface ActivityAuditLogProps {
  entityType: string;
  entityId: string;
  className?: string;
}

type FilterType = 'all' | 'status_change' | 'created' | 'updated' | 'activity';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'status_change', label: 'Status' },
  { id: 'created', label: 'Created' },
  { id: 'updated', label: 'Updates' },
  { id: 'activity', label: 'Other' },
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isTechnicalValue(value?: string | null): boolean {
  if (!value) return true;
  if (UUID_RE.test(value)) return true;
  if (/^[0-9a-f]{24}$/i.test(value)) return true;
  if (/\.(manual|status-change|created|updated|deleted)/i.test(value)) return true;
  if (value.trim().startsWith('{') || value.trim().startsWith('[')) return true;
  return false;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function CardIcon({ type }: { type: TimelineEntry['type'] }) {
  if (type === 'status_change') return <ArrowRight className="w-4 h-4" />;
  if (type === 'created') return <PlusCircle className="w-4 h-4" />;
  if (type === 'updated') return <Pencil className="w-4 h-4" />;
  if (type === 'comment') return <MessageSquare className="w-4 h-4" />;
  if (type === 'attachment') return <Paperclip className="w-4 h-4" />;
  if (type === 'approval') return <ShieldCheck className="w-4 h-4" />;
  return <CheckCircle2 className="w-4 h-4" />;
}

function iconWrap(type: TimelineEntry['type']) {
  if (type === 'status_change') return 'bg-amber-100 text-amber-700 border-amber-200';
  if (type === 'created') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (type === 'updated') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (type === 'approval') return 'bg-violet-100 text-violet-700 border-violet-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function normalizeEntry(entry: TimelineEntry): TimelineEntry {
  // Back-compat if an older API payload slips through
  const title = entry.title && !isTechnicalValue(entry.title)
    ? entry.title
    : entry.action && !isTechnicalValue(entry.action)
      ? entry.action
      : 'Activity';

  const description =
    entry.description && !isTechnicalValue(entry.description)
      ? entry.description
      : entry.fromStatus && entry.toStatus
        ? `${entry.fromStatus} → ${entry.toStatus}`
        : '';

  return {
    ...entry,
    title,
    description,
    performedBy: entry.performedBy && !isTechnicalValue(entry.performedBy) ? entry.performedBy : 'System',
  };
}

function ActivityCard({ entry }: { entry: TimelineEntry }) {
  const [open, setOpen] = useState(false);
  const details = (entry.details || []).filter((d) => d.value && !isTechnicalValue(d.value));
  const related = (entry.relatedRecords || []).filter((r) => r.value && !isTechnicalValue(r.value));
  const hasExpandable =
    details.length > 0 ||
    !!entry.reason ||
    !!(entry.fromStatus && entry.toStatus) ||
    related.length > 0;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => hasExpandable && setOpen(!open)}
        className={cn(
          'w-full text-left px-4 py-3 flex gap-3 transition-colors',
          hasExpandable && 'hover:bg-muted/30 cursor-pointer',
          !hasExpandable && 'cursor-default'
        )}
      >
        <div className={cn('w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0', iconWrap(entry.type))}>
          <CardIcon type={entry.type} />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{entry.title}</p>
              {entry.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{entry.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(entry.timestamp)}</span>
              {hasExpandable && (
                open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" />
              {entry.performedBy || 'System'}
            </span>
            {entry.performedByRole && <span>{entry.performedByRole}</span>}
            {entry.department && <span>{entry.department}</span>}
            {entry.displayCode && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                <Building2 className="w-3 h-3" />
                {entry.displayCode}
              </span>
            )}
          </div>

          {entry.type === 'status_change' && entry.fromStatus && entry.toStatus && (
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="px-2 py-0.5 rounded-md bg-muted font-medium">{entry.fromStatus}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{entry.toStatus}</span>
            </div>
          )}
        </div>
      </button>

      {open && hasExpandable && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
          <div className="pt-3 space-y-3">
            {entry.reason && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Reason</p>
                <p className="text-sm mt-0.5">{entry.reason}</p>
              </div>
            )}

            {details.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {details.map((d) => (
                  <div key={`${d.label}-${d.value}`}>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{d.label}</p>
                    <p className="text-sm mt-0.5 font-medium">{d.value}</p>
                  </div>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Related</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {related.map((r) => (
                    <div key={`${r.label}-${r.value}`} className="rounded-md border bg-card px-3 py-2">
                      <p className="text-[11px] text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-medium">{r.value}</p>
                      {r.code && <p className="text-xs text-muted-foreground mt-0.5">{r.code}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityAuditLogComponent({ entityType, entityId, className }: ActivityAuditLogProps) {
  const { data, isLoading, error } = useTimeline(entityType, entityId);
  const [filter, setFilter] = useState<FilterType>('all');
  const [query, setQuery] = useState('');

  const entries = useMemo(() => {
    const raw = ((data?.data ?? []) as TimelineEntry[]).map(normalizeEntry);
    return raw.filter((e) => {
      // Drop leftover technical payloads
      if (isTechnicalValue(e.title) && isTechnicalValue(e.description)) return false;
      if (filter !== 'all') {
        if (filter === 'activity') {
          if (['status_change', 'created', 'updated'].includes(e.type)) return false;
        } else if (e.type !== filter) {
          return false;
        }
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = [
          e.title,
          e.description,
          e.performedBy,
          e.performedByRole,
          e.department,
          e.displayCode,
          e.fromStatus,
          e.toStatus,
          e.reason,
          ...(e.details || []).flatMap((d) => [d.label, d.value]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data?.data, filter, query]);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: TimelineEntry[] }>();
    for (const entry of entries) {
      const key = dayKey(entry.timestamp);
      if (!map.has(key)) {
        map.set(key, { label: dayLabel(entry.timestamp), items: [] });
      }
      map.get(key)!.items.push(entry);
    }
    return [...map.values()];
  }, [entries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-destructive">
        Unable to load activity timeline
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Activity Timeline</p>
          <p className="text-xs text-muted-foreground">
            Business actions, status changes, and related updates
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activity, user, status…"
          className="h-9 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'text-[11px] px-2.5 py-1 rounded-md border transition-colors',
              filter === f.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!entries.length ? (
        <div className="text-center py-10 text-sm text-muted-foreground border rounded-lg bg-muted/20">
          No activity recorded for this record yet.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-3">
                {group.items.map((entry) => (
                  <ActivityCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const ActivityAuditLog = memo(ActivityAuditLogComponent);
