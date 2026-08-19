import { Global, Module } from '@nestjs/common';
import { StatisticsAssembler } from './statistics.assembler';

/**
 * Helpers shared by more than one domain.
 *
 * Global because the statistics assembler is needed by teams, players and
 * competitions alike, and importing it into each would be noise. The bar for
 * adding anything here is that at least two domains genuinely need it: a helper
 * used by one module belongs in that module.
 */
@Global()
@Module({
  providers: [StatisticsAssembler],
  exports: [StatisticsAssembler],
})
export class SharedModule {}
