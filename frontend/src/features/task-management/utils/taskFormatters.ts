/**
 * Lightweight, dependency-free formatters shared across the task foundation.
 * Centralises logic that screens previously inlined (initials, avatar colour,
 * due-date state, date formatting) so it is written once and reused everywhere.
 */

// ─── User helpers ───────────────────────────────────────────────────────────────

export function getInitials(name?: string | null): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic avatar tone derived from the name so the same person always gets
// the same colour. Alpha-based tones keep contrast in light and dark mode.
const AVATAR_TONES = [
  'bg-blue-500/15 text-blue-500',
  'bg-emerald-500/15 text-emerald-500',
  'bg-amber-500/15 text-amber-500',
  'bg-violet-500/15 text-violet-500',
  'bg-rose-500/15 text-rose-500',
  'bg-cyan-500/15 text-cyan-500',
  'bg-indigo-500/15 text-indigo-500',
  'bg-teal-500/15 text-teal-500',
];

export function getAvatarTone(seed?: string | null): string {
  const value = seed ?? '';
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export type DueState = 'overdue' | 'due-today' | 'due-tomorrow' | 'due-soon' | 'upcoming' | 'none';

export interface DueMeta {
  state: DueState;
  label: string;
  /** Whole-day difference from today (negative = past). */
  dayDiff: number;
}

function toDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Resolve the due-date state and a human label for a task's due date. */
export function getDueMeta(value?: Date | string | null, options?: { completed?: boolean }): DueMeta {
  const date = toDate(value);
  if (!date) return { state: 'none', label: 'No due date', dayDiff: 0 };

  const today = startOfDay(new Date());
  const due = startOfDay(date);
  const dayDiff = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (options?.completed) {
    return { state: 'upcoming', label: formatAbsoluteDate(date), dayDiff };
  }
  if (dayDiff < 0) {
    const n = Math.abs(dayDiff);
    return { state: 'overdue', label: `Overdue by ${n} day${n === 1 ? '' : 's'}`, dayDiff };
  }
  if (dayDiff === 0) return { state: 'due-today', label: 'Due today', dayDiff };
  if (dayDiff === 1) return { state: 'due-tomorrow', label: 'Due tomorrow', dayDiff };
  if (dayDiff <= 3) return { state: 'due-soon', label: `Due in ${dayDiff} days`, dayDiff };
  return { state: 'upcoming', label: formatAbsoluteDate(date), dayDiff };
}

export function formatAbsoluteDate(value?: Date | string | null): string {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelativeDate(value?: Date | string | null): string {
  const date = toDate(value);
  if (!date) return '—';

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  const abs = Math.abs(diffDays);

  if (abs === 0) return 'Today';
  if (abs === 1) return diffDays > 0 ? 'Tomorrow' : 'Yesterday';
  if (abs < 7) return diffDays > 0 ? `In ${abs} days` : `${abs} days ago`;
  return formatAbsoluteDate(date);
}
