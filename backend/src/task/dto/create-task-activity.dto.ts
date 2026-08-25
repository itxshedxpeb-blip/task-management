import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum ActivityTypeFilter {
  TaskCreated = 'TaskCreated',
  Comment = 'Comment',
  ProgressUpdate = 'ProgressUpdate',
  FollowUp = 'FollowUp',
  IssueFound = 'IssueFound',
  WorkCompleted = 'WorkCompleted',
  StatusChanged = 'StatusChanged',
  AssignmentChanged = 'AssignmentChanged',
  DueDateChanged = 'DueDateChanged',
  PriorityChanged = 'PriorityChanged',
  InternalNote = 'InternalNote',
  FollowUpCompleted = 'FollowUpCompleted',
  TaskCompleted = 'TaskCompleted',
}

export class CreateTaskActivityDto {
  @IsEnum(ActivityTypeFilter)
  activityType: ActivityTypeFilter;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nextFollowUpDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @MaxLength(10)
  nextFollowUpTime?: string; // HH:mm

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  nextFollowUpAction?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string; // TaskStatus value

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number; // Task progress percentage (0-100)
}
