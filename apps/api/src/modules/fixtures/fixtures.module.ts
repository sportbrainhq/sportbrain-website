import { Module } from '@nestjs/common';
import { EspnProvider } from '../../integrations/providers/fixtures/espn.provider';
import { ErgastProvider } from '../../integrations/providers/fixtures/ergast.provider';
import { TheSportsDbProvider } from '../../integrations/providers/fixtures/thesportsdb.provider';
import { FixturesController } from './fixtures.controller';
import { FixturesService } from './fixtures.service';

/**
 * Live/upcoming/finished fixtures, sourced from external providers rather
 * than our own database (contrast with every other domain module).
 *
 * The providers live under `integrations/providers/fixtures/` rather than
 * this module, in keeping with the boundary `IntegrationsModule` documents:
 * provider-shaped types never cross out of `integrations/`. This module only
 * ever sees `FixturesService`'s normalised output.
 *
 * Adding a sport: implement or reuse a `SportsDataProvider`, add it to the
 * `providersBySport` map in `FixturesService`, done — no controller or
 * contract change needed.
 */
@Module({
  controllers: [FixturesController],
  providers: [FixturesService, EspnProvider, TheSportsDbProvider, ErgastProvider],
  exports: [FixturesService],
})
export class FixturesModule {}
