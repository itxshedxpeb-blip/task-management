import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPerformance(organizationId: string, query: { dateFrom?: string; dateTo?: string; employeeId?: string }) {
    const { dateFrom, dateTo, employeeId } = query;
    const baseWhere = { organizationId, isDeleted: false };

    if (dateFrom || dateTo) {
      (baseWhere as any).createdAt = {};
      if (dateFrom) (baseWhere as any).createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        (baseWhere as any).createdAt.lte = toDate;
      }
    }

    if (employeeId) {
      (baseWhere as any).assignedUserId = employeeId;
    }

    const tasks = await this.prisma.task.findMany({
      where: baseWhere,
      select: {
        id: true,
        assignedUserId: true,
        assignedUserName: true,
        status: true,
        dueDate: true,
        completedAt: true,
        verifiedAt: true,
        incentiveValue: true,
        createdAt: true,
      },
    });

    const employeeMap = new Map<string, any>();

    for (const task of tasks) {
      const key = task.assignedUserId;
      if (!key) continue;

      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employeeId: key,
          employeeName: task.assignedUserName,
          tasksAssigned: 0,
          tasksCompleted: 0,
          tasksVerified: 0,
          tasksPending: 0,
          tasksOverdue: 0,
          completionRate: 0,
          onTimeRate: 0,
          totalIncentive: 0,
        });
      }

      const emp = employeeMap.get(key);
      emp.tasksAssigned++;

      if (['Completed', 'Verified', 'Closed'].includes(task.status)) {
        emp.tasksCompleted++;
        if (task.status === 'Verified' || task.status === 'Closed') {
          emp.tasksVerified++;
          emp.totalIncentive += task.incentiveValue;
        }
        if (task.completedAt && task.dueDate && new Date(task.completedAt) <= new Date(task.dueDate)) {
          emp.onTimeRate++;
        }
      } else if (['Todo', 'InProgress', 'Reopened'].includes(task.status)) {
        emp.tasksPending++;
        if (task.dueDate && new Date(task.dueDate) < new Date()) {
          emp.tasksOverdue++;
        }
      }
    }

    const performance = Array.from(employeeMap.values()).map((emp) => {
      if (emp.tasksCompleted > 0) {
        emp.completionRate = Math.round((emp.tasksCompleted / emp.tasksAssigned) * 100);
        emp.onTimeRate = Math.round((emp.onTimeRate / emp.tasksCompleted) * 100);
      }
      return emp;
    });

    performance.sort((a, b) => b.completionRate - a.completionRate);

    return performance;
  }

  async getTaskReport(organizationId: string, query: { dateFrom?: string; dateTo?: string }) {
    const { dateFrom, dateTo } = query;
    const baseWhere: any = { organizationId, isDeleted: false };

    if (dateFrom || dateTo) {
      baseWhere.createdAt = {};
      if (dateFrom) baseWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        baseWhere.createdAt.lte = toDate;
      }
    }

    const [totalTasks, tasksByStatus, tasksByPriority, completedTasks, overdueTasks] = await Promise.all([
      this.prisma.task.count({ where: baseWhere }),
      this.prisma.task.groupBy({ by: ['status'], where: baseWhere, _count: true }),
      this.prisma.task.groupBy({ by: ['priority'], where: baseWhere, _count: true }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { in: ['Completed', 'Verified', 'Closed'] },
        },
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { lt: new Date() },
          status: { in: ['Todo', 'InProgress', 'Reopened'] },
        },
      }),
    ]);

    const totalIncentive = await this.prisma.task.aggregate({
      where: baseWhere,
      _sum: { incentiveValue: true },
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasksByStatus.forEach((s: any) => {
      statusMap[s.status] = s._count;
    });

    const priorityMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasksByPriority.forEach((p: any) => {
      priorityMap[p.priority] = p._count;
    });

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate,
      totalIncentive: totalIncentive._sum.incentiveValue || 0,
      byStatus: statusMap,
      byPriority: priorityMap,
    };
  }

  async getSummary(organizationId: string) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const baseWhere = { organizationId, isDeleted: false };

    const [
      totalTasks,
      openTasks,
      completedToday,
      overdueTasks,
      totalUsers,
      totalDepartments,
      totalTeams,
    ] = await Promise.all([
      this.prisma.task.count({ where: baseWhere }),
      this.prisma.task.count({
        where: { ...baseWhere, status: { in: ['Todo', 'InProgress', 'Reopened'] } },
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { in: ['Completed', 'Verified'] },
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          dueDate: { lt: now },
          status: { in: ['Todo', 'InProgress', 'Reopened'] },
        },
      }),
      this.prisma.user.count({ where: { organizationId, isActive: true } }),
      this.prisma.department.count({ where: { organizationId, isDeleted: false } }),
      this.prisma.team.count({ where: { organizationId, isDeleted: false } }),
    ]);

    return {
      totalTasks,
      openTasks,
      completedToday,
      overdueTasks,
      totalUsers,
      totalDepartments,
      totalTeams,
    };
  }
}
