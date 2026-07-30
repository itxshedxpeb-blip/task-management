import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { AppVersionService } from './app-version.service';
import { Public } from '../../auth/decorators/public.decorator';
import { UploadApkDto } from './dto/upload-apk.dto';

@ApiTags('app-version')
@Controller('app-version')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppVersionController {
  constructor(private readonly appVersionService: AppVersionService) {}

  @Public()
  @Get('latest/:platform')
  @ApiOperation({ summary: 'Get latest app version for platform' })
  async getLatestVersion(@Param('platform') platform: string) {
    const sanitizedPlatform = platform.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
    const version = await this.appVersionService.getLatestVersion(sanitizedPlatform);
    
    if (!version) {
      throw new BadRequestException('No version found for this platform');
    }
    
    return { data: version };
  }

  @Public()
  @Get('download/:platform')
  @ApiOperation({ summary: 'Download APK for platform' })
  async downloadApk(@Param('platform') platform: string, @Res() res: Response) {
    const sanitizedPlatform = platform.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
    const { data, fileName, fileType } = await this.appVersionService.getApkBinary(sanitizedPlatform);

    res.setHeader('Content-Type', fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', data.length);
    
    return res.send(data);
  }

  @Post('upload')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace APK (Admin only)' })
  async uploadApk(@Request() req: any) {
    const user = req.user;
    const data = await req.file();
    
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    // Read file into memory
    const fileBuffer = Buffer.from(await data.file.toBuffer());

    const versionName = data.fields.versionName?.value;
    const versionCode = parseInt(data.fields.versionCode?.value);
    const platform = data.fields.platform?.value || 'ANDROID';
    const releaseNotes = data.fields.releaseNotes?.value;
    const minimumSupportedVersion = data.fields.minimumSupportedVersion?.value;
    const isMandatory = data.fields.isMandatory?.value === 'true';

    if (!versionName || !versionCode) {
      throw new BadRequestException('versionName and versionCode are required');
    }

    const dto: UploadApkDto = {
      versionName,
      versionCode,
      platform,
      fileName: data.filename,
      fileSize: data.file.size,
      fileType: data.mimetype,
      releaseNotes,
      minimumSupportedVersion,
      isMandatory,
      isLatest: true,
      uploadedBy: user.id || 'admin',
      uploadedByName: user.name || 'Admin',
    };

    const version = await this.appVersionService.uploadOrReplaceApk(dto, fileBuffer);

    return { data: version };
  }

  @Patch(':platform')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update app version metadata (Admin only)' })
  async updateVersion(
    @Param('platform') platform: string,
    @Body() body: {
      releaseNotes?: string;
      isMandatory?: boolean;
      isActive?: boolean;
    },
  ) {
    const sanitizedPlatform = platform.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
    const version = await this.appVersionService.updateVersion(sanitizedPlatform, body);
    return { data: version };
  }

  @Delete(':platform')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete APK (Admin only)' })
  async deleteApk(@Param('platform') platform: string) {
    const sanitizedPlatform = platform.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
    await this.appVersionService.deleteApk(sanitizedPlatform);
    return { message: 'APK deleted successfully' };
  }
}
