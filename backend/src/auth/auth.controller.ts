import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/auth-extended.dto';
import { Public } from './decorators/public.decorator';
import { CookieInterceptor } from './cookie.interceptor';

interface RequestWithUser extends FastifyRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    sessionId: string;
  };
}

const AUTH_STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private refreshFromCookie(req: FastifyRequest): string | undefined {
    return req.cookies?.refreshToken || (req as any).cookies?.['refreshToken'];
  }

  @Public()
  @Throttle(AUTH_STRICT)
  @Post('register')
  @UseInterceptors(CookieInterceptor)
  @ApiOperation({ summary: 'Register a new account' })
  register(@Body() dto: RegisterDto, @Req() req: FastifyRequest) {
    return this.authService.register(dto, req.requestId);
  }

  @Public()
  @Throttle(AUTH_STRICT)
  @Post('login')
  @UseInterceptors(CookieInterceptor)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    return this.authService.login(dto, req.ip, req.headers['user-agent'] as string);
  }

  @Public()
  @SkipThrottle()
  @Post('refresh')
  @UseInterceptors(CookieInterceptor)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Req() req: FastifyRequest) {
    const refreshToken = this.refreshFromCookie(req);
    if (!refreshToken) throw new UnauthorizedException('Refresh token not found');
    return this.authService.refresh(refreshToken, req.ip, req.headers['user-agent'] as string);
  }

  @SkipThrottle()
  @Post('logout')
  @UseInterceptors(CookieInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke session' })
  async logout(@Req() req: RequestWithUser) {
    if (req.user?.sessionId) {
      await this.authService.logout(
        req.user.sessionId,
        req.user.id,
        req.ip,
        req.headers['user-agent'] as string,
      );
    }
    return { message: 'Logged out successfully.', clearRefreshCookie: true };
  }

  @Post('revoke-all-sessions')
  @UseInterceptors(CookieInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all devices' })
  async revokeAll(@Req() req: RequestWithUser) {
    await this.authService.revokeAllSessions(
      req.user.id,
      req.user.sessionId,
      req.ip,
      req.headers['user-agent'] as string,
    );
    return { message: 'All sessions have been revoked.', clearRefreshCookie: true };
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto,
      req.ip,
      req.headers['user-agent'] as string,
    );
  }

  @SkipThrottle()
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: RequestWithUser) {
    return this.authService.getProfile(req.user.id);
  }
}
