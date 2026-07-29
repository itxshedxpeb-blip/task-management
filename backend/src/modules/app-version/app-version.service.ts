import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppVersion } from '@prisma/client';

@Injectable()
export class AppVersionService {
  constructor(private prisma: PrismaService) {}

  async createAppVersion(data: {
    version: string;
    platform: string;
    buildNumber: number;
    fileUrl: string;
    fileSize: number;
    fileName: string;
    fileType: string;
    releaseNotes?: string;
    uploadedBy: string;
    uploadedByName: string;
    isStable?: boolean;
  }): Promise<AppVersion> {
    // Check if version already exists
    const existing = await this.prisma.appVersion.findUnique({
      where: { version: data.version },
    });

    if (existing) {
      throw new BadRequestException(`Version ${data.version} already exists`);
    }
9
    // If this is marked as latest, unmark previous latest versions for this platform
    if (data.isStable !== false) {
      await this.prisma.appVersion.updateMany({
        where: { platform: data.platform, isLatest: true },
        data: { isLatest: false },
      });
    }

    return this.prisma.appVersion.create({
      data: {
        ...data,
        isLatest: data.isStable !== false,
      },
    });
  }

  async getAppVersions(platform?: string): Promise<AppVersion[]> {
    const where = platform ? { platform } : {};
    return this.prisma.appVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestVersion(platform: string): Promise<AppVersion | null> {
    return this.prisma.appVersion.findFirst({
      where: { platform, isLatest: true },
    });
  }

  async getAppVersion(id: string): Promise<AppVersion> {
    const version = await this.prisma.appVersion.findUnique({
      where: { id },
    });

    if (!version) {
      throw new NotFoundException('App version not found');
    }

    return version;
  }

  async incrementDownloadCount(id: string): Promise<AppVersion> {
    return this.prisma.appVersion.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
  }

  async deleteAppVersion(id: string): Promise<AppVersion> {
    const version = await this.getAppVersion(id);
    return this.prisma.appVersion.delete({
      where: { id },
    });
  }
}
