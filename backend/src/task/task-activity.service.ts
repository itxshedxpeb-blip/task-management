import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../common/types';
import { CreateTaskActivityDto } from './dto/create-task-activity.dto';
import { UpdateTaskActivityDto } from './dto/update-task-activity.dto';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];

@Injectable()
export class TaskActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify the task exists, is not deleted, and the user has access.
   */
  private async assertTaskAccess(taskId: string, user: CurrentUser) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, isDeleted: false },
      select: { id: true, assignedUserId: true, createdById: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (!isAdmin && task.assignedUserId !== user.id && task.createdById !== user.id) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }

  /**
   * List activities for a task, newest-first, with pagination.
   */
  async listActivities(
    taskId: string,
    user: CurrentUser,
    page = 1,
    limit = 50,
  ) {
    await this.assertTaskAccess(taskId, user);

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.taskActivityLog.findMany({
        where: { taskId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.taskActivityLog.count({ where: { taskId } }),
    ]);

    return {
      rows,
      pagination: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get a single activity by ID.
   */
  async getActivity(taskId: string, activityId: string, user: CurrentUser) {
    await this.assertTaskAccess(taskId, user);

    const activity = await this.prisma.taskActivityLog.findFirst({
      where: { id: activityId, taskId },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  /**
   * Create a new activity / follow-up record.
   */
  async createActivity(
    taskId: string,
    dto: CreateTaskActivityDto,
    user: CurrentUser,
  ) {
    await this.assertTaskAccess(taskId, user);

    if (!dto.description || dto.description.trim().length === 0) {
      throw new BadRequestException('Description is required');
    }

    // Get current task progress for metadata
    const currentTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { progress: true, status: true },
    });
    const previousProgress = currentTask?.progress ?? 0;

    // Build activity metadata with progress change info
    const metadata: Record<string, unknown> = {};
    if (dto.progress !== undefined) {
      metadata.progress = dto.progress;
      if (dto.progress !== previousProgress) {
        metadata.progressChange = { from: previousProgress, to: dto.progress };
      }
    }
    if (dto.status) {
      metadata.statusChange = { from: currentTask?.status, to: dto.status };
    }

    const activity = await this.prisma.taskActivityLog.create({
      data: {
        taskId,
        activityType: dto.activityType,
        description: dto.description.trim(),
        performedBy: user.id,
        performedByName: user.name || 'Unknown',
        nextFollowUpDate: dto.nextFollowUpDate || null,
        nextFollowUpTime: dto.nextFollowUpTime || null,
        nextFollowUpAction: dto.nextFollowUpAction || null,
        taskStatus: dto.status || null,
        metadata: Object.keys(metadata).length > 0 ? (metadata as any) : undefined,
      },
    });

    // Build task update data
    const taskUpdateData: Record<string, unknown> = {};

    // Handle progress update
    if (dto.progress !== undefined) {
      const clampedProgress = Math.max(0, Math.min(100, dto.progress));
      taskUpdateData.progress = clampedProgress;
    }

    // Handle status change
    if (dto.status) {
      taskUpdateData.status = dto.status;
      if (dto.status === 'Completed') {
        taskUpdateData.completedAt = new Date();
        taskUpdateData.completedById = user.id;
        taskUpdateData.completedByName = user.name || 'Unknown';
        taskUpdateData.progress = 100;
      }
      if (dto.status === 'InProgress' && currentTask?.status !== 'InProgress') {
        taskUpdateData.startedAt = new Date();
      }
    }

    // Apply task update if there are changes
    if (Object.keys(taskUpdateData).length > 0) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: taskUpdateData,
      });
    }

    return activity;
  }

  /**
   * Update an existing activity (audit-safe: preserves created_at, created_by).
   */
  async updateActivity(
    taskId: string,
    activityId: string,
    dto: UpdateTaskActivityDto,
    user: CurrentUser,
  ) {
    const task = await this.assertTaskAccess(taskId, user);

    const existing = await this.prisma.taskActivityLog.findFirst({
      where: { id: activityId, taskId },
    });
    if (!existing) throw new NotFoundException('Activity not found');

    // Only admins or the original creator can edit
    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (!isAdmin && existing.performedBy !== user.id) {
      throw new ForbiddenException('You can only edit your own activities');
    }

    const activity = await this.prisma.taskActivityLog.update({
      where: { id: activityId },
      data: {
        ...(dto.description !== undefined && { description: dto.description.trim() }),
        ...(dto.activityType !== undefined && { activityType: dto.activityType }),
        ...(dto.nextFollowUpDate !== undefined && { nextFollowUpDate: dto.nextFollowUpDate || null }),
        ...(dto.nextFollowUpTime !== undefined && { nextFollowUpTime: dto.nextFollowUpTime || null }),
        ...(dto.nextFollowUpAction !== undefined && { nextFollowUpAction: dto.nextFollowUpAction || null }),
        ...(dto.status !== undefined && { taskStatus: dto.status || null }),
      },
    });

    return activity;
  }

  /**
   * Delete an activity (admin-only, or creator if employee).
   */
  async deleteActivity(
    taskId: string,
    activityId: string,
    user: CurrentUser,
  ) {
    await this.assertTaskAccess(taskId, user);

    const existing = await this.prisma.taskActivityLog.findFirst({
      where: { id: activityId, taskId },
    });
    if (!existing) throw new NotFoundException('Activity not found');

    // Only admins can delete; employees can only delete their own
    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (!isAdmin && existing.performedBy !== user.id) {
      throw new ForbiddenException('You can only delete your own activities');
    }

    await this.prisma.taskActivityLog.delete({
      where: { id: activityId },
    });

    return { message: 'Activity deleted successfully' };
  }

  /**
   * Get the next upcoming follow-up for a task (for task list indicators).
   */
  async getNextFollowUp(taskId: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const followUp = await this.prisma.taskActivityLog.findFirst({
      where: {
        taskId,
        nextFollowUpDate: { not: null, gte: today },
      },
      orderBy: { nextFollowUpDate: 'asc' },
      select: {
        id: true,
        nextFollowUpDate: true,
        nextFollowUpTime: true,
        nextFollowUpAction: true,
      },
    });

    return followUp || null;
  }

  /**
   * Bulk get next follow-ups for multiple tasks (for task list).
   */
  async getNextFollowUps(taskIds: string[]) {
    const today = new Date().toISOString().split('T')[0];

    const followUps = await this.prisma.taskActivityLog.findMany({
      where: {
        taskId: { in: taskIds },
        nextFollowUpDate: { not: null, gte: today },
      },
      orderBy: { nextFollowUpDate: 'asc' },
      select: {
        taskId: true,
        nextFollowUpDate: true,
        nextFollowUpTime: true,
        nextFollowUpAction: true,
      },
    });

    // Deduplicate: only keep the earliest per task
    const map = new Map<string, typeof followUps[0]>();
    for (const fu of followUps) {
      if (!map.has(fu.taskId)) {
        map.set(fu.taskId, fu);
      }
    }
    return Object.fromEntries(map);
  }
}
