import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  role?: string;
}
