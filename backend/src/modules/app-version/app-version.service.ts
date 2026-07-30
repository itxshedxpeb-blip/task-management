import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AppVersion } from '@prisma/client';
import { UploadApkDto } from './dto/upload-apk.dto';
import { AppVersionResponseDto } from './dto/app-version-response.dto';

@Injectable()
export class AppVersionService {
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly ALLOWED_EXTENSIONS = ['apk', 'aab'];
  private readonly ALLOWED_MIME_TYPES = [
    'application/vnd.android.package-archive',
    'application/octet-stream',
    'application/zip',
    'application/x-apk',
    'application/x-zip-compressed',
  ];

  constructor(private prisma: PrismaService) {}

  private validateFile(fileName: string, fileSize: number, mimeType: string): void {
    // Validate file size
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validate file extension
    const extension = fileName.toLowerCase().split('.').pop();
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(`Invalid file extension. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`);
    }

    // Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(`Invalid file type. Allowed: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
    }
  }

  private validateVersion(versionName: string, versionCode: number): void {
    // Validate version format (semantic versioning)
    if (!/^\d+\.\d+\.\d+$/.test(versionName)) {
      throw new BadRequestException('versionName must follow semantic versioning (e.g., 1.0.0)');
    }

    // Validate version code is positive
    if (versionCode <= 0) {
      throw new BadRequestException('versionCode must be a positive integer');
    }
  }

  private validatePlatform(platform: string): void {
    const validPlatforms = ['ANDROID', 'IOS'];
    if (!validPlatforms.includes(platform.toUpperCase())) {
      throw new BadRequestException(`platform must be one of: ${validPlatforms.join(', ')}`);
    }
  }

  async uploadOrReplaceApk(
    dto: UploadApkDto,
    apkData: Buffer,
  ): Promise<AppVersionResponseDto> {
    this.validateVersion(dto.versionName, dto.versionCode);
    this.validatePlatform(dto.platform);
    this.validateFile(dto.fileName, dto.fileSize, dto.fileType);

    const platform = dto.platform.toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      // Delete existing version for this platform if it exists
      await tx.appVersion.deleteMany({
        where: { platform },
      });

      // Create new version
      const version = await tx.appVersion.create({
        data: {
          versionName: dto.versionName,
          versionCode: dto.versionCode,
          platform,
          fileName: dto.fileName,
          apkData: new Uint8Array(apkData),
          fileSize: dto.fileSize,
          fileType: dto.fileType,
          releaseNotes: dto.releaseNotes,
          minimumSupportedVersion: dto.minimumSupportedVersion,
          isLatest: true,
          isMandatory: dto.isMandatory || false,
          isActive: true,
          downloadCount: 0,
          uploadedBy: dto.uploadedBy,
          uploadedByName: dto.uploadedByName,
        },
      });

      return this.toResponseDto(version);
    });
  }

  async getLatestVersion(platform: string): Promise<AppVersionResponseDto | null> {
    const platformUpper = platform.toUpperCase();
    this.validatePlatform(platformUpper);

    const version = await this.prisma.appVersion.findFirst({
      where: {
        platform: platformUpper,
        isLatest: true,
        isActive: true,
        apkData: { not: null },
      },
    });

    if (!version) {
      return null;
    }

    return this.toResponseDto(version);
  }

  async getApkBinary(platform: string): Promise<{ data: Buffer; fileName: string; fileType: string }> {
    const platformUpper = platform.toUpperCase();
    this.validatePlatform(platformUpper);

    const version = await this.prisma.appVersion.findFirst({
      where: {
        platform: platformUpper,
        isLatest: true,
        isActive: true,
        apkData: { not: null },
      },
    });

    if (!version || !version.apkData) {
      throw new NotFoundException('No APK available for this platform');
    }

    // Convert Bytes to Buffer
    const apkBuffer = Buffer.from(version.apkData);

    // Increment download count
    await this.prisma.appVersion.update({
      where: { id: version.id },
      data: { downloadCount: { increment: 1 } },
    });

    return {
      data: apkBuffer,
      fileName: version.fileName,
      fileType: version.fileType,
    };
  }

  async updateVersion(
    platform: string,
    data: {
      releaseNotes?: string;
      isMandatory?: boolean;
      isActive?: boolean;
    },
  ): Promise<AppVersionResponseDto> {
    const platformUpper = platform.toUpperCase();
    this.validatePlatform(platformUpper);

    const version = await this.prisma.appVersion.findFirst({
      where: { platform: platformUpper },
    });

    if (!version) {
      throw new NotFoundException('No version found for this platform');
    }

    const updated = await this.prisma.appVersion.update({
      where: { id: version.id },
      data,
    });

    return this.toResponseDto(updated);
  }

  async deleteApk(platform: string): Promise<void> {
    const platformUpper = platform.toUpperCase();
    this.validatePlatform(platformUpper);

    const version = await this.prisma.appVersion.findFirst({
      where: { platform: platformUpper },
    });

    if (!version) {
      throw new NotFoundException('No version found for this platform');
    }

    await this.prisma.appVersion.delete({
      where: { id: version.id },
    });
  }

  private toResponseDto(version: AppVersion): AppVersionResponseDto {
    return {
      id: version.id,
      versionName: version.versionName,
      versionCode: version.versionCode,
      platform: version.platform,
      fileName: version.fileName,
      fileSize: version.fileSize,
      fileType: version.fileType,
      releaseNotes: version.releaseNotes,
      minimumSupportedVersion: version.minimumSupportedVersion,
      isLatest: version.isLatest,
      isMandatory: version.isMandatory,
      isActive: version.isActive,
      downloadCount: version.downloadCount,
      uploadedBy: version.uploadedBy,
      uploadedByName: version.uploadedByName,
      uploadedAt: version.uploadedAt,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
    };
  }
}
