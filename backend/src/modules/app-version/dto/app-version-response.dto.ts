export class AppVersionResponseDto {
  id: string;
  versionName: string;
  versionCode: number;
  platform: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  releaseNotes: string | null;
  minimumSupportedVersion: string | null;
  isLatest: boolean;
  isMandatory: boolean;
  isActive: boolean;
  downloadCount: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
