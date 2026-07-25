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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @RequirePermissions('team:list')
  @ApiOperation({ summary: 'List teams for organization' })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.teamService.findAll(organizationId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Teams fetched.', data };
  }

  @Post()
  @RequirePermissions('team:create')
  @ApiOperation({ summary: 'Create team' })
  async create(
    @Body() dto: CreateTeamDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.teamService.create(dto, organizationId);
    return { message: 'Team created successfully.', data };
  }

  @Get(':id')
  @RequirePermissions('team:list')
  @ApiOperation({ summary: 'Get team with members' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.teamService.findById(id, organizationId);
    return { message: 'Team fetched.', data };
  }

  @Patch(':id')
  @RequirePermissions('team:update')
  @ApiOperation({ summary: 'Update team' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.teamService.update(id, dto, organizationId);
    return { message: 'Team updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('team:delete')
  @ApiOperation({ summary: 'Delete team' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.teamService.delete(id, organizationId);
    return { message: 'Team deleted successfully.' };
  }

  @Post(':id/members')
  @RequirePermissions('team:update')
  @ApiOperation({ summary: 'Add member to team' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: CreateTeamMemberDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.teamService.addMember(id, dto.userId, dto.role || 'member', organizationId);
    return { message: 'Member added to team.', data };
  }

  @Delete(':id/members/:userId')
  @RequirePermissions('team:update')
  @ApiOperation({ summary: 'Remove member from team' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.teamService.removeMember(id, userId, organizationId);
    return { message: 'Member removed from team.' };
  }
}
