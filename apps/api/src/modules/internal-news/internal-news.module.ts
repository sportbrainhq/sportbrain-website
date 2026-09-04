import { Module } from '@nestjs/common';
import { InternalNewsController } from './internal-news.controller';
import { InternalNewsRepository } from './internal-news.repository';
import { InternalNewsService } from './internal-news.service';

/**
 * Internal/ops status module for the News Engine (Phase 4).
 *
 * Deliberately separate from `NewsModule` (the public read API): the two
 * have different auth requirements (see `InternalApiKeyGuard`) and different
 * audiences (operators vs. the public frontend), even though they read
 * overlapping tables.
 */
@Module({
  controllers: [InternalNewsController],
  providers: [InternalNewsService, InternalNewsRepository],
})
export class InternalNewsModule {}
