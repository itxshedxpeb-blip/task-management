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
  @ApiOperation({ summary: 'Get system-wide dashboard stats' })
  async getDashboardStats() {
    const data = await this.adminService.getDashboardStats();
    return { message: 'Dashboard stats fetched.', data };
  }

  @ApiBearerAuth()
  @Get('users')
  @RequirePermissions('admin:user:list')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const data = await this.adminService.listUsers({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      search,
      role,
      sortBy,
      sortOrder,
    });
    return { message: 'Users fetched.', data };
  }

  @ApiBearerAuth()
  @Post('users')
  @RequirePermissions('admin:user:create')
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() body: { email: string; password: string; name?: string; role?: string; userType?: string }) {
    const data = await this.adminService.createUser(body);
    return { message: 'User created successfully.', data };
  }

  @ApiBearerAuth()
  @Get('users/:id')
  @RequirePermissions('admin:user:read')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const data = await this.adminService.getUser(id);
    return { message: 'User fetched.', data };
  }

  @ApiBearerAuth()
  @Patch('users/:id')
  @RequirePermissions('admin:user:update')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: { name?: string; role?: string; userType?: string; isActive?: boolean },
  ) {
    const data = await this.adminService.updateUser(id, body);
    return { message: 'User updated.', data };
  }

  @ApiBearerAuth()
  @Delete('users/:id')
  @RequirePermissions('admin:user:delete')
  @ApiOperation({ summary: 'Soft delete user' })
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
    return { message: 'User deleted successfully.' };
  }

  @ApiBearerAuth()
  @Get('reports')
  @RequirePermissions('admin:dashboard')
  @ApiOperation({ summary: 'Get system reports and analytics' })
  async getReports() {
    const data = await this.adminService.getReports();
    return { message: 'Reports fetched.', data };
  }

  @ApiBearerAuth()
  @Get('audit-logs')
  @RequirePermissions('admin:audit:list')
  @ApiOperation({ summary: 'List system audit logs' })
  async listAuditLogs(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
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
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });
    return { message: 'Audit logs fetched.', data };
  }
}
