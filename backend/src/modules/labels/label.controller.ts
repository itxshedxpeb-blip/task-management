import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  @RequirePermissions('label:list')
  @ApiOperation({ summary: 'List labels for organization' })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.labelService.findAll(organizationId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Labels fetched.', data };
  }

  @Post()
  @RequirePermissions('label:create')
  @ApiOperation({ summary: 'Create label' })
  async create(
    @Body() dto: CreateLabelDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.labelService.create(dto, organizationId);
    return { message: 'Label created successfully.', data };
  }

  @Patch(':id')
  @RequirePermissions('label:update')
  @ApiOperation({ summary: 'Update label' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateLabelDto>,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.labelService.update(id, dto, organizationId);
    return { message: 'Label updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('label:delete')
  @ApiOperation({ summary: 'Delete label' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.labelService.delete(id, organizationId);
    return { message: 'Label deleted successfully.' };
  }
}

@ApiTags('labels')
@ApiBearerAuth()
@Controller('tasks')
export class TaskLabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post(':taskId/labels')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Assign labels to task' })
  async assignLabels(
    @Param('taskId') taskId: string,
    @Body() body: { labelIds: string[] },
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.labelService.assignToTask(taskId, body.labelIds, organizationId);
    return { message: 'Labels assigned to task.', data };
  }

  @Delete(':taskId/labels/:labelId')
  @RequirePermissions('task:update')
  @ApiOperation({ summary: 'Remove label from task' })
  async removeLabel(
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.labelService.removeFromTask(taskId, labelId, organizationId);
    return { message: 'Label removed from task.' };
  }
}
