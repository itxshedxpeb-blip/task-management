import { IsString, IsOptional, IsObject, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateAutomationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  trigger: string;

  @IsObject()
  conditions: Record<string, any>;

  @IsObject()
  actions: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
