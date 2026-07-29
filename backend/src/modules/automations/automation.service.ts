import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutomationDto } from './dto/create-automation.dto';

@Injectable()
export class AutomationService {
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
      this.prisma.automationRule.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.automationRule.count({ where }),
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
    const rule = await this.prisma.automationRule.findFirst({ where: { id } });
    if (!rule) throw new NotFoundException('Automation rule not found');
    return rule;
  }

  async create(dto: CreateAutomationDto) {
    return this.prisma.automationRule.create({
      data: {
        name: dto.name,
        trigger: dto.trigger,
        conditions: dto.conditions,
        actions: dto.actions,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateAutomationDto>) {
    await this.findById(id);
    return this.prisma.automationRule.update({
      where: { id },
      data: {
        name: dto.name,
        trigger: dto.trigger,
        conditions: dto.conditions,
        actions: dto.actions,
        isActive: dto.isActive,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.automationRule.delete({ where: { id } });
  }

  async toggle(id: string) {
    const rule = await this.findById(id);
    return this.prisma.automationRule.update({
      where: { id },
      data: { isActive: !rule.isActive },
    });
  }
}
