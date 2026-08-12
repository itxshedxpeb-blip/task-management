import { Injectable } from '@nestjs/common';
import { cpus, loadavg } from 'os';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthCheckResult {
  success: boolean;
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  database: { status: 'connected' | 'disconnected'; latencyMs?: number };
  memory: {
    used: string;
    total: string;
    usedBytes: number;
    totalBytes: number;
    heapUsed: string;
    external: string;
  };
  cpu: { cores: number; loadAvg: number[]; cpuUsage: { user: number; system: number } };
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(0)}${units[i]}`;
}

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async live() {
    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  async checkDatabase() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'connected' as const, latencyMs: Date.now() - start };
    } catch {
      return { status: 'disconnected' as const, latencyMs: Date.now() - start };
    }
  }

  async ready() {
    const db = await this.checkDatabase();
    return {
      database: db,
      timestamp: new Date().toISOString(),
    };
  }

  async mail() {
    // No dedicated SMTP service in this deployment; report configuration only.
    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);
    return {
      success: true,
      status: 'ok' as const,
      configured: smtpConfigured,
      message: smtpConfigured
        ? 'SMTP configuration present'
        : 'SMTP not configured (mail service not deployed)',
      timestamp: new Date().toISOString(),
    };
  }

  async check(): Promise<HealthCheckResult> {
    const db = await this.checkDatabase();
    const memory = process.memoryUsage();
    const totalBytes = memory.rss;
    const totalMem = Math.max(totalBytes, 512 * 1024 * 1024);

    const dbConnected = db.status === 'connected';

    return {
      success: dbConnected,
      status: dbConnected ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      database: {
        status: db.status,
        latencyMs: db.latencyMs,
      },
      memory: {
        used: formatBytes(totalBytes),
        total: formatBytes(totalMem),
        usedBytes: totalBytes,
        totalBytes: totalMem,
        heapUsed: formatBytes(memory.heapUsed),
        external: formatBytes(memory.external),
      },
      cpu: {
        cores: cpus().length,
        loadAvg: loadavg(),
        cpuUsage: process.cpuUsage(),
      },
    };
  }
}
