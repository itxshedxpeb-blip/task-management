import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; search?: string; folder?: string }) {
    const { page = 1, pageSize = 50, search, folder } = query;
    const skip = (page - 1) * pageSize;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };
    if (search && search.length >= 2) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (folder) where.folder = folder;

    const [rows, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),
      this.prisma.note.count({ where }),
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
    const note = await this.prisma.note.findFirst({
      where: { id, isDeleted: false },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async create(data: { title: string; content?: string; createdById: string; folder?: string; tags?: string[] }) {
    return this.prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        createdById: data.createdById,
        folder: data.folder || '/',
        tags: data.tags || [],
      },
    });
  }

  async update(id: string, data: { title?: string; content?: string; folder?: string; tags?: string[]; isPinned?: boolean; isArchived?: boolean }) {
    const existing = await this.prisma.note.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new NotFoundException('Note not found');
    return this.prisma.note.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    const existing = await this.prisma.note.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new NotFoundException('Note not found');
    return this.prisma.note.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
  }
}
