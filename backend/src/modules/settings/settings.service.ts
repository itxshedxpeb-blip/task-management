import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  async getSystemSettings() {
    return {
      companyName: 'TaskFlow',
      supportEmail: '',
      website: '',
      primaryColor: '#0F766E',
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
