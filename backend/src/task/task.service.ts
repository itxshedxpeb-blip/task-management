import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseQueryService, WhereClause } from '../common/services/base-query.service';
import { CurrentUser } from '../common/types';
import { GetTasksDto } from './dto/get-tasks.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { TaskEventsGateway } from './task-events.gateway';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
const OPEN_STATUSES: TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Draft,
  TaskStatus.OnHold,
];

const TASK_INCLUDE = {
  activities: {
    orderBy: { createdAt: 'desc' as const },
    take: 30,
  },
  labels: { include: { label: true } },
};

export interface ActivityChange {
  field: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
}

@Injectable()
export class TaskService extends BaseQueryService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly events: TaskEventsGateway,
  ) {
    super(prisma, {
      model: 'task',
      searchFields: ['title', 'description', 'assignedUserName', 'createdByName', 'notes'],
      filterFields: ['status', 'priority', 'category', 'assignedUserId'],
      sortColumns: ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status', 'taskId'],
    });
  }

  canViewAll(user?: CurrentUser): boolean {
    return !!user && ADMIN_ROLES.includes(user.role);
  }

  private assertOwnership(task: { assignedUserId?: string | null }, user: CurrentUser) {
    if (this.canViewAll(user)) return;
    if (task.assignedUserId !== user.id) {
      throw new ForbiddenException('You can only manage your own tasks');
    }
  }

  async findAll(query: GetTasksDto, currentUser?: CurrentUser) {
    const { dueDateFrom, dueDateTo, dateFrom, dateTo, ...restQuery } = query;

    const extraWhere: WhereClause = {};
    
    // Filter by due date if specified (explicit dueDate filter)
    if (dueDateFrom || dueDateTo) {
      extraWhere.dueDate = {};
      if (dueDateFrom) extraWhere.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) {
        const toDate = new Date(dueDateTo);
        toDate.setHours(23, 59, 59, 999);
        extraWhere.dueDate.lte = toDate;
      }
    }

    // NOTE: dateFrom/dateTo are NOT applied to Prisma query
    // because they need to filter by both dueDate AND nextFollowUpDate
    // which requires client-side filtering after enrichment

    if (currentUser && !this.canViewAll(currentUser)) {
      extraWhere.assignedUserId = currentUser.id;
    }

    const result = await super.findAll(restQuery, extraWhere, TASK_INCLUDE);
    
    // Enrich each task with next follow-up info
    result.rows = result.rows.map((task: any) => this.enrichTaskWithFollowUp(task));
    
    // If dateFrom/dateTo are specified, filter by createdAt, dueDate, and follow-up dates client-side
    // This is used by Calendar/Today pages to show tasks for specific dates
    if (dateFrom || dateTo) {
      result.rows = result.rows.filter((task: any) => {
        // Include if createdAt matches (use local date comparison)
        if (task.createdAt) {
          const createdDate = new Date(task.createdAt);
          const createdDateStr = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
          if (dateFrom && createdDateStr < dateFrom) return false;
          if (dateTo && createdDateStr > dateTo) return false;
          return true;
        }
        // Include if dueDate matches (use local date comparison)
        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
          if (dateFrom && taskDateStr < dateFrom) return false;
          if (dateTo && taskDateStr > dateTo) return false;
          return true;
        }
        // Include if follow-up date matches
        if (task.nextFollowUpDate) {
          const followUpDate = task.nextFollowUpDate; // Already in YYYY-MM-DD format
          if (dateFrom && followUpDate < dateFrom) return false;
          if (dateTo && followUpDate > dateTo) return false;
          return true;
        }
        // No date - exclude (for Calendar/Today pages)
        return false;
      });
    }
    
    return result;
  }

  async findById(id: string, currentUser?: CurrentUser) {
    const task = await super.findById(id, TASK_INCLUDE);
    if (currentUser) {
      this.assertOwnership(task, currentUser);
    }
    return this.enrichTaskWithFollowUp(task);
  }

  /**
   * Compute next follow-up info from the task's activities.
   * Returns the most recent follow-up regardless of date for calendar/today display.
   */
  private enrichTaskWithFollowUp(task: any) {
    if (!task.activities || task.activities.length === 0) {
      return task;
    }

    // Find all activities with follow-ups (not just future ones)
    const followUps = task.activities
      .filter((a: any) => a.nextFollowUpDate)
      .sort((a: any, b: any) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));

    if (followUps.length > 0) {
      const next = followUps[0];
      task.nextFollowUpDate = next.nextFollowUpDate;
      task.nextFollowUpTime = next.nextFollowUpTime;
      task.nextFollowUpAction = next.nextFollowUpAction;
    }

    return task;
  }

  async create(dto: CreateTaskDto, currentUser: CurrentUser) {
    // Admins can assign to others, employees can only assign to themselves
    let assignedUserId = currentUser.id;
    let assignedUserName = currentUser.name || 'Unknown';

    if (this.canViewAll(currentUser)) {
      if (dto.assignedUserId) {
        // Admin assigning to someone else - fetch their name
        const assignedUser = await this.prisma.user.findUnique({
          where: { id: dto.assignedUserId },
          select: { name: true, id: true },
        });
        if (assignedUser) {
          assignedUserId = dto.assignedUserId;
          assignedUserName = assignedUser.name || 'Unknown';
        } else {
          throw new Error(`Assigned user with ID ${dto.assignedUserId} not found`);
        }
      }
    }

    // Validate assignedUserId is set
    if (!assignedUserId) {
      throw new Error('assignedUserId must be set');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        assignedUserId,
        assignedUserName,
        createdById: currentUser.id,
        createdByName: currentUser.name || 'Unknown',
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : undefined,
        priority: dto.priority || 'Medium',
        status: 'Todo',
        progress: 0,
        category: dto.category,
        estimatedHours: dto.estimatedHours,
        tags: dto.tags || [],
        notes: dto.notes,
      },
      include: TASK_INCLUDE,
    });

    // Verify the task was saved correctly by querying it back
    const verifyTask = await this.prisma.task.findUnique({
      where: { id: task.id },
      select: {
        id: true,
        assignedUserId: true,
        assignedUserName: true,
        createdById: true,
        createdByName: true,
      },
    });

    await this.logActivity(
      task.id,
      'TaskCreated',
      `Task "${task.title}" created`,
      currentUser.id,
      currentUser.name || 'Unknown',
      [{ field: 'status', newValue: 'Todo' }],
    );

    this.events.emit('task:created', { taskId: task.id, task, assignedUserId });
    
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, currentUser: CurrentUser) {
    const existing = await this.findById(id);
    this.assertOwnership(existing, currentUser);

    if (existing.status === 'Completed' || existing.status === 'Archived') {
      throw new BadRequestException('Cannot update a completed or archived task');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    const changes: ActivityChange[] = [];

    const track = (field: string, oldValue?: string | number | null, newValue?: string | number | null) => {
      if (String(oldValue ?? '') !== String(newValue ?? '')) {
        changes.push({ field, oldValue, newValue });
      }
    };

    if (dto.title !== undefined) {
      track('title', existing.title, dto.title);
      data.title = dto.title;
    }
    if (dto.description !== undefined) {
      track('description', existing.description, dto.description);
      data.description = dto.description;
    }
    if (dto.dueDate !== undefined) {
      track('dueDate', existing.dueDate?.toISOString() ?? null, dto.dueDate);
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.startDate !== undefined) {
      data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.reminderDate !== undefined) {
      data.reminderDate = dto.reminderDate ? new Date(dto.reminderDate) : null;
    }
    if (dto.priority !== undefined) {
      track('priority', existing.priority, dto.priority);
      data.priority = dto.priority;
    }
    if (dto.category !== undefined) {
      track('category', existing.category, dto.category);
      data.category = dto.category;
    }
    if (dto.assignedUserId !== undefined && dto.assignedUserId !== existing.assignedUserId) {
      // Fetch the new assignee name
      const newAssignee = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
        select: { name: true },
      });
      track('assignedUserId', existing.assignedUserId || '', dto.assignedUserId);
      data.assignedUserId = dto.assignedUserId;
      data.assignedUserName = newAssignee?.name || 'Unknown';
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }
    if (dto.tags !== undefined) {
      data.tags = dto.tags;
    }
    if (dto.estimatedHours !== undefined) {
      data.estimatedHours = dto.estimatedHours;
    }
    if (dto.timeSpent !== undefined) {
      data.timeSpent = dto.timeSpent;
    }

    if (dto.progress !== undefined) {
      const nextProgress = Math.max(0, Math.min(100, dto.progress));
      track('progress', existing.progress, nextProgress);
      data.progress = nextProgress;
      if (nextProgress === 100) {
        data.status = 'Completed';
        data.completedAt = new Date();
        data.completedById = currentUser.id;
        data.completedByName = currentUser.name || 'Unknown';
      }
    }

    if (dto.status !== undefined) {
      const nextStatus = dto.status;
      if (nextStatus === 'Completed') {
        data.status = 'Completed';
        data.completedAt = data.completedAt || new Date();
        data.completedById = data.completedById || currentUser.id;
        data.completedByName = data.completedByName || currentUser.name || 'Unknown';
        data.progress = 100;
      } else if (nextStatus === 'InProgress') {
        data.status = 'InProgress';
        if (!existing.startedAt) data.startedAt = new Date();
      } else {
        data.status = nextStatus;
      }
      track('status', existing.status, nextStatus);
    }

    if (Object.keys(data).length === 0) {
      return existing;
    }

    const task = await this.client.update({
      where: { id },
      data,
      include: TASK_INCLUDE,
    });

    // Log specific activity types for each kind of change
    for (const change of changes) {
      if (change.field === 'status') {
        await this.logActivity(
          id,
          'StatusChanged',
          `Task status changed from ${change.oldValue} to ${change.newValue}`,
          currentUser.id,
          currentUser.name || 'Unknown',
          [change],
        );
      } else if (change.field === 'dueDate') {
        const oldDate = change.oldValue ? new Date(change.oldValue as string).toLocaleDateString() : 'None';
        const newDate = change.newValue ? new Date(change.newValue as string).toLocaleDateString() : 'None';
        await this.logActivity(
          id,
          'DueDateChanged',
          `Due date changed from ${oldDate} to ${newDate}`,
          currentUser.id,
          currentUser.name || 'Unknown',
          [change],
        );
      } else if (change.field === 'priority') {
        await this.logActivity(
          id,
          'PriorityChanged',
          `Priority changed from ${change.oldValue} to ${change.newValue}`,
          currentUser.id,
          currentUser.name || 'Unknown',
          [change],
        );
      } else if (change.field === 'assignedUserId') {
        // Resolve old assignee name
        const oldAssignee = change.oldValue
          ? await this.prisma.user.findUnique({ where: { id: change.oldValue as string }, select: { name: true } })
          : null;
        const oldName = oldAssignee?.name || 'Unassigned';
        const newName = data.assignedUserName || 'Unknown';
        await this.logActivity(
          id,
          'AssignmentChanged',
          `Task assigned from ${oldName} to ${newName}`,
          currentUser.id,
          currentUser.name || 'Unknown',
          [change],
        );
      } else {
        await this.logActivity(
          id,
          'Updated',
          `Task updated: ${change.field}`,
          currentUser.id,
          currentUser.name || 'Unknown',
          [change],
        );
      }
    }

    this.events.emit('task:updated', { taskId: id, task });
    return task;
  }

  async complete(id: string, dto: CompleteTaskDto, currentUser: CurrentUser) {
    const existing = await this.findById(id);
    this.assertOwnership(existing, currentUser);

    if (existing.status === 'Completed' || existing.status === 'Archived') {
      throw new BadRequestException('Task is already completed or archived');
    }

    const task = await this.client.update({
      where: { id },
      data: {
        status: 'Completed',
        completedAt: new Date(),
        completedById: currentUser.id,
        completedByName: currentUser.name || 'Unknown',
        progress: 100,
      },
      include: TASK_INCLUDE,
    });

    const changes: ActivityChange[] = [
      { field: 'status', oldValue: existing.status, newValue: 'Completed' },
      { field: 'progress', oldValue: existing.progress, newValue: 100 },
    ];
    const note = dto.notes?.trim();
    await this.logActivity(
      id,
      'TaskCompleted',
      note ? `Task completed. Note: ${note}` : 'Task completed',
      currentUser.id,
      currentUser.name || 'Unknown',
      changes,
    );

    this.events.emit('task:completed', { taskId: id, task });
    return task;
  }

  async deleteTask(id: string, currentUser: CurrentUser) {
    const existing = await this.findById(id);
    this.assertOwnership(existing, currentUser);

    await super.softDelete(id, currentUser.id);
    await this.logActivity(
      id,
      'Deleted',
      `Task "${existing.title}" deleted`,
      currentUser.id,
      currentUser.name || 'Unknown',
    );

    this.events.emit('task:deleted', { taskId: id });
    return { message: 'Task deleted successfully' };
  }

  async getDashboard(currentUser: CurrentUser) {
    const userId = currentUser.id;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    const weekEnd = new Date(todayEnd);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const baseWhere = { isDeleted: false, assignedUserId: userId };

    const [
      totalTasks,
      pending,
      inProgress,
      completedTasks,
      completedToday,
      overdue,
      dueToday,
      dueTomorrow,
      dueThisWeek,
      completedThisWeek,
      dueThisMonth,
      completedThisMonth,
      currentTask,
      recentCompleted,
      recentActivity,
    ] = await Promise.all([
      this.client.count({ where: baseWhere }),
      this.client.count({ where: { ...baseWhere, status: 'Todo' } }),
      this.client.count({ where: { ...baseWhere, status: 'InProgress' } }),
      this.client.count({ where: { ...baseWhere, status: 'Completed' } }),
      this.client.count({
        where: { ...baseWhere, status: 'Completed', completedAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.client.count({
        where: { ...baseWhere, dueDate: { lt: now }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, dueDate: { gte: todayStart, lte: todayEnd }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, dueDate: { gte: tomorrowStart, lte: tomorrowEnd }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, dueDate: { gte: todayStart, lte: weekEnd }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, status: 'Completed', completedAt: { gte: todayStart, lte: weekEnd } },
      }),
      this.client.count({
        where: { ...baseWhere, dueDate: { gte: monthStart, lte: monthEnd }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, status: 'Completed', completedAt: { gte: monthStart, lte: monthEnd } },
      }),
      this.client.findFirst({
        where: { ...baseWhere, status: 'InProgress' },
        orderBy: { updatedAt: 'desc' },
        include: TASK_INCLUDE,
      }),
      this.client.findMany({
        where: { ...baseWhere, status: 'Completed' },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: TASK_INCLUDE,
      }),
      this.prisma.taskActivityLog.findMany({
        where: {
          task: { isDeleted: false, assignedUserId: userId },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { task: { select: { id: true, title: true } } },
      }),
    ]);

    const weeklyProgress =
      dueThisWeek > 0 ? Math.round((completedThisWeek / dueThisWeek) * 100) : 0;
    const monthlyProgress =
      dueThisMonth > 0 ? Math.round((completedThisMonth / dueThisMonth) * 100) : 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      counts: {
        totalTasks,
        pending,
        inProgress,
        completedTasks,
        completedToday,
        overdue,
        dueToday,
        dueTomorrow,
        dueThisWeek,
      },
      progress: {
        weeklyProgress: Math.max(0, Math.min(100, weeklyProgress)),
        monthlyProgress: Math.max(0, Math.min(100, monthlyProgress)),
        completionRate,
      },
      productivityToday: completedToday,
      currentTask,
      recentCompleted,
      recentActivity,
    };
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
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      dueToday,
      dueThisWeek,
      completedToday,
      completedLate,
      tasksByPriority,
      tasksByStatus,
    ] = await Promise.all([
      this.client.count({ where: baseWhere }),
      this.client.count({ where: { ...baseWhere, status: 'Todo' } }),
      this.client.count({ where: { ...baseWhere, status: 'InProgress' } }),
      this.client.count({ where: { ...baseWhere, status: 'Completed' } }),
      this.client.count({
        where: { ...baseWhere, dueDate: { lt: now }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({ where: { ...baseWhere, dueDate: { gte: todayStart, lte: todayEnd } } }),
      this.client.count({
        where: { ...baseWhere, dueDate: { gte: todayStart, lte: weekEnd }, status: { in: OPEN_STATUSES } },
      }),
      this.client.count({
        where: { ...baseWhere, status: 'Completed', completedAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count
        FROM "Task"
        WHERE "isDeleted" = false
          ${userId ? `AND "assignedUserId" = '${userId}'` : ''}
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

    const completedOnTime = Math.max(0, completedTasks - completedLate);

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      dueToday,
      dueThisWeek,
      dueTomorrow: await this.countDueTomorrow(baseWhere),
      tasksByPriority: priorityMap,
      tasksByStatus: statusMap,
      completedToday,
      completedOnTime,
      completedLate,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  private async countDueTomorrow(baseWhere: any): Promise<number> {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return this.client.count({
      where: { ...baseWhere, dueDate: { gte: start, lte: end }, status: { in: OPEN_STATUSES } },
    });
  }

  async getMyStats(userId: string) {
    return this.getTaskStats(userId);
  }

  async getDashboardKPIs() {
    const now = new Date();

    const [openTasks, overdueTasks, completedToday, completedTasks, completedLateRaw] =
      await Promise.all([
        this.client.count({
          where: { isDeleted: false, status: { in: OPEN_STATUSES } },
        }),
        this.client.count({
          where: {
            isDeleted: false,
            dueDate: { lt: now },
            status: { in: OPEN_STATUSES },
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
        this.prisma.$queryRawUnsafe(`
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
      completedOnTime: Math.max(0, completedTasks - completedLateRaw),
      completedLate: completedLateRaw,
      completionRate:
        completedTasks + openTasks > 0
          ? Math.round((completedTasks / (completedTasks + openTasks)) * 100)
          : 0,
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
        progress: true,
        createdAt: true,
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
          completionRate: 0,
          onTimeCompletionRate: 0,
          averageCompletionTime: 0,
          totalPerformanceScore: 0,
        });
      }
      const emp = employeeMap.get(key);
      emp.tasksAssigned++;

      const now = new Date();
      if (task.status === 'Completed') {
        emp.tasksCompleted++;
        if (task.completedAt && task.dueDate && new Date(task.completedAt) <= new Date(task.dueDate)) {
          emp.onTimeCompletionRate++;
        }
        if (task.completedAt && task.createdAt) {
          const diffMs = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
          emp.averageCompletionTime += diffMs / (1000 * 60 * 60 * 24);
        }
      } else if (OPEN_STATUSES.includes(task.status)) {
        emp.tasksPending++;
        if (task.dueDate && new Date(task.dueDate) < now) {
          emp.tasksOverdue++;
        }
      }
    }

    const performance = Array.from(employeeMap.values()).map((emp) => {
      if (emp.tasksCompleted > 0) {
        emp.completionRate = Math.round((emp.tasksCompleted / emp.tasksAssigned) * 100);
        emp.onTimeCompletionRate = Math.round((emp.onTimeCompletionRate / emp.tasksCompleted) * 100);
        emp.averageCompletionTime = Math.round((emp.averageCompletionTime / emp.tasksCompleted) * 10) / 10;
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

  async getAdminDashboard() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const tomorrowEnd = new Date(todayEnd);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    const performance = await this.getEmployeePerformance();

    const users = await this.prisma.user.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        lastLogin: true,
        avatar: true,
        employeeId: true,
        email: true,
      },
    });

    const perfMap = new Map(performance.map((p: any) => [p.employeeId, p]));

    const taskAgg = await this.prisma.task.groupBy({
      by: ['assignedUserId'],
      where: {
        isDeleted: false,
        assignedUserId: { not: null },
        status: 'Completed',
        completedAt: { gte: todayStart, lte: todayEnd },
      },
      _count: true,
    });
    const completedTodayMap = new Map(taskAgg.map((t: any) => [t.assignedUserId, t._count]));

    const [dueTodayRows, dueTomorrowRows] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          isDeleted: false,
          assignedUserId: { not: null },
          status: { in: OPEN_STATUSES },
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        _count: true,
      }),
      this.prisma.task.groupBy({
        by: ['assignedUserId'],
        where: {
          isDeleted: false,
          assignedUserId: { not: null },
          status: { in: OPEN_STATUSES },
          dueDate: { gte: tomorrowStart, lte: tomorrowEnd },
        },
        _count: true,
      }),
    ]);
    const dueTodayMap = new Map(dueTodayRows.map((t: any) => [t.assignedUserId, t._count]));
    const dueTomorrowMap = new Map(dueTomorrowRows.map((t: any) => [t.assignedUserId, t._count]));

    const employees = users.map((user) => {
      const perf = perfMap.get(user.id) || {
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksPending: 0,
        tasksOverdue: 0,
        completionRate: 0,
        onTimeCompletionRate: 0,
        averageCompletionTime: 0,
        totalPerformanceScore: 0,
        rank: 0,
      };
      const online = !!user.lastLogin && now.getTime() - new Date(user.lastLogin).getTime() < 5 * 60 * 1000;
      return {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        designation: user.designation,
        department: user.department,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        online,
        ...perf,
        completedToday: completedTodayMap.get(user.id) || 0,
        dueToday: dueTodayMap.get(user.id) || 0,
        dueTomorrow: dueTomorrowMap.get(user.id) || 0,
        productivityToday:
          perf.tasksAssigned > 0
            ? Math.round((completedTodayMap.get(user.id) || 0) / perf.tasksAssigned * 100)
            : 0,
      };
    });

    employees.sort((a, b) => (a.online === b.online ? b.totalPerformanceScore - a.totalPerformanceScore : a.online ? -1 : 1));

    return {
      summary: {
        totalEmployees: users.length,
        onlineEmployees: employees.filter((e) => e.online).length,
        totalTasks: await this.client.count({ where: { isDeleted: false } }),
        openTasks: await this.client.count({ where: { isDeleted: false, status: { in: OPEN_STATUSES } } }),
        completedToday: await this.client.count({
          where: { isDeleted: false, status: 'Completed', completedAt: { gte: todayStart, lte: todayEnd } },
        }),
        overdueTasks: await this.client.count({
          where: { isDeleted: false, dueDate: { lt: now }, status: { in: OPEN_STATUSES } },
        }),
      },
      employees,
    };
  }

  private async logActivity(
    taskId: string,
    activityType: string,
    description: string,
    performedBy: string,
    performedByName: string,
    changes?: ActivityChange[],
  ) {
    const activityLog = await this.prisma.taskActivityLog.create({
      data: {
        taskId,
        activityType,
        description,
        performedBy,
        performedByName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: changes && changes.length > 0 ? ({ changes } as any) : undefined,
      },
    });
  }
}
