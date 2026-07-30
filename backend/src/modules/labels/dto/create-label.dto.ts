import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}
