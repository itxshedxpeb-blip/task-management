import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmployeePerformanceController } from './employee-performance.controller';
import { EmployeePerformanceService } from './employee-performance.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeePerformanceController],
  providers: [EmployeePerformanceService],
  exports: [EmployeePerformanceService],
})
export class EmployeePerformanceModule {}
