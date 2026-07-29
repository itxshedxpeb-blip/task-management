import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/auth-extended.dto';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AuditService } from './services/audit.service';
import { LoginProtectionService } from './services/login-protection.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private tokenService: TokenService,
    private sessionService: SessionService,
    private auditService: AuditService,
    private loginProtection: LoginProtectionService,
  ) {}

  private bcryptRounds() {
    return this.config.get<number>('security.bcryptRounds') || 12;
  }

  private accessExpiresSeconds() {
    const raw = this.config.get<string>('jwt.expiresIn') || '30m';
    if (raw.endsWith('m')) return parseInt(raw, 10) * 60;
    if (raw.endsWith('h')) return parseInt(raw, 10) * 3600;
    if (raw.endsWith('d')) return parseInt(raw, 10) * 86400;
    return parseInt(raw, 10) || 1800;
  }

  private refreshExpiryDays(rememberMe: boolean) {
    return rememberMe
      ? this.config.get<number>('session.rememberMeDays') || 30
      : this.config.get<number>('session.absoluteDays') || 1;
  }

  private async issueSessionTokens(
    user: { id: string; email: string; name?: string | null; role: string; userType: string; passwordVersion: number },
    opts: {
      ipAddress?: string;
      userAgent?: string;
      rememberMe?: boolean;
      auditAction?: string;
      auditMeta?: Record<string, unknown>;
    },
  ) {
    const device = opts.userAgent?.split(' ')[0];
    const browser = this.parseBrowser(opts.userAgent);
    const os = this.parseOS(opts.userAgent);

    const session = await this.sessionService.createSession({
      userId: user.id,
      device,
      browser,
      os,
      ipAddress: opts.ipAddress,
      userAgent: opts.userAgent,
      isRememberMe: opts.rememberMe || false,
    });

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
      passwordVersion: user.passwordVersion,
    });

    const refresh = this.tokenService.generateRefreshToken();
    const days = this.refreshExpiryDays(!!opts.rememberMe);
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refresh.hash,
        sessionId: session.id,
        userId: user.id,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
    });
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: refresh.hash },
    });

    await this.auditService.log({
      action: opts.auditAction || 'LOGIN',
      userId: user.id,
      sessionId: session.id,
      ipAddress: opts.ipAddress,
      userAgent: opts.userAgent,
      metadata: opts.auditMeta || { device, browser, os, rememberMe: opts.rememberMe },
    });

    return {
      message: 'Authenticated successfully.',
      accessToken,
      refreshToken: refresh.token,
      sessionId: session.id,
      expiresIn: this.accessExpiresSeconds(),
      rememberMe: opts.rememberMe || false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType,
      },
    };
  }

  async register(dto: RegisterDto, requestId?: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds());
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name || email.split('@')[0],
        password: passwordHash,
        role: 'EMPLOYEE',
        userType: 'EMPLOYEE',
        isVerified: true,
        isActive: true,
        passwordHistory: JSON.stringify([
          { password: passwordHash, changedAt: new Date().toISOString() },
        ]),
      },
    });

    await this.auditService.log({
      action: 'auth.register',
      userId: user.id,
      metadata: { email },
    });

    return this.issueSessionTokens(user, {
      auditAction: 'REGISTER',
      auditMeta: { method: 'direct' },
    });
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const email = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.loginProtection.recordAttempt({
        email,
        success: false,
        failureReason: 'User not found',
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const lockStatus = await this.loginProtection.isLocked(email);
    if (lockStatus.locked) {
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        userId: user.id,
        ipAddress,
        userAgent,
        metadata: { reason: 'Account locked', lockedUntil: lockStatus.lockedUntil },
      });
      throw new ForbiddenException('Account is temporarily locked. Try again later.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active. Contact your administrator.');
    }
    if (user.isLocked)
      throw new ForbiddenException('Account has been locked. Contact your administrator.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      await this.loginProtection.recordAttempt({
        email,
        success: false,
        failureReason: 'Invalid password',
        ipAddress,
        userAgent,
      });
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        userId: user.id,
        ipAddress,
        userAgent,
        metadata: { reason: 'Invalid password' },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.loginProtection.recordAttempt({
      email,
      success: true,
      ipAddress,
      userAgent,
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), failedLoginAttempts: 0, lockedUntil: null },
    });

    return this.issueSessionTokens(user, {
      ipAddress,
      userAgent,
      rememberMe: dto.rememberMe || false,
    });
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true, user: true },
    });

    if (!storedToken) throw new UnauthorizedException('Invalid refresh token');

    if (storedToken.isRevoked) {
      const graceMs = parseInt(process.env.REFRESH_REUSE_GRACE_MS || '10000', 10);
      const revokedRecently =
        storedToken.revokedAt &&
        Date.now() - storedToken.revokedAt.getTime() < graceMs &&
        storedToken.replacedByTokenHash;

      if (revokedRecently && storedToken.replacedByTokenHash) {
        const current = await this.prisma.refreshToken.findUnique({
          where: { tokenHash: storedToken.replacedByTokenHash },
          include: { session: true, user: true },
        });
        if (
          current &&
          !current.isRevoked &&
          current.sessionId === storedToken.sessionId &&
          !current.session.isRevoked &&
          new Date() <= current.session.expiresAt &&
          new Date() <= current.session.idleExpiresAt
        ) {
          return this.issueRotatedRefresh(current, ipAddress, userAgent);
        }
        throw new UnauthorizedException(
          'Refresh token already rotated. Retry with the latest token.',
        );
      }

      if (storedToken.replacedByTokenHash) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      await this.sessionService.revokeAllUserSessions(storedToken.userId);
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    if (new Date() > storedToken.expiresAt)
      throw new UnauthorizedException('Refresh token has expired');
    if (storedToken.session.isRevoked) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true, revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session has been revoked');
    }
    if (
      new Date() > storedToken.session.expiresAt ||
      new Date() > storedToken.session.idleExpiresAt
    ) {
      await this.sessionService.revokeSession(storedToken.sessionId);
      throw new UnauthorizedException('Session has expired');
    }

    return this.issueRotatedRefresh(storedToken, ipAddress, userAgent);
  }

  private async issueRotatedRefresh(
    storedToken: {
      id: string;
      sessionId: string;
      userId: string;
      session: { isRememberMe: boolean };
      user: { id: string; email: string; role: string; passwordVersion: number };
    },
    ipAddress?: string,
    userAgent?: string,
  ) {
    const newRefresh = this.tokenService.generateRefreshToken();
    const days = this.refreshExpiryDays(storedToken.session.isRememberMe);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true, revokedAt: new Date(), replacedByTokenHash: newRefresh.hash },
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: newRefresh.hash,
          sessionId: storedToken.sessionId,
          userId: storedToken.userId,
          expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        },
      }),
      this.prisma.session.update({
        where: { id: storedToken.sessionId },
        data: { refreshToken: newRefresh.hash, lastActivity: new Date() },
      }),
    ]);

    await this.sessionService.touchSession(storedToken.sessionId);

    const accessToken = this.tokenService.generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      sessionId: storedToken.sessionId,
      passwordVersion: storedToken.user.passwordVersion,
    });

    await this.auditService.log({
      action: 'REFRESH',
      userId: storedToken.userId,
      sessionId: storedToken.sessionId,
      ipAddress,
      userAgent,
    });

    return {
      message: 'Token refreshed successfully.',
      accessToken,
      refreshToken: newRefresh.token,
      sessionId: storedToken.sessionId,
      expiresIn: this.accessExpiresSeconds(),
      rememberMe: storedToken.session.isRememberMe,
    };
  }

  async logout(sessionId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await this.sessionService.revokeSession(sessionId);
    await this.auditService.log({ action: 'LOGOUT', userId, sessionId, ipAddress, userAgent });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string, ip?: string, ua?: string) {
    await this.sessionService.revokeAllUserSessions(userId, exceptSessionId);
    await this.auditService.log({
      action: 'auth.revoke-all-sessions',
      userId,
      sessionId: exceptSessionId,
      ipAddress: ip,
      userAgent: ua,
    });
    return { message: 'All sessions have been revoked.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        department: true,
        designation: true,
        role: true,
        userType: true,
        isActive: true,
        isLocked: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto, ip?: string, ua?: string) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new BadRequestException('Current password is incorrect');

    await this.ensurePasswordNotReused(user, dto.newPassword);
    const passwordHash = await bcrypt.hash(dto.newPassword, this.bcryptRounds());
    const newVersion = user.passwordVersion + 1;
    const history = this.pushPasswordHistory(user.passwordHistory, passwordHash);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        passwordVersion: newVersion,
        passwordHistory: JSON.stringify(history),
      },
    });

    await this.sessionService.revokeAllUserSessions(userId);
    await this.auditService.log({
      action: 'PASSWORD_CHANGE',
      userId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { method: 'change_password' },
    });

    return { message: 'Password changed successfully. Please sign in again.' };
  }

  private async ensurePasswordNotReused(user: { passwordHistory: unknown }, newPassword: string) {
    if (!user.passwordHistory) return;
    const history: Array<{ password: string }> =
      typeof user.passwordHistory === 'string'
        ? JSON.parse(user.passwordHistory as string)
        : (user.passwordHistory as Array<{ password: string }>);
    for (const entry of history || []) {
      if (await bcrypt.compare(newPassword, entry.password)) {
        throw new BadRequestException('You cannot reuse a recent password');
      }
    }
  }

  private pushPasswordHistory(existing: unknown, passwordHash: string) {
    const size = this.config.get<number>('security.passwordHistorySize') || 10;
    const history: Array<{ password: string; changedAt: string }> = existing
      ? typeof existing === 'string'
        ? JSON.parse(existing)
        : (existing as Array<{ password: string; changedAt: string }>)
      : [];
    history.push({ password: passwordHash, changedAt: new Date().toISOString() });
    while (history.length > size) history.shift();
    return history;
  }

  private parseBrowser(ua?: string): string | undefined {
    if (!ua) return undefined;
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private parseOS(ua?: string): string | undefined {
    if (!ua) return undefined;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown';
  }
}
