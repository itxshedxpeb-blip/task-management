import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermissions('notification:list')
  @ApiOperation({ summary: 'List notifications for current user' })
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('isRead') isRead?: string,
  ) {
    const data = await this.notificationService.findAll(userId, organizationId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 25,
      isRead,
    });
    return { message: 'Notifications fetched.', data };
  }

  @Get('unread-count')
  @RequirePermissions('notification:list')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.notificationService.getUnreadCount(userId, organizationId);
    return { message: 'Unread count fetched.', data };
  }

  @Patch(':id/read')
  @RequirePermissions('notification:update')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const data = await this.notificationService.markAsRead(id, userId);
    return { message: 'Notification marked as read.', data };
  }

  @Post('read-all')
  @RequirePermissions('notification:update')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    const data = await this.notificationService.markAllAsRead(userId, organizationId);
    return { message: 'All notifications marked as read.', data };
  }
}
