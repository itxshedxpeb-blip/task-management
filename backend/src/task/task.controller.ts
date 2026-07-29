import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { GetTasksDto } from './dto/get-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { VerifyTaskDto } from './dto/verify-task.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  async findAll(@Query() query: GetTasksDto) {
    const data = await this.taskService.findAll(query);
    return { message: 'Tasks fetched successfully.', data };
  }

  @Get('stats')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get task statistics' })
  async getStats(@CurrentUser('id') userId: string) {
    const data = await this.taskService.getTaskStats(userId);
    return { message: 'Task stats fetched.', data };
  }

  @Get('my-stats')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get current user task statistics' })
  async getMyStats(@CurrentUser('id') userId: string) {
    const data = await this.taskService.getMyStats(userId);
    return { message: 'My task stats fetched.', data };
  }

  @Get('dashboard-kpis')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get dashboard KPIs for tasks' })
  async getDashboardKPIs() {
    const data = await this.taskService.getDashboardKPIs();
    return { message: 'Dashboard KPIs fetched.', data };
  }

  @Get('employee-performance')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get employee performance stats' })
  async getEmployeePerformance(
    @Query('employeeId') employeeId: string | undefined,
  ) {
    const data = await this.taskService.getEmployeePerformance(employeeId);
    return { message: 'Employee performance fetched.', data };
  }

  @Get(':id')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get task by ID' })
  async findById(@Param('id') id: string) {
    const data = await this.taskService.findById(id);
    return { message: 'Task fetched successfully.', data };
  }

  @Post()
  @RequirePermissions('task:create')
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const data = await this.taskService.create(dto, userId, userName || 'Unknown');
    return { message: 'Task created successfully.', data };
  }

  @Post(':id/complete')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Complete a task with photo proof' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const data = await this.taskService.complete(id, dto, userId, userName || 'Unknown');
    return { message: 'Task completed successfully.', data };
  }

  @Post(':id/verify')
  @RequirePermissions('task:approve')
  @ApiOperation({ summary: 'Verify or reject a completed task' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyTaskDto,
  ) {
    const data = await this.taskService.verify(id, dto);
    const action = dto.status === 'Verified' ? 'verified' : 'rejected';
    return { message: `Task ${action} successfully.`, data };
  }

  @Patch(':id')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const data = await this.taskService.update(id, dto, userId, userName || 'Unknown');
    return { message: 'Task updated successfully.', data };
  }

  @Delete(':id')
  @RequirePermissions('task:delete')
  @ApiOperation({ summary: 'Delete a task' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const data = await this.taskService.deleteTask(id, userId, userName || 'Unknown');
    return { message: 'Task deleted successfully.', data };
  }
}
