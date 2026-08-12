import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { Public } from '../../auth/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';
import { ReportErrorDto, ErrorLogQueryDto } from './dto/report-error.dto';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post('errors')
  @ApiOperation({ summary: 'Report errors from a client (frontend/browser). Accepts a single object or a batch.' })
  async reportError(@Body() body: unknown, @Req() req: FastifyRequest) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const items: ReportErrorDto[] = Array.isArray(body)
      ? (body as ReportErrorDto[])
      : [body as ReportErrorDto];

    const sanitized = items.filter((item) => item && typeof item === 'object');

    await Promise.all(
      sanitized.map((dto) =>
        this.monitoringService.recordError({
          requestId: req.requestId,
          source: dto.source || 'frontend',
          level: dto.level || 'error',
          message: dto.message,
          stackTrace: dto.stackTrace,
          url: dto.url,
          method: dto.method,
          status: dto.status,
          metadata: dto.metadata,
          ipAddress: ip,
          userAgent: req.headers['user-agent'],
        }),
      ),
    );

    return { message: 'Errors reported.', data: { received: sanitized.length } };
  }

  @ApiBearerAuth()
  @Get('recent-requests')
  @RequirePermissions('admin:monitoring:read')
  @ApiOperation({ summary: 'Recent request metrics (admin)' })
  async recentRequests(@Query('limit') limit?: number) {
    return {
      message: 'Recent requests fetched.',
      data: this.metricsService.recent(Math.min(Math.max(Number(limit) || 50, 1), 200)),
    };
  }

  @ApiBearerAuth()
  @Get('metrics')
  @RequirePermissions('admin:monitoring:read')
  @ApiOperation({ summary: 'In-memory request metrics snapshot (admin)' })
  async metrics() {
    return { message: 'Metrics fetched.', data: this.metricsService.snapshot() };
  }

  @ApiBearerAuth()
  @Get('errors')
  @RequirePermissions('admin:monitoring:read')
  @ApiOperation({ summary: 'List error logs (admin)' })
  async listErrors(@Query() query: ErrorLogQueryDto) {
    const data = await this.monitoringService.listErrorLogs({
      page: query.page || 1,
      pageSize: Math.min(query.pageSize || 25, 100),
      source: query.source,
      level: query.level,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
    });
    return { message: 'Error logs fetched.', data };
  }

  @ApiBearerAuth()
  @Get('errors/:id')
  @RequirePermissions('admin:monitoring:read')
  @ApiOperation({ summary: 'Get error log detail (admin)' })
  async getError(@Param('id') id: string) {
    const data = await this.monitoringService.getErrorLogDetail(id);
    return { message: data ? 'Error log fetched.' : 'Error log not found.', data };
  }

  @ApiBearerAuth()
  @Get('stats')
  @RequirePermissions('admin:monitoring:read')
  @ApiOperation({ summary: 'System monitoring stats (admin)' })
  async getStats() {
    const data = await this.monitoringService.getStats();
    return { message: 'Monitoring stats fetched.', data };
  }
}
