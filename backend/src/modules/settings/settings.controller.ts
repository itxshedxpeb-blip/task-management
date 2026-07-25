import {
  Controller,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get current org settings' })
  async getCompanySettings(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.settingsService.getCompanySettings(organizationId);
    return { message: 'Company settings fetched.', data };
  }

  @Patch('company')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update org settings' })
  async updateCompanySettings(
    @CurrentUser('organizationId') organizationId: string,
    @Body() body: {
      name?: string;
      email?: string;
      mobile?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
      gstNumber?: string;
      panNumber?: string;
      website?: string;
      logo?: string;
      settings?: Record<string, any>;
    },
  ) {
    const data = await this.settingsService.updateCompanySettings(organizationId, body);
    return { message: 'Company settings updated.', data };
  }

  @Get('system-prefs')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get system preferences' })
  async getSystemPrefs(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.settingsService.getSystemPrefs(organizationId);
    return { message: 'System preferences fetched.', data };
  }

  @Patch('system-prefs')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update system preferences' })
  async updateSystemPrefs(
    @CurrentUser('organizationId') organizationId: string,
    @Body() body: {
      settings?: Record<string, any>;
      maxUsers?: number;
      maxStorageGb?: number;
      subscriptionTier?: string;
    },
  ) {
    const data = await this.settingsService.updateSystemPrefs(organizationId, body);
    return { message: 'System preferences updated.', data };
  }
}
