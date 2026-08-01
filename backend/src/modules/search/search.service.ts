import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, limit?: number) {
    const searchTerm = query;
    const maxResults = limit || 20;

    if (!searchTerm || searchTerm.length < 2) {
      return { tasks: [], users: [] };
    }

    const perTypeLimit = Math.ceil(maxResults / 3);

    const [tasks, users] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          isDeleted: false,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ],
        },
        select: {
          id: true,
          taskId: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          assignedUserName: true,
          dueDate: true,
        },
        take: perTypeLimit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
        take: perTypeLimit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      tasks,
      users,
      total: tasks.length + users.length,
    };
  }
}
