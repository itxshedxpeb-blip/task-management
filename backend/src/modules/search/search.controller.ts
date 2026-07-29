import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @RequirePermissions('task:list')
  @ApiOperation({ summary: 'Global search across tasks, users, comments' })
  async search(
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.searchService.globalSearch(q, Number(limit) || 20);
    return { message: 'Search results fetched.', data };
  }
}
