import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsObject()
  defaults: Record<string, any>;
}
