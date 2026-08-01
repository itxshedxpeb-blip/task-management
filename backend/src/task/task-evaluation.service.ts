import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Task Evaluation Service
 * 
 * Automatically evaluates task statuses at 6:15 PM server time based on business rules:
 * - Office Closing Time: 6:00 PM
 * - Grace Period: 15 minutes
 * - Final Completion Deadline: 6:15 PM
 * 
 * Business Rules:
 * - If completed before 6:15 PM → Completed
 * - If still Draft/InProgress after 6:15 PM → Incomplete
 * - If completed after 6:15 PM → CompletedLate
 * - If a previous day's task is still open → Overdue
 */
@Injectable()
export class TaskEvaluationService {
  private readonly logger = new Logger(TaskEvaluationService.name);
  private readonly OFFICE_CLOSING_HOUR = 18; // 6:00 PM
  private readonly GRACE_PERIOD_MINUTES = 15;
  private readonly FINAL_DEADLINE_MINUTES = 15; // 6:15 PM

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scheduled job to run at 6:15 PM every day
   * Cron expression: 0 15 18 * * * (every day at 6:15 PM)
   */
  @Cron('0 15 18 * * *')
  async evaluateDailyTasks() {
    this.logger.log('Starting daily task evaluation at 6:15 PM');
    
    try {
      await this.evaluateAllTasks();
      this.logger.log('Daily task evaluation completed successfully');
    } catch (error) {
      this.logger.error('Error during daily task evaluation:', error);
    }
  }

  /**
   * Evaluate all tasks and update their statuses based on business rules
   */
  async evaluateAllTasks() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadline = new Date(today);
    deadline.setHours(this.OFFICE_CLOSING_HOUR, this.FINAL_DEADLINE_MINUTES, 0, 0); // 6:15 PM

    // Get all tasks that need evaluation
    const tasksToEvaluate = await this.prisma.task.findMany({
      where: {
        isDeleted: false,
        isArchived: false,
        status: {
          in: ['Draft', 'Todo', 'InProgress', 'OnHold', 'Completed'],
        },
      },
      include: {
        assignee: true,
      },
    });

    this.logger.log(`Found ${tasksToEvaluate.length} tasks to evaluate`);

    for (const task of tasksToEvaluate) {
      await this.evaluateTask(task, deadline, now);
    }
  }

  /**
   * Evaluate a single task and update its status if needed
   */
  private async evaluateTask(
    task: any,
    deadline: Date,
    now: Date,
  ) {
    const taskDate = new Date(task.createdAt);
    const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
    const isToday = taskDay.getTime() === deadline.setHours(0, 0, 0, 0);

    let newStatus: string | null = null;
    let activityDescription = '';

    if (isToday) {
      // Today's tasks
      if (task.status === 'Completed') {
        if (task.completedAt && new Date(task.completedAt) > deadline) {
          // Completed after 6:15 PM
          newStatus = 'CompletedLate';
          activityDescription = 'Task automatically marked as Completed Late (completed after 6:15 PM)';
        }
      } else if (
        task.status === 'Draft' ||
        task.status === 'Todo' ||
        task.status === 'InProgress' ||
        task.status === 'OnHold'
      ) {
        // Still in progress after 6:15 PM
        newStatus = 'Incomplete';
        activityDescription = 'Task automatically marked as Incomplete (not completed by 6:15 PM)';
      }
    } else {
      // Previous day's tasks
      if (
        task.status === 'Draft' ||
        task.status === 'Todo' ||
        task.status === 'InProgress' ||
        task.status === 'OnHold'
      ) {
        // Previous day's task still open
        newStatus = 'Overdue';
        activityDescription = 'Task automatically marked as Overdue (previous day task still open)';
      }
    }

    // Update task status if needed
    if (newStatus && newStatus !== task.status) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          status: newStatus as any,
        },
      });

      // Log activity
      await this.prisma.taskActivityLog.create({
        data: {
          taskId: task.id,
          taskNumber: task.taskId,
          activityType: 'Status Change',
          kind: 'activity',
          description: activityDescription,
          performedBy: task.assignedUserId || task.createdById,
          performedByName: task.assignee?.name || task.createdByName || 'System',
          metadata: {
            oldStatus: task.status,
            newStatus: newStatus,
            evaluatedAt: now.toISOString(),
          },
        },
      });

      this.logger.log(
        `Task ${task.taskId} status updated from ${task.status} to ${newStatus}: ${activityDescription}`,
      );
    }
  }

  /**
   * Manual trigger for testing or on-demand evaluation
   */
  async triggerEvaluation() {
    this.logger.log('Manual task evaluation triggered');
    await this.evaluateAllTasks();
  }
}
