import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  newsListQuerySchema,
  type CursorPaginated,
  type NewsArticleDetail,
  type NewsArticleSummary,
  type NewsListQuery,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { NewsService } from './news.service';

/**
 * The public read surface of the News Engine.
 *
 * Only `processingStatus = 'published'` articles are ever reachable here; see
 * `NewsRepository.findPublished`. There is no write endpoint in this module:
 * ingestion (the fetcher, classifier, clustering) is a later phase and writes
 * directly via its own pipeline, not through this controller.
 */
@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'List published news articles, newest first' })
  @ApiOkResponse({ description: 'A cursor-paginated list of articles' })
  async list(
    @Query(zodPipe(newsListQuerySchema)) query: NewsListQuery,
  ): Promise<CursorPaginated<NewsArticleSummary>> {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one published article' })
  @ApiNotFoundResponse({ description: 'No such published article' })
  async byId(@Param('id') id: string): Promise<NewsArticleDetail> {
    return this.service.findById(id);
  }
}
