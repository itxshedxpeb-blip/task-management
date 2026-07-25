import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(organizationId: string, from: string, to: string) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId,
        isDeleted: false,
        isArchived: false,
        OR: [
          {
            dueDate: { gte: fromDate, lte: toDate },
          },
          {
            startDate: { gte: fromDate, lte: toDate },
          },
          {
            AND: [
              { startDate: { lte: fromDate } },
              { dueDate: { gte: toDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        taskId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        startDate: true,
        dueDate: true,
        assignedUserId: true,
        assignedUserName: true,
        createdByName: true,
        category: true,
        progress: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const events = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.startDate || task.dueDate,
      end: task.dueDate,
      allDay: true,
      color: this.getEventColor(task.status, task.priority),
      extendedProps: {
        taskId: task.taskId,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedUserName,
        category: task.category,
        progress: task.progress,
      },
    }));

    return events;
  }

  async getRecurringEvents(organizationId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        organizationId,
        isDeleted: false,
        isArchived: false,
        category: 'Meeting',
      },
      select: {
        id: true,
        taskId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        startDate: true,
        dueDate: true,
        assignedUserName: true,
        category: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 50,
    });

    return tasks;
  }

  private getEventColor(status: string, priority: string): string {
    const statusColors: Record<string, string> = {
      Todo: '#6B7280',
      InProgress: '#3B82F6',
      Blocked: '#EF4444',
      Review: '#F59E0B',
      Completed: '#10B981',
      Verified: '#059669',
      Cancelled: '#9CA3AF',
    };

    if (statusColors[status]) return statusColors[status];

    const priorityColors: Record<string, string> = {
      Urgent: '#DC2626',
      High: '#F97316',
      Medium: '#F59E0B',
      Low: '#6B7280',
    };

    return priorityColors[priority] || '#6B7280';
  }
}
