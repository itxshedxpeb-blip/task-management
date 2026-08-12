import { Injectable, OnModuleDestroy } from '@nestjs/common';

export interface RequestRecord {
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

export interface MetricsSnapshot {
  totalRequests: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  slowRequests: number;
  requestsPerMinute: number;
  statusBreakdown: Record<string, number>;
  slowThresholdMs: number;
}

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const SLOW_THRESHOLD_MS = 2000;

@Injectable()
export class MetricsService implements OnModuleDestroy {
  private readonly records: RequestRecord[] = [];
  private readonly windowMs: number;
  private readonly slowThresholdMs: number;
  private readonly maxRecords: number;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.windowMs = parseInt(process.env.METRICS_WINDOW_MS || String(DEFAULT_WINDOW_MS), 10);
    this.slowThresholdMs = parseInt(
      process.env.SLOW_REQUEST_THRESHOLD_MS || String(SLOW_THRESHOLD_MS),
      10,
    );
    this.maxRecords = parseInt(process.env.METRICS_MAX_RECORDS || '20000', 10);

    this.timer = setInterval(() => this.prune(), 60_000);
    if (this.timer.unref) this.timer.unref();
  }

  record(record: RequestRecord) {
    this.records.push(record);
    if (this.records.length > this.maxRecords) {
      this.records.splice(0, this.records.length - this.maxRecords);
    }
  }

  clear() {
    this.records.length = 0;
  }

  private prune() {
    const cutoff = Date.now() - this.windowMs;
    while (this.records.length && this.records[0].timestamp < cutoff) {
      this.records.shift();
    }
  }

  snapshot(): MetricsSnapshot {
    this.prune();
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const inWindow = this.records.filter((r) => r.timestamp >= windowStart);
    const totalRequests = inWindow.length;
    const failedRequests = inWindow.filter((r) => r.statusCode >= 500).length;
    const slowRequests = inWindow.filter((r) => r.durationMs > this.slowThresholdMs).length;

    const durations = inWindow.map((r) => r.durationMs).sort((a, b) => a - b);
    const avgResponseTimeMs =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    const p95ResponseTimeMs =
      durations.length > 0 ? durations[Math.min(durations.length - 1, Math.floor(durations.length * 0.95))] : 0;

    const oneMinuteAgo = now - 60_000;
    const requestsPerMinute = this.records.filter((r) => r.timestamp >= oneMinuteAgo).length;

    const statusBreakdown: Record<string, number> = {};
    for (const r of inWindow) {
      const key = String(r.statusCode);
      statusBreakdown[key] = (statusBreakdown[key] || 0) + 1;
    }

    return {
      totalRequests,
      failedRequests,
      avgResponseTimeMs,
      p95ResponseTimeMs,
      slowRequests,
      requestsPerMinute,
      statusBreakdown,
      slowThresholdMs: this.slowThresholdMs,
    };
  }

  recent(limit = 50): RequestRecord[] {
    this.prune();
    return this.records.slice(-limit).reverse();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
