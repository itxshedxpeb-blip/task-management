import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmployeePerformanceService } from './employee-performance.service';
import {
  EmployeeListQueryDto,
  EmployeeTasksQueryDto,
} from './dto/employee-performance-query.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/employees')
export class EmployeePerformanceController {
  constructor(
    private readonly employeePerformanceService: EmployeePerformanceService,
  ) {}

  @Get()
  @RequirePermissions('admin:user:list')
  @ApiOperation({ summary: 'List employees with aggregated performance metrics' })
  async list(@Query() query: EmployeeListQueryDto) {
    const data = await this.employeePerformanceService.getEmployeeList(query);
    return { message: 'Employees fetched.', data };
  }

  @Get(':id')
  @RequirePermissions('admin:user:read')
  @ApiOperation({ summary: 'Get employee profile with performance summary' })
  async get(@Param('id') id: string) {
    const data = await this.employeePerformanceService.getEmployeePerformance(id);
    return { message: 'Employee fetched.', data };
  }

  @Get(':id/tasks')
  @RequirePermissions('admin:user:read')
  @ApiOperation({ summary: 'List an employee\'s assigned tasks' })
  async tasks(
    @Param('id') id: string,
    @Query() query: EmployeeTasksQueryDto,
  ) {
    const data = await this.employeePerformanceService.getEmployeeTasks(id, query);
    return { message: 'Employee tasks fetched.', data };
  }

  @Get(':id/timeline')
  @RequirePermissions('admin:user:read')
  @ApiOperation({ summary: 'Get an employee\'s task activity timeline' })
  async timeline(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.employeePerformanceService.getEmployeeTimeline(
      id,
      limit ? Number(limit) : undefined,
    );
    return { message: 'Employee timeline fetched.', data };
  }

  @Get(':id/report')
  @RequirePermissions('admin:user:read')
  @ApiOperation({ summary: 'Get an employee\'s performance report charts' })
  async report(@Param('id') id: string) {
    const data = await this.employeePerformanceService.getEmployeeReport(id);
    return { message: 'Employee report fetched.', data };
  }
}
