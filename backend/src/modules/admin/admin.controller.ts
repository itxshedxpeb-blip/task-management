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
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipOrgScope } from '../../common/decorators/org-scope.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('auth/login')
  @ApiOperation({ summary: 'System admin login' })
  async login(@Body() dto: AdminLoginDto) {
    const data = await this.adminService.adminLogin(dto.email, dto.password);
    return { message: 'Admin login successful.', data };
  }

  @ApiBearerAuth()
  @Get('dashboard/stats')
  @RequirePermissions('admin:dashboard')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Get system-wide dashboard stats' })
  async getDashboardStats() {
    const data = await this.adminService.getDashboardStats();
    return { message: 'Dashboard stats fetched.', data };
  }

  @ApiBearerAuth()
  @Get('companies')
  @RequirePermissions('admin:company:list')
  @SkipOrgScope()
  @ApiOperation({ summary: 'List all organizations' })
  async listCompanies(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.adminService.listOrganizations({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
      status,
      sortBy,
      sortOrder,
    });
    return { message: 'Companies fetched.', data };
  }

  @ApiBearerAuth()
  @Post('companies')
  @RequirePermissions('admin:company:create')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Create organization' })
  async createCompany(@Body() body: { name: string; email?: string; slug?: string; maxUsers?: number; maxStorageGb?: number; subscriptionTier?: string }) {
    const data = await this.adminService.createOrganization(body);
    return { message: 'Company created successfully.', data };
  }

  @ApiBearerAuth()
  @Get('companies/:id')
  @RequirePermissions('admin:company:read')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Get organization by ID' })
  async getCompany(@Param('id') id: string) {
    const data = await this.adminService.getOrganization(id);
    return { message: 'Company fetched.', data };
  }

  @ApiBearerAuth()
  @Patch('companies/:id')
  @RequirePermissions('admin:company:update')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Update organization' })
  async updateCompany(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; maxUsers?: number; maxStorageGb?: number; subscriptionTier?: string },
  ) {
    const data = await this.adminService.updateOrganization(id, body);
    return { message: 'Company updated.', data };
  }

  @ApiBearerAuth()
  @Delete('companies/:id')
  @RequirePermissions('admin:company:delete')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Soft delete organization' })
  async deleteCompany(@Param('id') id: string) {
    await this.adminService.deleteOrganization(id);
    return { message: 'Company deleted successfully.' };
  }

  @ApiBearerAuth()
  @Patch('companies/:id/suspend')
  @RequirePermissions('admin:company:suspend')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Suspend organization' })
  async suspendCompany(@Param('id') id: string) {
    const data = await this.adminService.suspendOrganization(id);
    return { message: 'Company suspended.', data };
  }

  @ApiBearerAuth()
  @Get('users')
  @RequirePermissions('admin:user:list')
  @SkipOrgScope()
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.adminService.listUsers({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
      organizationId,
      role,
      sortBy,
      sortOrder,
    });
    return { message: 'Users fetched.', data };
  }

  @ApiBearerAuth()
  @Post('users')
  @RequirePermissions('admin:user:create')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() body: { email: string; password: string; name?: string; role?: string; userType?: string; organizationId?: string }) {
    const data = await this.adminService.createUser(body);
    return { message: 'User created successfully.', data };
  }

  @ApiBearerAuth()
  @Get('users/:id')
  @RequirePermissions('admin:user:read')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const data = await this.adminService.getUser(id);
    return { message: 'User fetched.', data };
  }

  @ApiBearerAuth()
  @Patch('users/:id')
  @RequirePermissions('admin:user:update')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: { name?: string; role?: string; userType?: string; isActive?: boolean; organizationId?: string },
  ) {
    const data = await this.adminService.updateUser(id, body);
    return { message: 'User updated.', data };
  }

  @ApiBearerAuth()
  @Delete('users/:id')
  @RequirePermissions('admin:user:delete')
  @SkipOrgScope()
  @ApiOperation({ summary: 'Soft delete user' })
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
    return { message: 'User deleted successfully.' };
  }

  @ApiBearerAuth()
  @Get('audit-logs')
  @RequirePermissions('admin:audit:list')
  @SkipOrgScope()
  @ApiOperation({ summary: 'List system audit logs' })
  async listAuditLogs(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('organizationId') organizationId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.adminService.listAuditLogs({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      action,
      userId,
      organizationId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });
    return { message: 'Audit logs fetched.', data };
  }
}
