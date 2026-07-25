import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanySettings(organizationId: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id: organizationId, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        gstNumber: true,
        panNumber: true,
        website: true,
        logo: true,
        settings: true,
        maxUsers: true,
        maxStorageGb: true,
        subscriptionTier: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateCompanySettings(
    organizationId: string,
    data: {
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
    const org = await this.prisma.organization.findFirst({
      where: { id: organizationId, isDeleted: false },
    });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        website: data.website,
        logo: data.logo,
        settings: data.settings,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        gstNumber: true,
        panNumber: true,
        website: true,
        logo: true,
        settings: true,
      },
    });
  }

  async getSystemPrefs(organizationId: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id: organizationId, isDeleted: false },
      select: {
        settings: true,
        maxUsers: true,
        maxStorageGb: true,
        subscriptionTier: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');

    return {
      settings: org.settings || {},
      maxUsers: org.maxUsers,
      maxStorageGb: org.maxStorageGb,
      subscriptionTier: org.subscriptionTier,
    };
  }

  async updateSystemPrefs(
    organizationId: string,
    data: {
      settings?: Record<string, any>;
      maxUsers?: number;
      maxStorageGb?: number;
      subscriptionTier?: string;
    },
  ) {
    const org = await this.prisma.organization.findFirst({
      where: { id: organizationId, isDeleted: false },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const updateData: any = {};
    if (data.settings !== undefined) updateData.settings = data.settings;
    if (data.maxUsers !== undefined) updateData.maxUsers = data.maxUsers;
    if (data.maxStorageGb !== undefined) updateData.maxStorageGb = data.maxStorageGb;
    if (data.subscriptionTier !== undefined) updateData.subscriptionTier = data.subscriptionTier;

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        settings: true,
        maxUsers: true,
        maxStorageGb: true,
        subscriptionTier: true,
      },
    });
  }
}
