import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @RequirePermissions('note:list')
  @ApiOperation({ summary: 'List notes' })
  async findAll(
    @Query('search') search?: string,
    @Query('folder') folder?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const data = await this.notesService.findAll({ search, folder, page: Number(page) || 1, pageSize: Number(pageSize) || 50 });
    return { message: 'Notes fetched.', data };
  }

  @Get(':id')
  @RequirePermissions('note:list')
  @ApiOperation({ summary: 'Get note by ID' })
  async findById(@Param('id') id: string) {
    const data = await this.notesService.findById(id);
    return { message: 'Note fetched.', data };
  }

  @Post()
  @RequirePermissions('note:create')
  @ApiOperation({ summary: 'Create a note' })
  async create(
    @Body() body: { title: string; content?: string; folder?: string; tags?: string[] },
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.notesService.create({ ...body, createdById: userId });
    return { message: 'Note created.', data };
  }

  @Patch(':id')
  @RequirePermissions('note:update')
  @ApiOperation({ summary: 'Update a note' })
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; folder?: string; tags?: string[]; isPinned?: boolean; isArchived?: boolean },
  ) {
    const data = await this.notesService.update(id, body);
    return { message: 'Note updated.', data };
  }

  @Delete(':id')
  @RequirePermissions('note:delete')
  @ApiOperation({ summary: 'Delete a note' })
  async softDelete(@Param('id') id: string) {
    await this.notesService.softDelete(id);
    return { message: 'Note deleted.' };
  }
}
