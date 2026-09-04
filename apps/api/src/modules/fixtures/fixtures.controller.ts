import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Fixture, TodayBucket } from '@sportbrain/contracts';
import { FixturesService } from './fixtures.service';

/**
 * Live/upcoming/finished fixtures.
 *
 *   GET /v1/fixtures/:sport/today
 *   GET /v1/fixtures/:sport/competitions/:competitionRef?window=past|next
 *
 * Read-through against provider APIs behind a cache — nothing here is stored
 * in our own database yet. See `FixturesService` for provider routing and
 * `TodayBucket.possiblyIncomplete` for why "today" is never claimed as
 * exhaustive.
 */
@ApiTags('fixtures')
@Controller('fixtures')
export class FixturesController {
  constructor(private readonly service: FixturesService) {}

  @Get(':sport/today')
  @ApiOperation({ summary: "Today's live, upcoming and finished fixtures for one sport" })
  @ApiOkResponse({ description: 'Bucketed fixtures, with a completeness flag' })
  async today(@Param('sport') sport: string): Promise<TodayBucket> {
    return this.service.today(sport);
  }

  @Get(':sport/competitions/:competitionRef')
  @ApiOperation({ summary: "One competition's recent results or upcoming fixtures" })
  @ApiQuery({ name: 'window', enum: ['past', 'next'], required: false })
  @ApiOkResponse({ description: 'Fixture list for the competition' })
  async competitionFixtures(
    @Param('sport') sport: string,
    @Param('competitionRef') competitionRef: string,
    @Query('window') window: 'past' | 'next' = 'next',
  ): Promise<{ data: Fixture[] }> {
    return { data: await this.service.competitionFixtures(sport, competitionRef, window) };
  }
}
