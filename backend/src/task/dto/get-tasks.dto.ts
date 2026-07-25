import {
  IsOptional,
  IsInt,
  IsString,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskStatusFilter {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Blocked = 'Blocked',
  Review = 'Review',
  Completed = 'Completed',
  Verified = 'Verified',
  Rejected = 'Rejected',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  Reopened = 'Reopened',
}

export enum TaskPriorityFilter {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum TaskCategoryFilter {
  General = 'General',
  Office = 'Office',
  FieldWork = 'FieldWork',
  Maintenance = 'Maintenance',
  Installation = 'Installation',
  Inspection = 'Inspection',
  Documentation = 'Documentation',
  Meeting = 'Meeting',
  Training = 'Training',
  Other = 'Other',
}

export class GetTasksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  pageSize?: number = 25;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatusFilter)
  status?: TaskStatusFilter;

  @IsOptional()
  @IsEnum(TaskPriorityFilter)
  priority?: TaskPriorityFilter;

  @IsOptional()
  @IsEnum(TaskCategoryFilter)
  category?: TaskCategoryFilter;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  dueDateFrom?: string;

  @IsOptional()
  @IsString()
  dueDateTo?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
