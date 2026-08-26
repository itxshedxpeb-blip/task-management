/**
 * Lightweight formatters shared across the task foundation.
 * Centralises logic that screens previously inlined (initials, avatar colour,
 * due-date state, date formatting) so it is written once and reused everywhere.
 */

import { formatDate, isToday, isPast, dayjs } from '@/lib/date-utils';
import type { TaskStatus } from '../types';

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

function toDate(value?: Date | string | null): dayjs.Dayjs | null {
  if (!value) return null;
  // Handle empty objects (backend sometimes returns {} for dates)
  if (typeof value === 'object' && Object.keys(value).length === 0) return null;
  const date = dayjs(value);
  return date.isValid() ? date : null;
}

function startOfDay(date: dayjs.Dayjs): dayjs.Dayjs {
  return date.startOf('day');
}

/** Resolve the due-date state and a human label for a task's due date. */
export function getDueMeta(value?: Date | string | null, options?: { completed?: boolean }): DueMeta {
  const date = toDate(value);
  if (!date) return { state: 'none', label: 'No due date', dayDiff: 0 };

  const today = startOfDay(dayjs());
  const due = startOfDay(date);
  const dayDiff = due.diff(today, 'day');

  if (options?.completed) {
    return { state: 'upcoming', label: formatAbsoluteDate(value), dayDiff };
  }
  if (dayDiff < 0) {
    const n = Math.abs(dayDiff);
    return { state: 'overdue', label: `Overdue by ${n} day${n === 1 ? '' : 's'}`, dayDiff };
  }
  if (dayDiff === 0) return { state: 'due-today', label: 'Due today', dayDiff };
  if (dayDiff === 1) return { state: 'due-tomorrow', label: 'Due tomorrow', dayDiff };
  if (dayDiff <= 3) return { state: 'due-soon', label: `Due in ${dayDiff} days`, dayDiff };
  return { state: 'upcoming', label: formatAbsoluteDate(value), dayDiff };
}

export function formatAbsoluteDate(value?: Date | string | null): string {
  return formatDate(value);
}

export function formatRelativeDate(value?: Date | string | null): string {
  const date = toDate(value);
  if (!date) return '—';

  const diffDays = date.diff(dayjs(), 'day');
  const abs = Math.abs(diffDays);

  if (abs === 0) return 'Today';
  if (abs === 1) return diffDays > 0 ? 'Tomorrow' : 'Yesterday';
  if (abs < 7) return diffDays > 0 ? `In ${abs} days` : `${abs} days ago`;
  return formatAbsoluteDate(value);
}

// ─── Task computed helpers ────────────────────────────────────────────────────

/** Days since the task was created. Returns 0 if createdAt is missing. */
export function getTaskAge(createdAt?: Date | string | null): number {
  const created = toDate(createdAt);
  if (!created) return 0;
  return Math.abs(startOfDay(dayjs()).diff(startOfDay(created), 'day'));
}

/** Human-readable task age with actual date (e.g. "Created 26 Aug 2026"). */
export function formatTaskAge(createdAt?: Date | string | null): string {
  const date = toDate(createdAt);
  if (!date) return 'No date';
  return `Created ${formatDate(createdAt)}`;
}

/** Days remaining until due date. Negative means overdue. Returns null if no dueDate. */
export function getDaysRemaining(dueDate?: Date | string | null): number | null {
  const due = toDate(dueDate);
  if (!due) return null;
  return startOfDay(due).diff(startOfDay(dayjs()), 'day');
}

/** Human-readable countdown label (e.g. "2 Days Left", "Overdue 3 Days", "Due Today"). */
export function getCountdownLabel(dueDate?: Date | string | null, completed?: boolean): string {
  const remaining = getDaysRemaining(dueDate);
  if (remaining === null) return 'No due date';
  if (completed) return 'Completed';
  if (remaining < 0) {
    const n = Math.abs(remaining);
    return `Overdue ${n} Day${n === 1 ? '' : 's'}`;
  }
  if (remaining === 0) return 'Due Today';
  if (remaining === 1) return '1 Day Left';
  return `${remaining} Days Left`;
}

/** Exact countdown breakdown for live display. */
export function getCountdownBreakdown(dueDate?: Date | string | null): { days: number; hours: number; minutes: number; seconds: number; total: number } | null {
  const due = toDate(dueDate);
  if (!due) return null;
  const now = dayjs();
  const diff = due.diff(now, 'second');
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: diff };
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds, total: diff };
}

/** Days overdue. Returns 0 if not overdue, null if no dueDate. */
export function getDaysOverdue(dueDate?: Date | string | null): number | null {
  const remaining = getDaysRemaining(dueDate);
  if (remaining === null) return null;
  return remaining < 0 ? Math.abs(remaining) : 0;
}

/** Whether a task was completed after its due date. */
export function isCompletedLate(dueDate?: Date | string | null, completedAt?: Date | string | null, status?: TaskStatus): boolean {
  if (status !== 'Completed' && status !== 'Archived') return false;
  if (!dueDate || !completedAt) return false;
  const due = toDate(dueDate);
  const completed = toDate(completedAt);
  if (!due || !completed) return false;
  return completed.isAfter(due);
}

/** Human-readable "Completed X Days Late" or null if on time. */
export function getCompletedLateLabel(dueDate?: Date | string | null, completedAt?: Date | string | null, status?: TaskStatus): string | null {
  if (!isCompletedLate(dueDate, completedAt, status)) return null;
  const due = toDate(dueDate)!;
  const completed = toDate(completedAt)!;
  const daysLate = Math.abs(startOfDay(completed).diff(startOfDay(due), 'day'));
  if (daysLate === 0) return 'Completed Late';
  return `Completed ${daysLate} Day${daysLate === 1 ? '' : 's'} Late`;
}
