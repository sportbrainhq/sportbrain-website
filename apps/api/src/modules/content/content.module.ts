import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { HighlightsRepository } from './highlights.repository';

/**
 * Editorial content: the half of the product SportBrainHQ owns outright.
 *
 * Exported so entity pages can ask for the stories about a player or team
 * without reaching into this module's repository.
 */
@Module({
  controllers: [ContentController],
  providers: [ContentService, ContentRepository, HighlightsRepository],
  exports: [ContentService],
})
export class ContentModule {}
