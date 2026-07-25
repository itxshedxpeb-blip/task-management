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
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @RequirePermissions('department:list')
  @ApiOperation({ summary: 'List departments' })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ) {
    const data = await this.departmentService.findAll(organizationId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
    });
    return { message: 'Departments fetched.', data };
  }

  @Post()
  @RequirePermissions('department:create')
  @ApiOperation({ summary: 'Create department' })
  async create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.departmentService.create(dto, organizationId);
    return { message: 'Department created successfully.', data };
  }

  @Get(':id')
  @RequirePermissions('department:list')
  @ApiOperation({ summary: 'Get department with teams and members' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.departmentService.findById(id, organizationId);
    return { message: 'Department fetched.', data };
  }

  @Patch(':id')
  @RequirePermissions('department:update')
  @ApiOperation({ summary: 'Update department' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.departmentService.update(id, dto, organizationId);
    return { message: 'Department updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('department:delete')
  @ApiOperation({ summary: 'Delete department' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.departmentService.delete(id, organizationId);
    return { message: 'Department deleted successfully.' };
  }

  @Post(':id/members')
  @RequirePermissions('department:update')
  @ApiOperation({ summary: 'Add member to department' })
  async addMember(
    @Param('id') id: string,
    @Body() body: { userId: string; role?: string },
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.departmentService.addMember(id, body.userId, body.role || 'member', organizationId);
    return { message: 'Member added to department.', data };
  }

  @Delete(':id/members/:userId')
  @RequirePermissions('department:update')
  @ApiOperation({ summary: 'Remove member from department' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    await this.departmentService.removeMember(id, userId, organizationId);
    return { message: 'Member removed from department.' };
  }
}
