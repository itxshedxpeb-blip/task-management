import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 25, search } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.taskTemplate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.taskTemplate.count({ where }),
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

  async findById(id: string) {
    const template = await this.prisma.taskTemplate.findFirst({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(dto: CreateTemplateDto, userId: string) {
    return this.prisma.taskTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        defaults: dto.defaults,
        createdById: userId,
      },
    });
  }

  async update(id: string, dto: Partial<CreateTemplateDto>) {
    await this.findById(id);
    return this.prisma.taskTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        defaults: dto.defaults,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.taskTemplate.delete({ where: { id } });
  }

  async apply(id: string, userId: string, userName: string) {
    const template = await this.findById(id);
    const defaults = template.defaults as Record<string, any>;

    const task = await this.prisma.task.create({
      data: {
        title: defaults.title || `${template.name} - New Task`,
        description: defaults.description,
        assignedUserId: defaults.assignedUserId,
        assignedUserName: defaults.assignedUserName,
        createdById: userId,
        createdByName: userName,
        dueDate: defaults.dueDate ? new Date(defaults.dueDate) : undefined,
        startDate: defaults.startDate ? new Date(defaults.startDate) : undefined,
        priority: defaults.priority || 'Medium',
        status: defaults.status || 'Todo',
        category: defaults.category,
        estimatedHours: defaults.estimatedHours,
        tags: defaults.tags || [],
        notes: defaults.notes,
      },
    });

    await this.prisma.taskTemplate.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });

    return task;
  }
}
