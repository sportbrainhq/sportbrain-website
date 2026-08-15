import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Throttle } from '@nestjs/throttler';
import type { HealthResponse, LivenessResponse } from '@sportbrain/contracts';
import type { AppConfig } from '../config';
import { DatabaseHealthIndicator } from './database.health';

/**
 * Health endpoints.
 *
 * The three are genuinely different questions and are answered separately:
 *
 *   /health/liveness   Is the process alive?      Restart if not.
 *   /health/readiness  Can it serve traffic now?  Remove from the pool if not.
 *   /health            Human-readable summary.    For dashboards and humans.
 *
 * Conflating liveness with readiness is the classic error: it turns a
 * transient database outage into a restart loop across every replica.
 */
@ApiTags('health')
// VERSION_NEUTRAL keeps these off the /v1 prefix. Excluding the paths from the
// global prefix is not enough on its own: URI versioning would still place them
// at /v1/health. Probes must sit at a stable root path, because an orchestrator
// or uptime monitor should not have to track the API's versioning scheme.
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Overall service health summary' })
  @ApiOkResponse({ description: 'Service status, version and dependency checks' })
  async overall(): Promise<HealthResponse> {
    const result = await this.health.check([() => this.database.isHealthy('database')]);

    return {
      status: result.status === 'ok' ? 'ok' : 'error',
      service: 'sportbrain-api',
      version: process.env.npm_package_version ?? '0.1.0',
      environment: this.config.get('env', { infer: true }),
      uptimeSeconds: this.uptimeSeconds(),
      timestamp: new Date().toISOString(),
      checks: Object.fromEntries(
        Object.entries(result.details).map(([key, value]) => [
          key,
          {
            status: value.status === 'up' ? ('up' as const) : ('down' as const),
            responseTimeMs:
              typeof value.responseTimeMs === 'number' ? value.responseTimeMs : undefined,
            message: typeof value.message === 'string' ? value.message : undefined,
          },
        ]),
      ),
    };
  }

  @Get('liveness')
  @Throttle({ default: { limit: 0, ttl: 0 } })
  @ApiOperation({ summary: 'Liveness probe: is the process running?' })
  @ApiOkResponse({ description: 'The process is alive' })
  liveness(): LivenessResponse {
    // Checks nothing external, on purpose. See the class comment.
    return {
      status: 'ok',
      uptimeSeconds: this.uptimeSeconds(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  @Throttle({ default: { limit: 0, ttl: 0 } })
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe: can this instance serve traffic?' })
  @ApiOkResponse({ description: 'Every dependency is reachable' })
  @ApiServiceUnavailableResponse({ description: 'A dependency is unreachable' })
  async readiness() {
    // Terminus returns 503 automatically when any indicator is down.
    return this.health.check([() => this.database.isHealthy('database')]);
  }

  private uptimeSeconds(): number {
    return Math.floor((Date.now() - this.startedAt) / 1_000);
  }
}
