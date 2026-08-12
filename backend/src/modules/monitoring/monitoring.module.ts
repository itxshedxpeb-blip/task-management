import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';

@Module({
  imports: [HealthModule],
  controllers: [MonitoringController],
  providers: [MonitoringService, MetricsService],
  exports: [MonitoringService, MetricsService],
})
export class MonitoringModule {}
