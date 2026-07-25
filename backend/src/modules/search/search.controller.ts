import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @RequirePermissions('search:read')
  @ApiOperation({ summary: 'Global search across tasks, users, comments' })
  async search(
    @CurrentUser('organizationId') organizationId: string,
    @Query('q') q: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.searchService.globalSearch(organizationId, q, Number(limit) || 20);
    return { message: 'Search results fetched.', data };
  }
}
