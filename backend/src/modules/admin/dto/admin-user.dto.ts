import { IsEmail, IsString, IsOptional, IsEnum, MinLength, MaxLength, IsBoolean } from 'class-validator';

export enum AdminUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum AdminUserType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export class AdminCreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(AdminUserRole)
  role?: AdminUserRole;

  @IsOptional()
  @IsEnum(AdminUserType)
  userType?: AdminUserType;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(AdminUserRole)
  role?: AdminUserRole;

  @IsOptional()
  @IsEnum(AdminUserType)
  userType?: AdminUserType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
