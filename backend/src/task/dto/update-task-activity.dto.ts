import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ActivityTypeFilter } from './create-task-activity.dto';

export class UpdateTaskActivityDto {
  @IsOptional()
  @IsEnum(ActivityTypeFilter)
  activityType?: ActivityTypeFilter;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nextFollowUpDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  nextFollowUpTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  nextFollowUpAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;
}
