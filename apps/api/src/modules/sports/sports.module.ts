import { Module } from '@nestjs/common';
import { SportsController } from './sports.controller';
import { SportsRepository } from './sports.repository';
import { SportsService } from './sports.service';

/**
 * The sports domain: the root of the site's navigation.
 *
 * `SportsService` is exported because other domains resolve a sport slug to an
 * id before filtering their own queries by it. `SportsRepository` is not, which
 * is what stops another module reaching into this one's SQL.
 */
@Module({
  controllers: [SportsController],
  providers: [SportsService, SportsRepository],
  exports: [SportsService],
})
export class SportsModule {}
