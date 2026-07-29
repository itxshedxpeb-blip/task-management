import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('performance')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'Get employee performance data' })
  async getPerformance(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const data = await this.reportsService.getPerformance({ dateFrom, dateTo, employeeId });
    return { message: 'Performance report fetched.', data };
  }

  @Get('tasks')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'Get task completion report' })
  async getTaskReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const data = await this.reportsService.getTaskReport({ dateFrom, dateTo });
    return { message: 'Task report fetched.', data };
  }

  @Get('summary')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'Get dashboard summary for reports page' })
  async getSummary() {
    const data = await this.reportsService.getSummary();
    return { message: 'Report summary fetched.', data };
  }
}
