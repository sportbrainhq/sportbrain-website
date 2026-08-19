import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  entityListQuerySchema,
  type EntityListQuery,
  type Paginated,
  type PlayerDetail,
  type PlayerSummary,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { PlayersService } from './players.service';

/**
 * Players, scoped to a sport.
 *
 * The route says "players" while the table says `person`, and the difference is
 * intentional. The schema models one human being who may play and later manage;
 * the website's Players tab is about the playing role, which is the word a
 * reader expects.
 */
@ApiTags('players')
@Controller('sports/:sportSlug/players')
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'List players in a sport' })
  @ApiOkResponse({ description: 'A paginated list of players' })
  async list(
    @Param('sportSlug') sportSlug: string,
    @Query(zodPipe(entityListQuerySchema)) query: EntityListQuery,
  ): Promise<Paginated<PlayerSummary>> {
    return this.service.list(sportSlug, query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Fetch one player with honours, statistics and career' })
  @ApiNotFoundResponse({ description: 'No such player in this sport' })
  async bySlug(
    @Param('sportSlug') sportSlug: string,
    @Param('slug') slug: string,
  ): Promise<PlayerDetail> {
    return this.service.findBySlug(sportSlug, slug);
  }
}
