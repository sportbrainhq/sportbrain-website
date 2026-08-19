import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  entityListQuerySchema,
  type EntityListQuery,
  type Paginated,
  type TeamDetail,
  type TeamSummary,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { TeamsService } from './teams.service';

/**
 * Teams, always scoped to a sport.
 *
 * Nesting under `/sports/:sportSlug` rather than exposing a flat `/teams` is
 * deliberate: a team only means something within its sport, slugs are unique
 * per sport rather than globally, and the URL then matches the site's
 * navigation exactly.
 */
@ApiTags('teams')
@Controller('sports/:sportSlug/teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'List teams in a sport, filterable by kind and country' })
  @ApiOkResponse({ description: 'A paginated list of teams' })
  async list(
    @Param('sportSlug') sportSlug: string,
    @Query(zodPipe(entityListQuerySchema)) query: EntityListQuery,
  ): Promise<Paginated<TeamSummary>> {
    return this.service.list(sportSlug, query);
  }

  /**
   * Registered before `:slug`, or "countries" would be captured as a team slug.
   * Literal routes must always precede parameterised ones.
   */
  @Get('countries')
  @ApiOperation({ summary: 'Distinct countries with teams in this sport' })
  async countries(@Param('sportSlug') sportSlug: string): Promise<{ data: string[] }> {
    return { data: await this.service.countries(sportSlug) };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Fetch one team with its honours and statistics' })
  @ApiNotFoundResponse({ description: 'No such team in this sport' })
  async bySlug(
    @Param('sportSlug') sportSlug: string,
    @Param('slug') slug: string,
  ): Promise<TeamDetail> {
    return this.service.findBySlug(sportSlug, slug);
  }
}
