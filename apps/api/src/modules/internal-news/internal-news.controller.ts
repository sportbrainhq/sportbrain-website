import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { InternalApiKeyGuard } from '../../common/guards/internal-api-key.guard';
import {
  InternalNewsService,
  type InternalNewsSourceStatus,
  type InternalNewsStatusResponse,
} from './internal-news.service';

/**
 * Internal/ops endpoints for the News Engine, not part of the public API.
 *
 * VERSION_NEUTRAL, matching `HealthController`'s pattern: URI versioning
 * (`VersioningType.URI` with a default version) would otherwise place these
 * under `/v1/...`, but the spec calls for a stable `/internal/...` path that
 * does not move if/when the public API's version changes.
 *
 * Protected by `InternalApiKeyGuard` — see that file's header for the full
 * v1-stopgap caveat: a single shared secret, fails closed if unconfigured.
 * Excluded from rate limiting's default bucket is NOT done here deliberately
 * — the global `ThrottlerGuard` still applies, which is desirable for an
 * endpoint reachable by anyone who obtains the key.
 */
@ApiTags('internal-news')
@ApiHeader({
  name: 'X-Internal-Api-Key',
  description: 'Shared-secret stopgap auth. See InternalApiKeyGuard for the v1 caveat.',
  required: true,
})
@ApiUnauthorizedResponse({
  description: 'Missing/invalid X-Internal-Api-Key, or INTERNAL_API_KEY unconfigured',
})
@UseGuards(InternalApiKeyGuard)
@Controller({ path: 'internal/news', version: VERSION_NEUTRAL })
export class InternalNewsController {
  constructor(private readonly internalNewsService: InternalNewsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Operational status of the RSS News Engine pipeline' })
  @ApiOkResponse({
    description: 'Source health counts, last-hour throughput, pipeline totals and metrics snapshot',
  })
  async status(): Promise<InternalNewsStatusResponse> {
    return this.internalNewsService.getStatus();
  }

  @Get('sources')
  @ApiOperation({ summary: 'Per-source health for every configured news source' })
  @ApiOkResponse({
    description: 'One row per news source with health status and fetch bookkeeping',
  })
  async sources(): Promise<InternalNewsSourceStatus[]> {
    return this.internalNewsService.getSources();
  }
}
