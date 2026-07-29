import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SettingsService {
  constructor(private readonly config: ConfigService) {}

  async getSystemSettings() {
    const branding = this.config.get('branding');
    return {
      companyName: branding?.companyName || 'Task Manager',
      supportEmail: branding?.supportEmail || '',
      website: branding?.website || '',
      primaryColor: branding?.primaryColor || '#0F766E',
    };
  }

  async updateSystemSettings(data: {
    companyName?: string;
    supportEmail?: string;
    website?: string;
    primaryColor?: string;
  }) {
    return { message: 'System settings updated.', data };
  }
}
