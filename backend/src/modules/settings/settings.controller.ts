import {
  Controller,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get system settings' })
  async getSettings() {
    const data = await this.settingsService.getSystemSettings();
    return { message: 'Settings fetched.', data };
  }

  @Patch()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(
    @Body() body: {
      companyName?: string;
      supportEmail?: string;
      website?: string;
      primaryColor?: string;
    },
  ) {
    const data = await this.settingsService.updateSystemSettings(body);
    return { message: 'Settings updated.', data };
  }
}
