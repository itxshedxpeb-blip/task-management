import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 25, search } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { members: true } },
        },
      }),
      this.prisma.department.count({ where }),
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
    const department = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        },
      },
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: { name: dto.name, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException('A department with this name already exists');
    }

    return this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description,
        managerId: dto.managerId,
      },
    });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
    });
    if (!department) throw new NotFoundException('Department not found');

    if (dto.name && dto.name !== department.name) {
      const existing = await this.prisma.department.findFirst({
        where: { name: dto.name, isDeleted: false, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('A department with this name already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        managerId: dto.managerId,
        isActive: dto.isActive,
      },
    });
  }

  async delete(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
    });
    if (!department) throw new NotFoundException('Department not found');

    return this.prisma.department.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async addMember(id: string, userId: string, role: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
    });
    if (!department) throw new NotFoundException('Department not found');

    const existingMember = await this.prisma.departmentMember.findUnique({
      where: { departmentId_userId: { departmentId: id, userId } },
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member of this department');
    }

    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.departmentMember.create({
      data: {
        departmentId: id,
        userId,
        role: role || 'member',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async removeMember(id: string, userId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
    });
    if (!department) throw new NotFoundException('Department not found');

    const member = await this.prisma.departmentMember.findUnique({
      where: { departmentId_userId: { departmentId: id, userId } },
    });
    if (!member) throw new NotFoundException('Member not found in this department');

    return this.prisma.departmentMember.delete({
      where: { departmentId_userId: { departmentId: id, userId } },
    });
  }
}
