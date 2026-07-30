import { IsString, IsInt, IsOptional, IsBoolean, IsNotEmpty, Max, Min } from 'class-validator';

export class UploadApkDto {
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @IsInt()
  @Min(1)
  versionCode: number;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsInt()
  @Min(1)
  @Max(100 * 1024 * 1024) // Max 100MB
  fileSize: number;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsString()
  @IsOptional()
  releaseNotes?: string;

  @IsString()
  @IsOptional()
  minimumSupportedVersion?: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isLatest?: boolean;

  @IsString()
  @IsNotEmpty()
  uploadedBy: string;

  @IsString()
  @IsNotEmpty()
  uploadedByName: string;
}
