import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EmployeeListQueryDto,
  EmployeeTasksQueryDto,
} from './dto/employee-performance-query.dto';

const ACTIVE_STATUSES: TaskStatus[] = ['Todo', 'InProgress', 'OnHold'];
const OPEN_STATUSES: TaskStatus[] = ['Draft', 'Todo', 'InProgress', 'OnHold'];
const COMPLETED_STATUSES: TaskStatus[] = ['Completed', 'Archived'];

const PRIORITY_RANK: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  None: 0,
};

const WORKLOAD_WEIGHTS = {
  pending: 15,
  overdue: 25,
  dueToday: 10,
};

const NEW_EMPLOYEE_DAYS = 30;

const SORT_FIELDS: Record<string, string> = {
  createdAt: 'createdAt',
  dueDate: 'dueDate',
  completedAt: 'completedAt',
  priority: 'priority',
  progress: 'progress',
  title: 'title',
};

type TaskLight = {
  id: string;
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress?: number;
  createdAt: Date;
  dueDate: Date | null;
  completedAt: Date | null;
  assignedUserId: string | null;
};

export type WorkloadLevel = 'low' | 'medium' | 'high';
export type PerformanceBadge =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'Needs Attention'
  | 'Overloaded'
  | 'No Tasks';
export type CardTone = 'green' | 'orange' | 'red' | 'blue' | 'grey';

export interface EmployeeMetrics {
  statusCounts: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  activeTasks: number;
  overdueTasks: number;
  dueToday: number;
  dueThisWeek: number;
  dueThisMonth: number;
  cancelledTasks: number;
  rejectedTasks: number;
  completedToday: number;
  assignedToday: number;
  completionRate: number;
  avgCompletionHours: number;
  onTimeCompletionRate: number;
  currentTask: {
    id: string;
    taskId: number;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    progress: number;
    dueDate: Date | null;
  } | null;
  highestPriorityTask: {
    id: string;
    taskId: number;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    progress: number;
    dueDate: Date | null;
  } | null;
  lastCompletedTask: {
    id: string;
    taskId: number;
    title: string;
    priority: TaskPriority;
    completedAt: Date;
  } | null;
  workloadScore: number;
  workloadLevel: WorkloadLevel;
  performanceBadge: PerformanceBadge;
  cardTone: CardTone;
  productivityScore: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysAgo(days: number, from = new Date()): Date {
  return new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
}

function isNewEmployee(createdAt: Date, now: Date): boolean {
  return createdAt.getTime() >= daysAgo(NEW_EMPLOYEE_DAYS, now).getTime();
}

@Injectable()
export class EmployeePerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeList(query: EmployeeListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 12, 100);
    const skip = (page - 1) * pageSize;
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.UserWhereInput = { userType: 'EMPLOYEE' };
    const search = query.search?.trim();
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;
    if (query.role) where.role = query.role as Prisma.UserWhereInput['role'];
    if (query.department) {
      where.department = { contains: query.department.trim(), mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy:
          query.sortBy === 'name'
            ? { name: sortOrder }
            : { createdAt: sortOrder },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          userType: true,
          isActive: true,
          employeeId: true,
          department: true,
          designation: true,
          phone: true,
          joiningDate: true,
          createdAt: true,
          lastLogin: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const rows = await this.attachMetrics(users);

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

  async getEmployeePerformance(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, userType: 'EMPLOYEE' },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        userType: true,
        isActive: true,
        isVerified: true,
        employeeId: true,
        department: true,
        designation: true,
        phone: true,
        joiningDate: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    if (!user) throw new NotFoundException('Employee not found');

    const [metrics, online] = await Promise.all([
      this.attachMetrics([user]),
      this.isOnline(id),
    ]);

    const result = { ...user, ...metrics[0] };

    return {
      ...result,
      online,
      summary: {
        ...result.stats,
        total: result.stats.totalTasks,
        statusCounts: result.stats.statusCounts,
      },
    };
  }

  async getEmployeeTasks(id: string, query: EmployeeTasksQueryDto) {
    await this.ensureEmployee(id);

    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 10, 100);
    const skip = (page - 1) * pageSize;
    const sortBy = SORT_FIELDS[query.sortBy ?? 'createdAt'] ?? 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.TaskWhereInput = { assignedUserId: id, isDeleted: false };
    const search = query.search?.trim();
    if (search && search.length >= 2) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (query.status) where.status = query.status as TaskStatus;
    if (query.priority) where.priority = query.priority as TaskPriority;
    if (query.category) where.category = query.category as Prisma.TaskWhereInput['category'];
    if (query.overdue === 'true') {
      where.status = { in: ACTIVE_STATUSES };
      where.dueDate = { lt: new Date(), not: null };
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy:
          sortBy === 'priority'
            ? { priority: sortOrder }
            : sortBy === 'title'
              ? { title: sortOrder }
              : { [sortBy]: sortOrder },
        select: {
          id: true,
          taskId: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          progress: true,
          createdAt: true,
          startDate: true,
          dueDate: true,
          completedAt: true,
          updatedAt: true,
          assignedUserName: true,
          createdByName: true,
          estimatedHours: true,
          timeSpent: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    const rows = tasks.map((t) => ({
      ...t,
      estimatedHours: t.estimatedHours ? Number(t.estimatedHours) : 0,
      timeSpent: t.timeSpent ? Number(t.timeSpent) : 0,
    }));

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

  async getEmployeeTimeline(id: string, limit?: number) {
    await this.ensureEmployee(id);

    const take = Math.min(Math.max(limit ?? 100, 1), 200);

    const activities = await this.prisma.taskActivityLog.findMany({
      where: { task: { assignedUserId: id, isDeleted: false } },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        activityType: true,
        description: true,
        performedBy: true,
        performedByName: true,
        createdAt: true,
        metadata: true,
        task: {
          select: {
            id: true,
            taskId: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return activities.map((a) => ({
      id: a.id,
      activityType: a.activityType,
      kind: this.mapActivityKind(a.activityType),
      description: a.description,
      performedBy: a.performedBy,
      performedByName: a.performedByName,
      createdAt: a.createdAt,
      metadata: a.metadata,
      taskId: a.task.id,
      taskNumber: a.task.taskId,
      taskTitle: a.task.title,
      taskStatus: a.task.status,
    }));
  }

  async getEmployeeReport(id: string) {
    await this.ensureEmployee(id);

    const now = new Date();
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
        designation: true,
      },
    });

    const baseWhere: Prisma.TaskWhereInput = { assignedUserId: id, isDeleted: false };

    const [
      byStatus,
      byPriority,
      byCategory,
      onTimeCount,
      completedWithDueDateCount,
      dailyTrend,
      weeklyTrendRows,
      monthlyTrend,
      overdueByWeek,
      metrics,
    ] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['category'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<[{ count: number }]>`
        SELECT COUNT(*)::int AS count
        FROM "Task"
        WHERE "assignedUserId" = ${id}::text
          AND "isDeleted" = false
          AND "status" IN ('Completed', 'Archived')
          AND "completedAt" IS NOT NULL
          AND "dueDate" IS NOT NULL
          AND "completedAt" <= "dueDate"
      `.then((r) => Number(r[0]?.count ?? 0)),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { in: COMPLETED_STATUSES },
          completedAt: { not: null },
          dueDate: { not: null },
        },
      }),
      this.prisma.$queryRaw<{ bucket: string; created_count: number; completed_count: number }[]>
        `SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS bucket,
               COUNT(*)::int AS created_count,
               COUNT(*) FILTER (WHERE "completedAt" IS NOT NULL)::int AS completed_count
        FROM "Task"
        WHERE "assignedUserId" = ${id}::text
          AND "isDeleted" = false
          AND "createdAt" >= NOW() - INTERVAL '29 days'
        GROUP BY bucket
        ORDER BY bucket
      `,
      this.prisma.$queryRaw<{ bucket: string; created_count: number; completed_count: number }[]>
        `SELECT to_char(date_trunc('week', "createdAt"), 'YYYY-MM-DD') AS bucket,
               COUNT(*)::int AS created_count,
               COUNT(*) FILTER (WHERE "completedAt" IS NOT NULL)::int AS completed_count
        FROM "Task"
        WHERE "assignedUserId" = ${id}::text
          AND "isDeleted" = false
          AND "createdAt" >= NOW() - INTERVAL '11 weeks'
        GROUP BY bucket
        ORDER BY bucket
      `,
      this.prisma.$queryRaw<{ bucket: string; created_count: number; completed_count: number }[]>
        `SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS bucket,
               COUNT(*)::int AS created_count,
               COUNT(*) FILTER (WHERE "completedAt" IS NOT NULL)::int AS completed_count
        FROM "Task"
        WHERE "assignedUserId" = ${id}::text
          AND "isDeleted" = false
          AND "createdAt" >= NOW() - INTERVAL '11 months'
        GROUP BY bucket
        ORDER BY bucket
      `,
      this.prisma.$queryRaw<{ bucket: string; overdue_count: number }[]>
        `SELECT to_char(date_trunc('week', "dueDate"), 'YYYY-MM-DD') AS bucket,
               COUNT(*)::int AS overdue_count
        FROM "Task"
        WHERE "assignedUserId" = ${id}::text
          AND "isDeleted" = false
          AND "status" NOT IN ('Completed', 'Archived', 'Cancelled')
          AND "dueDate" IS NOT NULL
          AND "dueDate" >= NOW() - INTERVAL '11 weeks'
        GROUP BY bucket
        ORDER BY bucket
      `,
      this.attachMetrics([{ id }]),
    ]);

    const onTimeRate =
      completedWithDueDateCount > 0
        ? Math.round((onTimeCount / completedWithDueDateCount) * 100)
        : 0;

    const statusMap: Record<string, number> = {};
    byStatus.forEach((s) => {
      statusMap[s.status] = s._count._all;
    });

    const priorityMap: Record<string, number> = {};
    byPriority.forEach((p) => {
      priorityMap[p.priority] = p._count._all;
    });

    const categoryMap: Record<string, number> = {};
    byCategory.forEach((c) => {
      if (c.category) categoryMap[c.category] = c._count._all;
    });

    const overdueMap = new Map(
      overdueByWeek.map((row) => [row.bucket, row.overdue_count]),
    );

    const weeklyTrend = this.buildWeeklyTrend(weeklyTrendRows, overdueMap);

    return {
      employee: user,
      summary: metrics[0] ? metrics[0].stats : null,
      onTimeCompletionRate: onTimeRate,
      productivityScore: metrics[0] ? metrics[0].stats.productivityScore : 0,
      charts: {
        dailyTrend: this.fillDailyTrend(dailyTrend, now),
        weeklyTrend,
        monthlyTrend: this.fillMonthlyTrend(monthlyTrend, now),
        byStatus: statusMap,
        byPriority: priorityMap,
        byCategory: categoryMap,
      },
    };
  }

  async getEmployeeToday(id: string) {
    await this.ensureEmployee(id);

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const taskSelect = {
      id: true,
      taskId: true,
      title: true,
      status: true,
      priority: true,
    } as const;

    const [
      currentTask,
      completedToday,
      assignedToday,
      dueToday,
      activityToday,
      lastActivity,
      stats,
    ] = await Promise.all([
      this.prisma.task.findFirst({
        where: { assignedUserId: id, isDeleted: false, status: 'InProgress' },
        orderBy: { updatedAt: 'desc' },
        select: { ...taskSelect, progress: true, dueDate: true },
      }),
      this.prisma.task.findMany({
        where: {
          assignedUserId: id,
          isDeleted: false,
          status: { in: COMPLETED_STATUSES },
          completedAt: { gte: todayStart, lt: tomorrowStart },
        },
        orderBy: { completedAt: 'desc' },
        take: 50,
        select: { ...taskSelect, completedAt: true },
      }),
      this.prisma.task.findMany({
        where: {
          assignedUserId: id,
          isDeleted: false,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { ...taskSelect, progress: true, createdAt: true },
      }),
      this.prisma.task.findMany({
        where: {
          assignedUserId: id,
          isDeleted: false,
          status: { in: ACTIVE_STATUSES },
          dueDate: { gte: todayStart, lt: tomorrowStart },
        },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 50,
        select: { ...taskSelect, progress: true, dueDate: true },
      }),
      this.prisma.taskActivityLog.count({
        where: {
          task: { assignedUserId: id, isDeleted: false },
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      this.prisma.taskActivityLog.findFirst({
        where: { task: { assignedUserId: id, isDeleted: false } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          activityType: true,
          description: true,
          performedByName: true,
          createdAt: true,
          task: {
            select: { id: true, taskId: true, title: true },
          },
        },
      }),
      this.attachMetrics([{ id }]),
    ]);

    const metrics = stats && stats[0] ? stats[0].stats : null;
    const overdueCount = metrics?.overdueTasks ?? 0;
    const pendingCount = metrics?.pendingTasks ?? 0;
    const completedCount = completedToday.length;
    const dueCount = dueToday.length;

    const productivityToday =
      completedCount + dueCount + overdueCount > 0
        ? clampScore(
            Math.round((completedCount / (completedCount + dueCount + overdueCount)) * 100),
          )
        : 0;

    return {
      date: todayStart.toISOString().slice(0, 10),
      productivityToday,
      counts: {
        completedToday: completedCount,
        assignedToday: assignedToday.length,
        dueToday: dueCount,
        pending: pendingCount,
        overdue: overdueCount,
        activityToday,
      },
      currentTask: currentTask
        ? {
            id: currentTask.id,
            taskId: currentTask.taskId,
            title: currentTask.title,
            status: currentTask.status,
            priority: currentTask.priority,
            progress: currentTask.progress ?? 0,
            dueDate: currentTask.dueDate,
          }
        : null,
      completedToday,
      assignedToday,
      dueToday,
      lastActivity: lastActivity
        ? {
            id: lastActivity.id,
            activityType: lastActivity.activityType,
            kind: this.mapActivityKind(lastActivity.activityType),
            description: lastActivity.description,
            performedByName: lastActivity.performedByName,
            createdAt: lastActivity.createdAt,
            taskId: lastActivity.task.id,
            taskNumber: lastActivity.task.taskId,
            taskTitle: lastActivity.task.title,
          }
        : null,
    };
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async attachMetrics<T extends { id: string }>(users: T[]) {    if (users.length === 0) return [];
    const userIds = users.map((u) => u.id);
    const metricMap = await this.collectMetrics(userIds);
    return users.map((user) => ({
      ...user,
      stats: metricMap.get(user.id) ?? this.emptyMetrics(),
    }));
  }

  private async collectMetrics(userIds: string[]): Promise<Map<string, EmployeeMetrics>> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekStart = startOfWeek(now);
    const nextWeekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthStart = startOfMonth(now);
    const nextMonthStart = new Date(monthStart);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

    const activeWhere: Prisma.TaskWhereInput = {
      assignedUserId: { in: userIds },
      isDeleted: false,
    };

    const [
      statusGroups,
      overdueGroups,
      todayGroups,
      weekGroups,
      monthGroups,
      rejectedActivities,
      completedTasks,
      runningTasks,
      openTasks,
      createdTodayGroups,
    ] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['assignedUserId', 'status'],
        where: activeWhere,
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          ...activeWhere,
          status: { in: ACTIVE_STATUSES },
          dueDate: { lt: now, not: null },
        },
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          ...activeWhere,
          status: { in: ACTIVE_STATUSES },
          dueDate: { gte: todayStart, lt: tomorrowStart },
        },
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          ...activeWhere,
          status: { in: ACTIVE_STATUSES },
          dueDate: { gte: weekStart, lt: nextWeekStart },
        },
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          ...activeWhere,
          status: { in: ACTIVE_STATUSES },
          dueDate: { gte: monthStart, lt: nextMonthStart },
        },
        _count: { _all: true },
      }),
      this.prisma.taskActivityLog.findMany({
        where: {
          activityType: 'Rejected',
          task: { assignedUserId: { in: userIds }, isDeleted: false },
        },
        select: { taskId: true, task: { select: { assignedUserId: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          ...activeWhere,
          status: 'Completed',
          completedAt: { not: null },
        },
        select: {
          id: true,
          taskId: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          dueDate: true,
          completedAt: true,
          assignedUserId: true,
        },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.task.findMany({
        where: { ...activeWhere, status: 'InProgress' },
        select: {
          id: true,
          taskId: true,
          title: true,
          status: true,
          priority: true,
          progress: true,
          createdAt: true,
          dueDate: true,
          completedAt: true,
          updatedAt: true,
          assignedUserId: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.task.findMany({
        where: { ...activeWhere, status: { in: OPEN_STATUSES } },
        select: {
          id: true,
          taskId: true,
          title: true,
          status: true,
          priority: true,
          progress: true,
          createdAt: true,
          dueDate: true,
          completedAt: true,
          assignedUserId: true,
        },
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          ...activeWhere,
          createdAt: { gte: todayStart, lt: tomorrowStart },
        },
        _count: { _all: true },
      }),
    ]);

    const statusMap = new Map<string, Record<string, number>>();
    statusGroups.forEach((g) => {
      if (!g.assignedUserId) return;
      const bucket = statusMap.get(g.assignedUserId) ?? {};
      bucket[g.status] = g._count._all;
      statusMap.set(g.assignedUserId, bucket);
    });

    const countMap = (groups: { assignedUserId: string | null; _count: { _all: number } }[]) => {
      const map = new Map<string, number>();
      groups.forEach((g) => {
        if (g.assignedUserId) map.set(g.assignedUserId, g._count._all);
      });
      return map;
    };

    const overdueMap = countMap(overdueGroups);
    const todayMap = countMap(todayGroups);
    const weekMap = countMap(weekGroups);
    const monthMap = countMap(monthGroups);
    const createdTodayMap = countMap(createdTodayGroups);

    const completedTodayMap = new Map<string, number>();
    completedTasks.forEach((t) => {
      if (t.assignedUserId && t.completedAt && t.completedAt >= todayStart) {
        completedTodayMap.set(
          t.assignedUserId,
          (completedTodayMap.get(t.assignedUserId) ?? 0) + 1,
        );
      }
    });

    const rejectedMap = new Map<string, number>();
    rejectedActivities.forEach((a) => {
      const uid = a.task?.assignedUserId;
      if (uid) rejectedMap.set(uid, (rejectedMap.get(uid) ?? 0) + 1);
    });

    const completedByUser = new Map<
      string,
      { count: number; totalHours: number; last: TaskLight | null }
    >();
    completedTasks.forEach((t) => {
      if (!t.assignedUserId) return;
      const entry = completedByUser.get(t.assignedUserId) ?? {
        count: 0,
        totalHours: 0,
        last: null,
      };
      entry.count += 1;
      if (t.completedAt && t.createdAt) {
        entry.totalHours +=
          (t.completedAt.getTime() - t.createdAt.getTime()) / (60 * 60 * 1000);
      }
      if (!entry.last || (t.completedAt && entry.last.completedAt && t.completedAt > entry.last.completedAt)) {
        entry.last = t;
      }
      completedByUser.set(t.assignedUserId, entry);
    });

    const currentByUser = new Map<string, TaskLight>();
    runningTasks.forEach((t) => {
      if (t.assignedUserId && !currentByUser.has(t.assignedUserId)) {
        currentByUser.set(t.assignedUserId, t as TaskLight);
      }
    });

    const highestByUser = new Map<string, TaskLight>();
    openTasks.forEach((t) => {
      if (!t.assignedUserId) return;
      const current = highestByUser.get(t.assignedUserId);
      if (!current || PRIORITY_RANK[t.priority] > PRIORITY_RANK[current.priority]) {
        highestByUser.set(t.assignedUserId, t as TaskLight);
      }
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, createdAt: true },
    });
    const createdAtMap = new Map(users.map((u) => [u.id, u.createdAt]));

    const result = new Map<string, EmployeeMetrics>();
    userIds.forEach((userId) => {
      const statuses = statusMap.get(userId) ?? {};
      const totalTasks = Object.values(statuses).reduce((a, b) => a + b, 0);
      const completedTasks = statuses.Completed ?? 0;
      const activeTasks =
        (statuses.Todo ?? 0) + (statuses.InProgress ?? 0) + (statuses.OnHold ?? 0);
      const draftTasks = statuses.Draft ?? 0;
      const pendingTasks = activeTasks + draftTasks;
      const overdueTasks = overdueMap.get(userId) ?? 0;
      const dueToday = todayMap.get(userId) ?? 0;
      const dueThisWeek = weekMap.get(userId) ?? 0;
      const dueThisMonth = monthMap.get(userId) ?? 0;
      const cancelledTasks = statuses.Cancelled ?? 0;
      const rejectedTasks = rejectedMap.get(userId) ?? 0;

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const completed = completedByUser.get(userId);
      const avgCompletionHours =
        completed && completed.count > 0
          ? round1(completed.totalHours / completed.count)
          : 0;

      const workloadScore = clampScore(
        pendingTasks * WORKLOAD_WEIGHTS.pending +
          overdueTasks * WORKLOAD_WEIGHTS.overdue +
          dueToday * WORKLOAD_WEIGHTS.dueToday,
      );
      const workloadLevel: WorkloadLevel =
        workloadScore >= 70 ? 'high' : workloadScore >= 40 ? 'medium' : 'low';

      const performanceBadge = this.computeBadge({
        totalTasks,
        completionRate,
        overdueTasks,
        workloadLevel,
      });

      const createdAt = createdAtMap.get(userId) ?? new Date();
      const cardTone = this.computeCardTone({
        totalTasks,
        overdueTasks,
        pendingTasks,
        completionRate,
        isNew: isNewEmployee(createdAt, now),
      });

      const productivityScore = Math.round(
        completionRate * 0.4 +
          Math.max(0, 100 - overdueTasks * 10) * 0.3 +
          (avgCompletionHours > 0 ? Math.max(0, 100 - avgCompletionHours) : 50) * 0.3,
      );

      const currentTask = currentByUser.get(userId) ?? null;
      const highestPriorityTask = highestByUser.get(userId) ?? null;
      const lastCompletedTask = completed?.last ?? null;

      result.set(userId, {
        statusCounts: statuses,
        totalTasks,
        completedTasks,
        pendingTasks,
        activeTasks,
        overdueTasks,
        dueToday,
        dueThisWeek,
        dueThisMonth,
        cancelledTasks,
        rejectedTasks,
        completedToday: completedTodayMap.get(userId) ?? 0,
        assignedToday: createdTodayMap.get(userId) ?? 0,
        completionRate,
        avgCompletionHours,
        onTimeCompletionRate: 0,
        currentTask: currentTask
          ? {
              id: currentTask.id,
              taskId: currentTask.taskId,
              title: currentTask.title,
              priority: currentTask.priority,
              status: currentTask.status,
              progress: currentTask.progress ?? 0,
              dueDate: currentTask.dueDate,
            }
          : null,
        highestPriorityTask: highestPriorityTask
          ? {
              id: highestPriorityTask.id,
              taskId: highestPriorityTask.taskId,
              title: highestPriorityTask.title,
              priority: highestPriorityTask.priority,
              status: highestPriorityTask.status,
              progress: highestPriorityTask.progress ?? 0,
              dueDate: highestPriorityTask.dueDate,
            }
          : null,
        lastCompletedTask: lastCompletedTask
          ? {
              id: lastCompletedTask.id,
              taskId: lastCompletedTask.taskId,
              title: lastCompletedTask.title,
              priority: lastCompletedTask.priority,
              completedAt: lastCompletedTask.completedAt!,
            }
          : null,
        workloadScore,
        workloadLevel,
        performanceBadge,
        cardTone,
        productivityScore,
      });
    });

    return result;
  }

  private emptyMetrics(): EmployeeMetrics {
    return {
      statusCounts: {},
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      activeTasks: 0,
      overdueTasks: 0,
      dueToday: 0,
      dueThisWeek: 0,
      dueThisMonth: 0,
      cancelledTasks: 0,
      rejectedTasks: 0,
      completedToday: 0,
      assignedToday: 0,
      completionRate: 0,
      avgCompletionHours: 0,
      onTimeCompletionRate: 0,
      currentTask: null,
      highestPriorityTask: null,
      lastCompletedTask: null,
      workloadScore: 0,
      workloadLevel: 'low',
      performanceBadge: 'No Tasks',
      cardTone: 'grey',
      productivityScore: 0,
    };
  }

  private computeBadge(args: {
    totalTasks: number;
    completionRate: number;
    overdueTasks: number;
    workloadLevel: WorkloadLevel;
  }): PerformanceBadge {
    if (args.totalTasks === 0) return 'No Tasks';
    if (args.workloadLevel === 'high') return 'Overloaded';
    if (args.completionRate >= 75 && args.overdueTasks === 0) return 'Excellent';
    if (args.completionRate >= 50 && args.overdueTasks <= 1) return 'Good';
    if (args.completionRate >= 25) return 'Average';
    return 'Needs Attention';
  }

  private computeCardTone(args: {
    totalTasks: number;
    overdueTasks: number;
    pendingTasks: number;
    completionRate: number;
    isNew: boolean;
  }): CardTone {
    if (args.totalTasks === 0) return 'grey';
    if (args.overdueTasks >= 2) return 'red';
    if (args.isNew) return 'blue';
    if (args.pendingTasks > 0 && args.completionRate < 50) return 'orange';
    return 'green';
  }

  private mapActivityKind(activityType: string): string {
    switch (activityType) {
      case 'Created':
        return 'assigned';
      case 'Started':
        return 'started';
      case 'Updated':
        return 'updated';
      case 'Completed':
        return 'completed';
      case 'Verified':
        return 'verified';
      case 'Rejected':
        return 'rejected';
      case 'Cancelled':
        return 'cancelled';
      default:
        return 'activity';
    }
  }

  private buildWeeklyTrend(
    rows: { bucket: string; created_count: number; completed_count: number }[],
    overdueMap: Map<string, number>,
  ) {
    const now = new Date();
    const start = startOfWeek(now);
    const buckets: { bucket: string; label: string; created: number; completed: number; overdue: number }[] =
      [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const bucket = weekStart.toISOString().slice(0, 10);
      const row = rows.find((r) => r.bucket === bucket);
      buckets.push({
        bucket,
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        created: row?.created_count ?? 0,
        completed: row?.completed_count ?? 0,
        overdue: overdueMap.get(bucket) ?? 0,
      });
    }
    return buckets;
  }

  private fillDailyTrend(
    rows: { bucket: string; created_count: number; completed_count: number }[],
    now: Date,
  ) {
    const buckets: { bucket: string; label: string; created: number; completed: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const bucket = day.toISOString().slice(0, 10);
      const row = rows.find((r) => r.bucket === bucket);
      buckets.push({
        bucket,
        label: `${day.getMonth() + 1}/${day.getDate()}`,
        created: row?.created_count ?? 0,
        completed: row?.completed_count ?? 0,
      });
    }
    return buckets;
  }

  private fillMonthlyTrend(
    rows: { bucket: string; created_count: number; completed_count: number }[],
    now: Date,
  ) {
    const buckets: { bucket: string; label: string; created: number; completed: number }[] = [];
    const monthStart = startOfMonth(now);
    for (let i = 11; i >= 0; i--) {
      const month = new Date(monthStart);
      month.setMonth(month.getMonth() - i);
      const bucket = month.toISOString().slice(0, 7);
      const row = rows.find((r) => r.bucket === bucket);
      buckets.push({
        bucket,
        label: `${month.getMonth() + 1}/${month.getFullYear()}`,
        created: row?.created_count ?? 0,
        completed: row?.completed_count ?? 0,
      });
    }
    return buckets;
  }

  private async isOnline(userId: string): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        lastActivity: { gte: fiveMinutesAgo },
      },
      select: { id: true },
    });
    return Boolean(session);
  }

  private async ensureEmployee(id: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, userType: 'EMPLOYEE' },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('Employee not found');
  }
}
