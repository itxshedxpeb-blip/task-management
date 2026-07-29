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
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  @RequirePermissions('template:list')
  @ApiOperation({ summary: 'List templates' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.templateService.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Templates fetched.', data };
  }

  @Post()
  @RequirePermissions('template:create')
  @ApiOperation({ summary: 'Create template' })
  async create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.templateService.create(dto, userId);
    return { message: 'Template created successfully.', data };
  }

  @Get(':id')
  @RequirePermissions('template:list')
  @ApiOperation({ summary: 'Get template' })
  async findById(@Param('id') id: string) {
    const data = await this.templateService.findById(id);
    return { message: 'Template fetched.', data };
  }

  @Patch(':id')
  @RequirePermissions('template:update')
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTemplateDto>,
  ) {
    const data = await this.templateService.update(id, dto);
    return { message: 'Template updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('template:delete')
  @ApiOperation({ summary: 'Delete template' })
  async delete(@Param('id') id: string) {
    await this.templateService.delete(id);
    return { message: 'Template deleted successfully.' };
  }

  @Post(':id/apply')
  @RequirePermissions('template:apply')
  @ApiOperation({ summary: 'Apply template to create a task' })
  async apply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const data = await this.templateService.apply(id, userId, userName || 'Unknown');
    return { message: 'Task created from template.', data };
  }
}
