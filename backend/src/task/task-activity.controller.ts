import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TaskActivityService } from './task-activity.service';
import { CreateTaskActivityDto } from './dto/create-task-activity.dto';
import { UpdateTaskActivityDto } from './dto/update-task-activity.dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../common/types';

@ApiTags('task-activity')
@ApiBearerAuth()
@Controller('tasks/:taskId/activities')
export class TaskActivityController {
  constructor(private readonly activityService: TaskActivityService) {}

  @Get()
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'List activities for a task' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Param('taskId') taskId: string,
    @CurrentUser() user: CurrentUserType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.activityService.listActivities(
      taskId,
      user,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return { message: 'Activities fetched successfully.', data };
  }

  @Get('next-follow-up')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get next upcoming follow-up for a task' })
  async getNextFollowUp(
    @Param('taskId') taskId: string,
  ) {
    const data = await this.activityService.getNextFollowUp(taskId);
    return { message: 'Next follow-up fetched.', data };
  }

  @Get(':activityId')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get a specific activity' })
  async getOne(
    @Param('taskId') taskId: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.activityService.getActivity(
      taskId,
      activityId,
      user,
    );
    return { message: 'Activity fetched.', data };
  }

  @Post()
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Create a new activity / follow-up' })
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskActivityDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.activityService.createActivity(taskId, dto, user);
    return { message: 'Activity created successfully.', data };
  }

  @Put(':activityId')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Update an activity' })
  async update(
    @Param('taskId') taskId: string,
    @Param('activityId') activityId: string,
    @Body() dto: UpdateTaskActivityDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.activityService.updateActivity(
      taskId,
      activityId,
      dto,
      user,
    );
    return { message: 'Activity updated successfully.', data };
  }

  @Delete(':activityId')
  @RequirePermissions('task:delete')
  @ApiOperation({ summary: 'Delete an activity' })
  async remove(
    @Param('taskId') taskId: string,
    @Param('activityId') activityId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const data = await this.activityService.deleteActivity(
      taskId,
      activityId,
      user,
    );
    return data;
  }
}
