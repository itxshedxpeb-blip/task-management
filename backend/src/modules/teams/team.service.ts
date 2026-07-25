import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: { page?: number; pageSize?: number; search?: string }) {
    const { page = 1, pageSize = 25, search } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { organizationId, isDeleted: false };
    if (search && search.length >= 2) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { members: true } },
          department: { select: { id: true, name: true } },
        },
      }),
      this.prisma.team.count({ where }),
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

  async findById(id: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId, isDeleted: false },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        },
        department: { select: { id: true, name: true } },
      },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async create(dto: CreateTeamDto, organizationId: string) {
    const existing = await this.prisma.team.findFirst({
      where: { organizationId, name: dto.name, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException('A team with this name already exists');
    }

    return this.prisma.team.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        departmentId: dto.departmentId,
        leadId: dto.leadId,
      },
    });
  }

  async update(id: string, dto: UpdateTeamDto, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId, isDeleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');

    if (dto.name && dto.name !== team.name) {
      const existing = await this.prisma.team.findFirst({
        where: { organizationId, name: dto.name, isDeleted: false, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('A team with this name already exists');
      }
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        departmentId: dto.departmentId,
        leadId: dto.leadId,
        isActive: dto.isActive,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId, isDeleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');

    return this.prisma.team.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async addMember(id: string, userId: string, role: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId, isDeleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');

    const existingMember = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId } },
    });
    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
    });
    if (!user) throw new NotFoundException('User not found in this organization');

    return this.prisma.teamMember.create({
      data: {
        teamId: id,
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

  async removeMember(id: string, userId: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, organizationId, isDeleted: false },
    });
    if (!team) throw new NotFoundException('Team not found');

    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: id, userId } },
    });
    if (!member) throw new NotFoundException('Member not found in this team');

    return this.prisma.teamMember.delete({
      where: { teamId_userId: { teamId: id, userId } },
    });
  }
}
