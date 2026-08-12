import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthService } from '../health/health.service';
import { MetricsService } from './metrics.service';

export interface RecordErrorInput {
  requestId?: string;
  userId?: string;
  source: string;
  level: string;
  method?: string;
  url?: string;
  status?: number;
  message?: string;
  stackTrace?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLogQuery {
  page: number;
  pageSize: number;
  source?: string;
  level?: string;
  status?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly healthService: HealthService,
    private readonly metricsService: MetricsService,
  ) {}

  async recordError(input: RecordErrorInput): Promise<void> {
    try {
      await this.prisma.errorLog.create({
        data: {
          requestId: input.requestId,
          userId: input.userId,
          source: input.source,
          level: input.level,
          method: input.method,
          url: input.url,
          status: input.status,
          message: input.message ? String(input.message).slice(0, 4000) : null,
          stackTrace: input.stackTrace ? String(input.stackTrace).slice(0, 16000) : null,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: input.metadata as any,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to persist error log: ${message}`);
    }
  }

  async listErrorLogs(query: ErrorLogQuery) {
    const { page, pageSize, source, level, status, dateFrom, dateTo, search } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (source) where.source = source;
    if (level) where.level = level;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { stackTrace: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.errorLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestId: true,
          userId: true,
          source: true,
          level: true,
          method: true,
          url: true,
          status: true,
          message: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
      this.prisma.errorLog.count({ where }),
    ]);

    return {
      rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrevious: page > 1,
      },
    };
  }

  async getErrorLogDetail(id: string) {
    return this.prisma.errorLog.findUnique({ where: { id } });
  }

  async getStats() {
    const [health, metrics, activeSessions, dbStatus] = await Promise.all([
      this.healthService.check(),
      Promise.resolve(this.metricsService.snapshot()),
      this.prisma.session.count({
        where: { isRevoked: false, expiresAt: { gt: new Date() } },
      }),
      this.healthService.checkDatabase(),
    ]);

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [failedRequests24h, errorLogs24h, frontendErrors24h] = await Promise.all([
      this.prisma.errorLog.count({
        where: { createdAt: { gte: last24h }, source: 'backend', status: { gte: 500 } },
      }),
      this.prisma.errorLog.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.errorLog.count({
        where: { createdAt: { gte: last24h }, source: 'frontend' },
      }),
    ]);

    return {
      status: health.database.status === 'connected' ? 'ok' : 'degraded',
      api: {
        status: 'ok',
        uptimeSeconds: health.uptime,
        timestamp: health.timestamp,
      },
      database: {
        status: dbStatus.status === 'connected' ? 'ok' : 'down',
        latencyMs: dbStatus.latencyMs,
      },
      sessions: {
        activeSessions,
      },
      requests: metrics,
      errors: {
        failedRequests24h,
        errorLogs24h,
        frontendErrors24h,
      },
      memory: health.memory,
      cpu: health.cpu,
    };
  }
}
