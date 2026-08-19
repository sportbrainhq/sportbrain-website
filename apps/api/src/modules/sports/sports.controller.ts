import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Sport, SportDetail, SportOverview } from '@sportbrain/contracts';
import { SportsService } from './sports.service';

/**
 * Sports endpoints.
 *
 *   GET /v1/sports         the sidebar
 *   GET /v1/sports/:slug   a sport hub, with the counts behind each tab
 */
@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly service: SportsService) {}

  @Get()
  @ApiOperation({ summary: 'List launched sports, in navigation order' })
  @ApiOkResponse({ description: 'Every sport the site currently serves' })
  async list(): Promise<{ data: Sport[] }> {
    // Not paginated, on purpose. There are a handful of sports and the sidebar
    // needs all of them; a page envelope here would be ceremony.
    return { data: await this.service.findAll() };
  }

  /**
   * Registered before `:slug`, or "overview" would be captured as a sport slug.
   * Literal routes must always precede parameterised ones.
   */
  @Get(':slug/overview')
  @ApiOperation({ summary: 'Encyclopedia overview: facts, history, governance, sources' })
  @ApiNotFoundResponse({ description: 'No sport with that slug' })
  async overview(@Param('slug') slug: string): Promise<SportOverview> {
    return this.service.findOverview(slug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Fetch one sport with its tab counts and groupings' })
  @ApiNotFoundResponse({ description: 'No sport with that slug' })
  async bySlug(@Param('slug') slug: string): Promise<SportDetail> {
    return this.service.findBySlug(slug);
  }
}
