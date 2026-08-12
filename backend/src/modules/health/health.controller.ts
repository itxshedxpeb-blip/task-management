import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  @ApiOperation({ summary: 'Liveness + readiness + resource health check' })
  async health() {
    return this.healthService.check();
  }

  @Public()
  @SkipThrottle()
  @Get('live')
  @ApiOperation({ summary: 'Liveness check (process is up)' })
  async live() {
    return this.healthService.live();
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (dependencies available)' })
  async ready() {
    const ready = await this.healthService.ready();
    if (ready.database.status !== 'connected') {
      throw new ServiceUnavailableException({ success: false, status: 'error', ...ready });
    }
    return { success: true, status: 'ok', ...ready };
  }

  @Public()
  @SkipThrottle()
  @Get('health/mail')
  @ApiOperation({ summary: 'Mail health check' })
  async mail() {
    return this.healthService.mail();
  }
}
