import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum ErrorSource {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
}

export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

export class ReportErrorDto {
  @IsOptional()
  @IsEnum(ErrorSource)
  source?: ErrorSource;

  @IsOptional()
  @IsEnum(ErrorLevel)
  level?: ErrorLevel;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16000)
  stackTrace?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  method?: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ErrorLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsEnum(ErrorSource)
  source?: ErrorSource;

  @IsOptional()
  @IsEnum(ErrorLevel)
  level?: ErrorLevel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
