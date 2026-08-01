import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TaskPriorityFilter,
  TaskCategoryFilter,
} from './get-tasks.dto';

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @IsOptional()
  @IsEnum(TaskPriorityFilter)
  priority?: TaskPriorityFilter;

  @IsOptional()
  @IsEnum(TaskCategoryFilter)
  category?: TaskCategoryFilter;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  estimatedHours?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @IsOptional()
  @IsDateString()
  slaDueDate?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  // Self-assignment for employees, admin can assign to others
}

// Add validation pipe logging
export class CreateTaskDtoValidationPipe {
  transform(value: any) {
    console.log('[CreateTaskDtoValidationPipe] Incoming DTO:', {
      title: value?.title,
      assignedUserId: value?.assignedUserId,
      priority: value?.priority,
    });
    return value;
  }
}
