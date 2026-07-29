import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { AppVersionService } from './app-version.service';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('app-version')
@Controller('app-version')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all app versions' })
  async getAllVersions() {
    const versions = await this.appVersionService.getAppVersions();
    return { data: versions };
  }

  @Public()
  @Get('platform/:platform')
  @ApiOperation({ summary: 'Get app versions by platform' })
  async getVersionsByPlatform(@Param('platform') platform: string) {
    const versions = await this.appVersionService.getAppVersions(platform);
    return { data: versions };
  }

  @Public()
  @Get('latest/:platform')
  @ApiOperation({ summary: 'Get latest app version for platform' })
  async getLatestVersion(@Param('platform') platform: string) {
    const version = await this.appVersionService.getLatestVersion(platform);
    if (!version) {
      throw new BadRequestException('No version found for this platform');
    }
    return { data: version };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get specific app version' })
  async getVersion(@Param('id') id: string) {
    const version = await this.appVersionService.getAppVersion(id);
    return { data: version };
  }

  @Public()
  @Get(':id/download')
  @ApiOperation({ summary: 'Download app version (increments download count)' })
  async downloadVersion(@Param('id') id: string) {
    const version = await this.appVersionService.getAppVersion(id);
    await this.appVersionService.incrementDownloadCount(id);
    return {
      data: {
        downloadUrl: version.fileUrl,
        fileName: version.fileName,
        fileSize: version.fileSize,
        fileType: version.fileType,
      },
    };
  }

  @Post()
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create new app version (Admin only)' })
  async createVersion(@Body() body: {
    version: string;
    platform: string;
    buildNumber: number;
    fileUrl: string;
    fileSize: number;
    fileName: string;
    fileType: string;
    releaseNotes?: string;
    isStable?: boolean;
  }, @Request() req: any) {
    const user = req.user;
    const version = await this.appVersionService.createAppVersion({
      version: body.version,
      platform: body.platform,
      buildNumber: body.buildNumber,
      fileUrl: body.fileUrl,
      fileSize: body.fileSize,
      fileName: body.fileName,
      fileType: body.fileType,
      releaseNotes: body.releaseNotes,
      uploadedBy: user.id || 'admin',
      uploadedByName: user.name || 'Admin',
      isStable: body.isStable,
    });

    return { data: version };
  }

  @Delete(':id')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete app version (Admin only)' })
  async deleteVersion(@Param('id') id: string) {
    const version = await this.appVersionService.deleteAppVersion(id);
    return { data: version };
  }
}
