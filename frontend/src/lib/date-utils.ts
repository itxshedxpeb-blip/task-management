import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with UTC, timezone, relativeTime, and isBetween plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

// Set default timezone to IST (Asia/Kolkata) for India users
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date to DD MMM YYYY format (e.g., 27 Jul 2026)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string or '—' if invalid/missing
 */
export function formatDate(date: string | Date | dayjs.Dayjs | null | undefined): string {
  if (!date) return '—';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return '—';
  return parsed.format('DD MMM YYYY');
}

/**
 * Format a date to DD MMM YYYY, hh:mm A format (e.g., 27 Jul 2026, 02:30 PM)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string or '—' if invalid/missing
 */
export function formatDateTime(date: string | Date | dayjs.Dayjs | null | undefined): string {
  if (!date) return '—';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return '—';
  return parsed.format('DD MMM YYYY, hh:mm A');
}

/**
 * Format a date to a short format (e.g., 27/07/2026)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string or '—' if invalid/missing
 */
export function formatShortDate(date: string | Date | dayjs.Dayjs | null | undefined): string {
  if (!date) return '—';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return '—';
  return parsed.format('DD/MM/YYYY');
}

/**
 * Format a date to ISO string format for API requests
 * @param date - Date string, Date object, or dayjs object
 * @returns ISO string or undefined if invalid/missing
 */
export function toISOString(date: string | Date | dayjs.Dayjs | null | undefined): string | undefined {
  if (!date) return undefined;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return undefined;
  return parsed.toISOString();
}

/**
 * Format a date to date input format (YYYY-MM-DD)
 * @param date - Date string, Date object, or dayjs object
 * @returns Formatted date string or empty string if invalid/missing
 */
export function toInputDate(date: string | Date | dayjs.Dayjs | null | undefined): string {
  if (!date) return '';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return '';
  return parsed.format('YYYY-MM-DD');
}

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 * @param date - Date string, Date object, or dayjs object
 * @returns Relative time string or '—' if invalid/missing
 */
export function formatRelativeTime(date: string | Date | dayjs.Dayjs | null | undefined): string {
  if (!date) return '—';
  const parsed = dayjs(date);
  if (!parsed.isValid()) return '—';
  return parsed.fromNow();
}

/**
 * Check if a date is in the past
 * @param date - Date string, Date object, or dayjs object
 * @returns true if date is in the past, false otherwise
 */
export function isPast(date: string | Date | dayjs.Dayjs | null | undefined): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return false;
  return parsed.isBefore(dayjs());
}

/**
 * Check if a date is in the future
 * @param date - Date string, Date object, or dayjs object
 * @returns true if date is in the future, false otherwise
 */
export function isFuture(date: string | Date | dayjs.Dayjs | null | undefined): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return false;
  return parsed.isAfter(dayjs());
}

/**
 * Check if a date is today
 * @param date - Date string, Date object, or dayjs object
 * @returns true if date is today, false otherwise
 */
export function isToday(date: string | Date | dayjs.Dayjs | null | undefined): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  if (!parsed.isValid()) return false;
  return parsed.isSame(dayjs(), 'day');
}

/**
 * Format date in a specific timezone
 * @param date - Date string, Date object, or dayjs object
 * @param timezone - Timezone string (e.g., 'UTC', 'America/New_York')
 * @returns Formatted date string or '—' if invalid/missing
 */
export function formatDateInTimezone(
  date: string | Date | dayjs.Dayjs | null | undefined,
  timezone: string = DEFAULT_TIMEZONE
): string {
  if (!date) return '—';
  const parsed = dayjs(date).tz(timezone);
  if (!parsed.isValid()) return '—';
  return parsed.format('DD MMM YYYY, hh:mm A');
}

/**
 * Get the current date in ISO format
 * @returns Current date as ISO string
 */
export function getCurrentDateISO(): string {
  return dayjs().toISOString();
}

/**
 * Get the current date in input format (YYYY-MM-DD) using local timezone
 * @returns Current date as YYYY-MM-DD string in local timezone
 */
export function getCurrentInputDate(): string {
  return dayjs().tz(DEFAULT_TIMEZONE).format('YYYY-MM-DD');
}

// Export dayjs for advanced usage if needed
export { dayjs };
