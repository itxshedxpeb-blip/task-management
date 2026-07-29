import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @RequirePermissions('team:list')
  @ApiOperation({ summary: 'List teams (departments)' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.teamService.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Teams fetched.', data };
  }

  @Get(':id')
  @RequirePermissions('team:list')
  @ApiOperation({ summary: 'Get team with members' })
  async findById(@Param('id') id: string) {
    const data = await this.teamService.findById(id);
    return { message: 'Team fetched.', data };
  }
}
