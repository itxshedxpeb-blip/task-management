import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get tasks in date range' })
  async getEvents(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const data = await this.calendarService.getEvents(from, to);
    return { message: 'Calendar events fetched.', data };
  }

  @Get('recurring')
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Get recurring events' })
  async getRecurringEvents() {
    const data = await this.calendarService.getRecurringEvents();
    return { message: 'Recurring events fetched.', data };
  }
}
