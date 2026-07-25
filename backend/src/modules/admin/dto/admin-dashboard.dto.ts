import { IsOptional, IsString } from 'class-validator';

export class AdminDashboardStatsDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
