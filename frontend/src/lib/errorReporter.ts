/**
 * Self-hosted error reporting for the frontend.
 * Buffers errors and reports them to the backend `/monitoring/errors` endpoint.
 * Lightweight: plain fetch, no auth dependency, fire-and-forget.
 */

import { getFullApiUrl } from './config';

export interface ReportedError {
  source: 'frontend';
  level: 'info' | 'warning' | 'error' | 'fatal';
  message?: string;
  stackTrace?: string;
  url?: string;
  method?: string;
  status?: number;
  metadata?: Record<string, unknown>;
}

const MAX_BUFFER = 50;
const SEND_INTERVAL_MS = 10_000;
const MAX_RETRIES = 2;

let buffer: ReportedError[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let enabled: boolean | null = null;
let sendInFlight = false;

function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  if (typeof window === 'undefined') {
    enabled = false;
    return enabled;
  }
  const flag = process.env.NEXT_PUBLIC_ENABLE_CRASH_REPORTING === 'true';
  enabled = flag;
  return enabled;
}

function enqueue(error: ReportedError) {
  if (!error.message && !error.stackTrace) return;
  buffer.push(error);
  if (buffer.length > MAX_BUFFER) {
    buffer.splice(0, buffer.length - MAX_BUFFER);
  }
  scheduleFlush();
}

function scheduleFlush() {
  if (timer || sendInFlight) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, SEND_INTERVAL_MS);
}

function parseStatus(message: string): number | undefined {
  if (typeof window === 'undefined') return undefined;
  const match = message.match(/^Request failed with status code (\d+)/);
  return match ? Number(match[1]) : undefined;
}

async function flush() {
  if (sendInFlight || buffer.length === 0) return;
  if (!isEnabled()) {
    buffer = [];
    return;
  }

  const batch = buffer.splice(0, buffer.length);
  sendInFlight = true;

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(getFullApiUrl('/monitoring/errors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
        signal: controller.signal,
        keepalive: true,
      });
      clearTimeout(timeout);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
      if (response.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }

  // On failure, re-buffer the batch (limited) so it can retry on the next flush.
  if (buffer.length < MAX_BUFFER) {
    buffer = [...batch.slice(0, MAX_BUFFER - buffer.length), ...buffer];
  }
  if (lastError) {
    console.warn('[errorReporter] Failed to send error report:', lastError);
  }
}

export function reportError(input: ReportedError) {
  try {
    if (!isEnabled()) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;
    const status = input.status ?? parseStatus(input.message || '');
    enqueue({
      ...input,
      source: 'frontend',
      url: input.url || currentUrl,
      status,
    });
  } catch {
    // Never let the reporter itself break the app.
  }
}

export function reportErrorNow(input: ReportedError) {
  reportError(input);
  void flush();
}
