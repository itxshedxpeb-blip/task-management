import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.userType !== 'SYSTEM_ADMIN') {
      throw new UnauthorizedException('Access denied. Not a system administrator.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      userType: user.userType,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType,
      },
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCompanies,
      totalUsers,
      activeTasks,
      recentRegistrations,
      suspendedCompanies,
      totalDepartments,
      totalTeams,
    ] = await Promise.all([
      this.prisma.organization.count({ where: { isDeleted: false } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.task.count({
        where: {
          isDeleted: false,
          status: { in: ['Todo', 'InProgress', 'Reopened'] },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.organization.count({
        where: { isDeleted: false, status: 'Suspended' },
      }),
      this.prisma.department.count({ where: { isDeleted: false } }),
      this.prisma.team.count({ where: { isDeleted: false } }),
    ]);

    return {
      totalCompanies,
      totalUsers,
      activeTasks,
      recentRegistrations,
      suspendedCompanies,
      totalDepartments,
      totalTeams,
    };
  }

  async listOrganizations(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      page = 1,
      pageSize = 25,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [rows, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { users: true, tasks: true } } },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrevious: page > 1,
      },
    };
  }

  async createOrganization(data: {
    name: string;
    email?: string;
    slug?: string;
    maxUsers?: number;
    maxStorageGb?: number;
    subscriptionTier?: string;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');

    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException('Organization with this slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        name: data.name,
        email: data.email,
        slug,
        maxUsers: data.maxUsers || 25,
        maxStorageGb: data.maxStorageGb || 10,
        subscriptionTier: data.subscriptionTier || 'free',
      },
    });
  }

  async getOrganization(id: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id, isDeleted: false },
      include: { _count: { select: { users: true, tasks: true, departments: true, teams: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateOrganization(
    id: string,
    data: {
      name?: string;
      email?: string;
      maxUsers?: number;
      maxStorageGb?: number;
      subscriptionTier?: string;
      status?: string;
    },
  ) {
    await this.getOrganization(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...data };
    if (data.status) {
      updateData.status = data.status as any;
    }
    return this.prisma.organization.update({ where: { id }, data: updateData });
  }

  async deleteOrganization(id: string) {
    await this.getOrganization(id);
    return this.prisma.organization.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async suspendOrganization(id: string) {
    await this.getOrganization(id);
    return this.prisma.organization.update({
      where: { id },
      data: { status: 'Suspended' },
    });
  }

  async listUsers(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    organizationId?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      page = 1,
      pageSize = 25,
      search,
      organizationId,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (role) {
      where.role = role;
    }

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          userType: true,
          isActive: true,
          isVerified: true,
          organizationId: true,
          createdAt: true,
          lastLogin: true,
          organization: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrevious: page > 1,
      },
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
    userType?: string;
    organizationId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name || data.email.split('@')[0],
        password: passwordHash,
        role: (data.role as any) || 'EMPLOYEE',
        userType: (data.userType as any) || 'EMPLOYEE',
        organizationId: data.organizationId,
        isActive: true,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        isActive: true,
        isVerified: true,
        organizationId: true,
        createdAt: true,
        lastLogin: true,
        organization: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      role?: string;
      userType?: string;
      isActive?: boolean;
      organizationId?: string;
    },
  ) {
    await this.getUser(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role as any,
        userType: data.userType as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    await this.getUser(id);
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return { id };
  }

  async listAuditLogs(query: {
    page?: number;
    pageSize?: number;
    action?: string;
    userId?: string;
    organizationId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      page = 1,
      pageSize = 25,
      action,
      userId,
      organizationId,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (organizationId) where.organizationId = organizationId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrevious: page > 1,
      },
    };
  }
}
