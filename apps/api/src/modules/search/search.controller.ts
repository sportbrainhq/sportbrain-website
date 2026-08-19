import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { searchQuerySchema, type SearchQuery, type SearchResult } from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { SearchService } from './search.service';

/**
 * Cross-entity search, powering the header search box.
 *
 * Rate limited more tightly than the default, because a type-ahead search box
 * issues a request per keystroke and is the easiest endpoint on the site to
 * accidentally hammer. The website should also debounce, but the API must not
 * depend on a client behaving well.
 */
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Search teams, players, competitions and venues' })
  @ApiOkResponse({ description: 'Ranked results, prefix matches first' })
  async search(
    @Query(zodPipe(searchQuerySchema)) query: SearchQuery,
  ): Promise<{ data: SearchResult[] }> {
    return { data: await this.service.search(query) };
  }
}
