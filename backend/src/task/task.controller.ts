import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { GetTasksDto } from './dto/get-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../common/types';

@ApiTags('task')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get all tasks with pagination and filters' })
  async findAll(
    @Query() query: GetTasksDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.findAll(query, user);
    return { message: 'Tasks fetched successfully.', data };
  }

  @Get('dashboard')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get current employee task dashboard' })
  async getDashboard(@CurrentUser() user: CurrentUserType) {
    const data = await this.taskService.getDashboard(user);
    return { message: 'Task dashboard fetched.', data };
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

  @Get('admin-dashboard')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get admin dashboard with rich employee cards' })
  async getAdminDashboard() {
    const data = await this.taskService.getAdminDashboard();
    return { message: 'Admin dashboard fetched.', data };
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
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.findById(id, user);
    return { message: 'Task fetched successfully.', data };
  }

  @Post()
  @RequirePermissions('task:create')
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.create(dto, user);
    return { message: 'Task created successfully.', data };
  }

  @Post(':id/complete')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Complete a task' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteTaskDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.complete(id, dto, user);
    return { message: 'Task completed successfully.', data };
  }

  @Patch(':id')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.update(id, dto, user);
    return { message: 'Task updated successfully.', data };
  }

  @Delete(':id')
  @RequirePermissions('task:delete')
  @ApiOperation({ summary: 'Delete a task' })
  async softDelete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.taskService.deleteTask(id, user);
    return { message: 'Task deleted successfully.', data };
  }
}
