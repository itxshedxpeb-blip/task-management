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

    if (user.userType !== 'SUPER_ADMIN') {
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
      totalEmployees,
      totalUsers,
      activeTasks,
      recentRegistrations,
      totalDepartments,
      completedTasks,
      completedOnTime,
      completedLate,
      overdueTasks,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true, userType: 'EMPLOYEE' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.task.count({
        where: {
          isDeleted: false,
          status: { in: ['Draft', 'Todo', 'InProgress', 'OnHold'] },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.department.count({ where: { isDeleted: false } }),
      this.prisma.task.count({
        where: {
          isDeleted: false,
          status: { in: ['Completed', 'Archived'] },
        },
      }),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::int as count FROM "Task"
        WHERE "isDeleted" = false
          AND "status" IN ('Completed', 'Archived')
          AND "completedAt" IS NOT NULL
          AND "completedAt" <= "dueDate"
      `.then((r) => Number(r[0]?.count ?? 0)),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::int as count FROM "Task"
        WHERE "isDeleted" = false
          AND "status" IN ('Completed', 'Archived')
          AND "completedAt" IS NOT NULL
          AND "completedAt" > "dueDate"
      `.then((r) => Number(r[0]?.count ?? 0)),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::int as count FROM "Task"
        WHERE "isDeleted" = false
          AND "status" NOT IN ('Completed', 'Archived', 'Cancelled')
          AND "dueDate" < NOW()
      `.then((r) => Number(r[0]?.count ?? 0)),
    ]);

    return {
      totalEmployees,
      totalUsers,
      activeTasks,
      recentRegistrations,
      totalDepartments,
      completedTasks,
      completedOnTime,
      completedLate,
      overdueTasks,
    };
  }

  async listUsers(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      page = 1,
      pageSize = 25,
      search,
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
          createdAt: true,
          lastLogin: true,
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
        isActive: true,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
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
        createdAt: true,
        lastLogin: true,
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

  async getReports() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTasks,
      completedTasks,
      activeEmployees,
      tasksByStatus,
      tasksByPriority,
      topEmployees,
    ] = await Promise.all([
      this.prisma.task.count({ where: { isDeleted: false } }),
      this.prisma.task.count({
                where: { isDeleted: false, status: { in: ['Completed', 'Archived'] } },
      }),
      this.prisma.user.count({ where: { isActive: true, userType: 'EMPLOYEE' } }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: true,
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where: { isDeleted: false },
        _count: true,
      }),
      this.prisma.user.findMany({
        where: { isActive: true, userType: 'EMPLOYEE' },
        select: {
          id: true,
          name: true,
          isActive: true,
          _count: {
            select: {
              assignedTasks: {
        where: { isDeleted: false, status: { in: ['Completed', 'Archived'] } },
              },
            },
          },
        },
        orderBy: { assignedTasks: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    const tasksByStatusMap: Record<string, number> = {};
    tasksByStatus.forEach((s: any) => { tasksByStatusMap[s.status] = s._count; });

    const tasksByPriorityMap: Record<string, number> = {};
    tasksByPriority.forEach((p: any) => { tasksByPriorityMap[p.priority] = p._count; });

    const topEmployeesData = topEmployees.map((emp: any) => {
      const completed = emp._count.assignedTasks;
      const totalAssigned = completed;
      return {
        id: emp.id,
        name: emp.name,
        completedTasks: completed,
        completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
        isActive: emp.isActive,
      };
    });

    return {
      totalTasks,
      completedTasks,
      activeEmployees,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByStatus: tasksByStatusMap,
      tasksByPriority: tasksByPriorityMap,
      topEmployees: topEmployeesData,
    };
  }

  async listAuditLogs(query: {
    page?: number;
    pageSize?: number;
    action?: string;
    userId?: string;
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
