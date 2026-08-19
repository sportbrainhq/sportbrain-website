import { Module } from '@nestjs/common';
import { EnrichmentService } from './ingestion/enrichment.service';
import { EntityResolutionService } from './ingestion/entity-resolution.service';
import { IngestionService } from './ingestion/ingestion.service';
import { WikidataProvider } from './providers/wikidata/wikidata.provider';

/**
 * External data sources and the pipeline that lands them in our schema.
 *
 * The boundary this module enforces is the reason it exists: nothing outside
 * `integrations/` imports a provider adapter, and no provider-shaped type
 * crosses out of it. Domain modules consume canonical rows and never learn which
 * source produced them.
 *
 * That discipline is load-bearing rather than tidy. The cheapest viable
 * commercial provider grants no publication licence and reserves the right to
 * terminate access following a rights-holder complaint, so a swap is likelier
 * than usual and may need to be quick. Keeping the blast radius inside this
 * directory is what makes that a contained piece of work.
 *
 * Adding a provider: implement `SportsDataProvider`, register it here, and
 * declare its capabilities honestly so the scheduler does not spend requests
 * asking for data it cannot return.
 */
@Module({
  providers: [WikidataProvider, EntityResolutionService, IngestionService, EnrichmentService],
  exports: [WikidataProvider, IngestionService, EntityResolutionService, EnrichmentService],
})
export class IntegrationsModule {}
