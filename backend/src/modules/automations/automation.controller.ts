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
import { AutomationService } from './automation.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('automations')
@ApiBearerAuth()
@Controller('automations')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get()
  @RequirePermissions('automation:list')
  @ApiOperation({ summary: 'List automation rules' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.automationService.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Automation rules fetched.', data };
  }

  @Post()
  @RequirePermissions('automation:create')
  @ApiOperation({ summary: 'Create automation rule' })
  async create(@Body() dto: CreateAutomationDto) {
    const data = await this.automationService.create(dto);
    return { message: 'Automation rule created successfully.', data };
  }

  @Get(':id')
  @RequirePermissions('automation:list')
  @ApiOperation({ summary: 'Get automation rule' })
  async findById(@Param('id') id: string) {
    const data = await this.automationService.findById(id);
    return { message: 'Automation rule fetched.', data };
  }

  @Patch(':id')
  @RequirePermissions('automation:update')
  @ApiOperation({ summary: 'Update automation rule' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAutomationDto>,
  ) {
    const data = await this.automationService.update(id, dto);
    return { message: 'Automation rule updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('automation:delete')
  @ApiOperation({ summary: 'Delete automation rule' })
  async delete(@Param('id') id: string) {
    await this.automationService.delete(id);
    return { message: 'Automation rule deleted successfully.' };
  }

  @Patch(':id/toggle')
  @RequirePermissions('automation:update')
  @ApiOperation({ summary: 'Toggle automation rule active/inactive' })
  async toggle(@Param('id') id: string) {
    const data = await this.automationService.toggle(id);
    return { message: 'Automation rule toggled.', data };
  }
}
