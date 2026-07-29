import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 25, search } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search && search.length >= 2) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      this.prisma.label.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { tasks: true } } },
      }),
      this.prisma.label.count({ where }),
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

  async create(dto: CreateLabelDto) {
    const existing = await this.prisma.label.findFirst({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException('A label with this name already exists');
    }

    return this.prisma.label.create({
      data: {
        name: dto.name,
        color: dto.color || '#3ABEFF',
      },
    });
  }

  async update(id: string, dto: Partial<CreateLabelDto>) {
    const label = await this.prisma.label.findFirst({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');

    if (dto.name && dto.name !== label.name) {
      const existing = await this.prisma.label.findFirst({
        where: { name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('A label with this name already exists');
      }
    }

    return this.prisma.label.update({
      where: { id },
      data: { name: dto.name, color: dto.color },
    });
  }

  async delete(id: string) {
    const label = await this.prisma.label.findFirst({ where: { id } });
    if (!label) throw new NotFoundException('Label not found');
    return this.prisma.label.delete({ where: { id } });
  }

  async assignToTask(taskId: string, labelIds: string[]) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, isDeleted: false },
    });
    if (!task) throw new NotFoundException('Task not found');

    const labels = await this.prisma.label.findMany({
      where: { id: { in: labelIds } },
    });
    if (labels.length !== labelIds.length) {
      throw new NotFoundException('One or more labels not found');
    }

    const existingAssignments = await this.prisma.taskLabel.findMany({
      where: { taskId, labelId: { in: labelIds } },
    });
    const existingLabelIds = new Set(existingAssignments.map((e) => e.labelId));
    const newLabelIds = labelIds.filter((id) => !existingLabelIds.has(id));

    if (newLabelIds.length > 0) {
      await this.prisma.taskLabel.createMany({
        data: newLabelIds.map((labelId) => ({ taskId, labelId })),
      });
    }

    return this.prisma.taskLabel.findMany({
      where: { taskId },
      include: { label: true },
    });
  }

  async removeFromTask(taskId: string, labelId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, isDeleted: false },
    });
    if (!task) throw new NotFoundException('Task not found');

    const taskLabel = await this.prisma.taskLabel.findFirst({
      where: { taskId, labelId },
    });
    if (!taskLabel) throw new NotFoundException('Label assignment not found');

    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }
}
