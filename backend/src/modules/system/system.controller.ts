import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('system')
@Controller('system')
export class SystemController {
  @Public()
  @Get('capabilities')
  @ApiOperation({ summary: 'Get system capabilities' })
  async getCapabilities() {
    return {
      data: {
        version: '1.0.0',
        apiVersion: '1.0.0',
        modules: {
          tasks: true,
          auth: true,
          users: true,
          organizations: true,
          departments: true,
          teams: true,
          labels: true,
          notifications: true,
          automations: true,
          templates: true,
          calendar: true,
          reports: true,
          search: true,
          settings: true,
        },
        resources: [
          'tasks',
          'auth',
          'users',
          'organizations',
          'departments',
          'teams',
          'labels',
          'notifications',
          'automations',
          'templates',
          'calendar',
          'reports',
          'search',
          'settings',
        ],
      },
    };
  }
}
