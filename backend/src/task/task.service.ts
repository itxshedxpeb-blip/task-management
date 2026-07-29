import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseQueryService, WhereClause } from '../common/services/base-query.service';
import { GetTasksDto } from './dto/get-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { VerifyTaskDto, VerifyAction } from './dto/verify-task.dto';

const TASK_INCLUDE = {
  checklist: { orderBy: { order: 'asc' } },
  comments: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
  attachments: { orderBy: { createdAt: 'desc' } },
  dependencies: true,
  activities: { orderBy: { createdAt: 'desc' }, take: 50 },
  labels: { include: { label: true } },
  watchers: true,
  subtasks: { select: { id: true, title: true, status: true } },
};

@Injectable()
export class TaskService extends BaseQueryService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, {
      model: 'task',
      searchFields: ['title', 'description', 'assignedUserName', 'createdByName', 'notes'],
      filterFields: [
        'status',
        'priority',
        'category',
        'assignedUserId',
      ],
      sortColumns: ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status', 'taskId'],
    });
  }

  async findAll(query: GetTasksDto) {
    const { dueDateFrom, dueDateTo, ...restQuery } = query;

    const extraWhere: WhereClause = {};
    if (dueDateFrom || dueDateTo) {
      extraWhere.dueDate = {};
      if (dueDateFrom) extraWhere.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) {
        const toDate = new Date(dueDateTo);
        toDate.setHours(23, 59, 59, 999);
        extraWhere.dueDate.lte = toDate;
      }
    }

    const result = await super.findAll(restQuery, extraWhere);
    return result;
  }

  async findById(id: string) {
    return super.findById(id, TASK_INCLUDE);
  }

  async create(
    dto: CreateTaskDto,
    createdById: string,
    createdByName: string,
  ) {
    let assignedUserName = dto.assignedUserName;
    if (!assignedUserName && dto.assignedUserId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
        select: { name: true },
      });
      assignedUserName = assignee?.name || dto.assignedUserId;
    }

    const task = await this.client.create({
      data: {
        title: dto.title,
        description: dto.description,
        assignedUserId: dto.assignedUserId || undefined,
        assignedUserName: assignedUserName || undefined,
        createdById: createdById,
        createdByName: createdByName,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : undefined,
        priority: dto.priority || 'Medium',
        status: dto.status || 'Todo',
        category: dto.category,
        estimatedHours: dto.estimatedHours,
        tags: dto.tags || [],
        notes: dto.notes,
        parentTaskId: dto.parentTaskId || undefined,
        slaDueDate: dto.slaDueDate ? new Date(dto.slaDueDate) : undefined,
      },
      include: TASK_INCLUDE,
    });

    await this.logActivity(
      task.id,
      'Created',
      `Task "${task.title}" created`,
      createdById,
      createdByName,
    );

    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    updatedBy: string,
    updatedByName: string,
  ) {
    const existing = await this.findById(id);

    if (
      existing.status === 'Completed' ||
      existing.status === 'Archived'
    ) {
      throw new BadRequestException('Cannot update a task that is completed or archived');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.reminderDate) data.reminderDate = new Date(dto.reminderDate);
    if (dto.slaDueDate) data.slaDueDate = new Date(dto.slaDueDate);

    if (dto.status === 'InProgress' && existing.status !== 'InProgress' && !existing.startedAt) {
      data.startedAt = new Date();
    }

    const task = await this.client.update({
      where: { id },
      data,
      include: TASK_INCLUDE,
    });

    const changes = Object.keys(dto).filter((k) => dto[k as keyof UpdateTaskDto] !== undefined);
    if (changes.length > 0) {
      const activityType = dto.status === 'InProgress' && existing.status !== 'InProgress' ? 'Started' : 'Updated';
      const description = activityType === 'Started'
        ? 'Task started'
        : `Task updated: ${changes.join(', ')}`;
      await this.logActivity(id, activityType, description, updatedBy, updatedByName);
    }

    return task;
  }

  async deleteTask(id: string, deletedById: string, deletedByName: string) {
    const existing = await this.findById(id);
    await super.softDelete(id, deletedById);
    await this.logActivity(
      id,
      'Cancelled',
      `Task "${existing.title}" deleted`,
      deletedById,
      deletedByName,
    );
    return { message: 'Task deleted successfully' };
  }

  async complete(
    id: string,
    dto: CompleteTaskDto,
    userId: string,
    userName: string,
  ) {
    const existing = await this.findById(id);

    if (
      existing.status === 'Completed' ||
      existing.status === 'Archived'
    ) {
      throw new BadRequestException('Task is already completed or archived');
    }

    const task = await this.client.update({
      where: { id },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        completionNotes: dto.completionNotes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completionProof: dto.completionProof as any,
        afterImages: dto.completionProof.afterImages,
        timeSpent: dto.timeSpent,
        progress: 100,
      },
      include: TASK_INCLUDE,
    });

    await this.logActivity(
      id,
      'Completed',
      `Task completed. ${dto.completionNotes}`,
      userId,
      userName,
    );

    return task;
  }

  async verify(id: string, dto: VerifyTaskDto) {
    const existing = await this.findById(id);

    if (existing.status !== 'Completed') {
      throw new BadRequestException('Only completed tasks can be verified or rejected');
    }

    const newStatus = dto.status === VerifyAction.Verified ? 'Completed' : 'Cancelled';

    const task = await this.client.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedAt: new Date(),
        verifiedBy: dto.verifiedBy,
        verifiedByName: dto.verifiedByName,
        verificationNotes: dto.verificationNotes,
      },
      include: TASK_INCLUDE,
    });

    const action = dto.status === VerifyAction.Verified ? 'Verified' : 'Rejected';
    const notes = dto.verificationNotes ? `: ${dto.verificationNotes}` : '';
    await this.logActivity(
      id,
      action,
      `Task ${action.toLowerCase()}${notes}`,
      dto.verifiedBy || '',
      dto.verifiedByName || '',
    );

    return task;
  }

  async getTaskStats(userId?: string) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);

    const baseWhere: any = { isDeleted: false };
    if (userId) {
      baseWhere.assignedUserId = userId;
    }

    const [
      totalTasks,
      draftTasks,
      todoTasks,
      inProgressTasks,
      onHoldTasks,
      completedTasks,
      archivedTasks,
      cancelledTasks,
      overdueTasks,
      dueToday,
      dueThisWeek,
      completedToday,
      completedOnTime,
      completedLate,
      tasksByPriority,
      tasksByStatus,
    ] = await Promise.all([
      this.client.count({ where: baseWhere }),
      this.client.count({ where: { ...baseWhere, status: 'Draft' } }),
      this.client.count({ where: { ...baseWhere, status: 'Todo' } }),
      this.client.count({ where: { ...baseWhere, status: 'InProgress' } }),
      this.client.count({ where: { ...baseWhere, status: 'OnHold' } }),
      this.client.count({ where: { ...baseWhere, status: 'Completed' } }),
      this.client.count({ where: { ...baseWhere, status: 'Archived' } }),
      this.client.count({ where: { ...baseWhere, status: 'Cancelled' } }),
      this.client.count({
        where: {
          ...baseWhere,
          dueDate: { lt: now },
          status: { in: ['Draft', 'Todo', 'InProgress', 'OnHold'] },
        },
      }),
      this.client.count({ where: { ...baseWhere, dueDate: { gte: todayStart, lte: todayEnd } } }),
      this.client.count({
        where: {
          ...baseWhere,
          dueDate: { gte: todayStart, lte: weekEnd },
          status: { in: ['Draft', 'Todo', 'InProgress', 'OnHold'] },
        },
      }),
      this.client.count({
        where: {
          ...baseWhere,
          status: 'Completed',
          completedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      this.client.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count
        FROM "Task"
        WHERE "isDeleted" = false
          AND "status" = 'Completed'
          AND "completedAt" IS NOT NULL
          AND "dueDate" IS NOT NULL
          AND "completedAt" <= "dueDate"
      `).then((result: any) => result[0]?.count ?? 0),
      this.client.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count
        FROM "Task"
        WHERE "isDeleted" = false
          AND "status" = 'Completed'
          AND "completedAt" IS NOT NULL
          AND "dueDate" IS NOT NULL
          AND "completedAt" > "dueDate"
      `).then((result: any) => result[0]?.count ?? 0),
      this.client.groupBy({ by: ['priority'], where: baseWhere, _count: true }),
      this.client.groupBy({ by: ['status'], where: baseWhere, _count: true }),
    ]);

    const priorityMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasksByPriority.forEach((p: any) => {
      priorityMap[p.priority] = p._count;
    });

    const statusMap: Record<string, number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasksByStatus.forEach((s: any) => {
      statusMap[s.status] = s._count;
    });

    return {
      totalTasks,
      draftTasks,
      todoTasks,
      inProgressTasks,
      onHoldTasks,
      completedTasks,
      archivedTasks,
      cancelledTasks,
      overdueTasks,
      dueToday,
      dueThisWeek,
      tasksByPriority: priorityMap,
      tasksByStatus: statusMap,
      completedToday,
      completedOnTime: completedTasks - (typeof completedLate === 'number' ? completedLate : 0),
      completedLate: typeof completedLate === 'number' ? completedLate : 0,
    };
  }

  async getMyStats(userId: string) {
    return this.getTaskStats(userId);
  }

  async getDashboardKPIs() {
    const now = new Date();

    const [openTasks, overdueTasks, completedToday, completedTasks, completedOnTimeRaw, completedLateRaw] =
      await Promise.all([
        this.client.count({
          where: {
            isDeleted: false,
            status: { in: ['Draft', 'Todo', 'InProgress', 'OnHold'] },
          },
        }),
        this.client.count({
          where: {
            isDeleted: false,
            dueDate: { lt: now },
            status: { in: ['Draft', 'Todo', 'InProgress', 'OnHold'] },
          },
        }),
        this.client.count({
          where: {
            isDeleted: false,
            status: 'Completed',
            completedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
          },
        }),
        this.client.count({
          where: { isDeleted: false, status: 'Completed' },
        }),
        this.client.$queryRawUnsafe(`
          SELECT COUNT(*)::int as count
          FROM "Task"
          WHERE "isDeleted" = false
            AND "status" = 'Completed'
            AND "completedAt" IS NOT NULL
            AND "dueDate" IS NOT NULL
            AND "completedAt" <= "dueDate"
        `).then((result: any) => result[0]?.count ?? 0),
        this.client.$queryRawUnsafe(`
          SELECT COUNT(*)::int as count
          FROM "Task"
          WHERE "isDeleted" = false
            AND "status" = 'Completed'
            AND "completedAt" IS NOT NULL
            AND "dueDate" IS NOT NULL
            AND "completedAt" > "dueDate"
        `).then((result: any) => result[0]?.count ?? 0),
      ]);

    const topPerformers = await this.getEmployeePerformance();

    return {
      openTasks,
      overdueTasks,
      completedToday,
      completedTasks,
      completedOnTime: completedOnTimeRaw,
      completedLate: completedLateRaw,
      topPerformers: topPerformers.slice(0, 5),
    };
  }

  async getEmployeePerformance(employeeId?: string) {
    const baseWhere = { isDeleted: false };

    const userFilter = employeeId ? { assignedUserId: employeeId } : {};
    const allTasks = await this.client.findMany({
      where: { ...baseWhere, ...userFilter },
      select: {
        id: true,
        assignedUserId: true,
        assignedUserName: true,
        status: true,
        dueDate: true,
        completedAt: true,
        verifiedAt: true,
        progress: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employeeMap = new Map<string, any>();
    for (const task of allTasks) {
      const key = task.assignedUserId || 'unassigned';
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employeeId: task.assignedUserId,
          employeeName: task.assignedUserName,
          tasksAssigned: 0,
          tasksCompleted: 0,
          tasksPending: 0,
          tasksOverdue: 0,
          tasksVerified: 0,
          tasksRejected: 0,
          completionRate: 0,
          onTimeCompletionRate: 0,
          averageCompletionTime: 0,
          totalPaymentPending: 0,
          totalPaymentReceived: 0,
          totalPerformanceScore: 0,
        });
      }
      const emp = employeeMap.get(key);
      emp.tasksAssigned++;

      const now = new Date();
      switch (task.status) {
        case 'Completed':
        case 'Archived':
          emp.tasksCompleted++;
          if (
            task.completedAt &&
            task.dueDate &&
            new Date(task.completedAt) <= new Date(task.dueDate)
          ) {
            emp.onTimeCompletionRate++;
          }
          if (task.completedAt && task.createdAt) {
            const diffMs =
              new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
            emp.averageCompletionTime += diffMs / (1000 * 60 * 60 * 24);
          }
          break;
        case 'Todo':
        case 'Draft':
        case 'InProgress':
        case 'OnHold':
          emp.tasksPending++;
          if (task.dueDate && new Date(task.dueDate) < now) {
            emp.tasksOverdue++;
          }
          break;
      }
    }

    const performance = Array.from(employeeMap.values()).map((emp) => {
      if (emp.tasksCompleted > 0) {
        emp.completionRate = Math.round((emp.tasksCompleted / emp.tasksAssigned) * 100);
        emp.onTimeCompletionRate = Math.round(
          (emp.onTimeCompletionRate / emp.tasksCompleted) * 100,
        );
        emp.averageCompletionTime =
          Math.round((emp.averageCompletionTime / emp.tasksCompleted) * 10) / 10;
      }
      emp.totalPerformanceScore = Math.round(
        emp.completionRate * 0.4 +
          emp.onTimeCompletionRate * 0.3 +
          Math.max(0, 100 - emp.tasksOverdue * 10) * 0.3,
      );
      return emp;
    });

    performance.sort((a, b) => b.totalPerformanceScore - a.totalPerformanceScore);
    performance.forEach((emp, i) => {
      emp.rank = i + 1;
      emp.percentile = Math.round(((performance.length - i) / performance.length) * 100);
    });

    return performance;
  }

  private async logActivity(
    taskId: string,
    activityType: string,
    description: string,
    performedBy: string,
    performedByName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>,
  ) {
    await this.prisma.taskActivityLog.create({
      data: {
        taskId,
        activityType,
        description,
        performedBy,
        performedByName,
        metadata: metadata || undefined,
      },
    });
  }
}
