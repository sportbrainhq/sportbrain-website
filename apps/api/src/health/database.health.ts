import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';

/**
 * Reports Postgres connectivity to the readiness probe.
 *
 * Reports latency on success, which is what distinguishes a healthy database
 * from one that is technically reachable but about to cause timeouts.
 */
@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly database: DatabaseService,
    private readonly indicator: HealthIndicatorService,
  ) {}

  async isHealthy(key = 'database'): Promise<HealthIndicatorResult> {
    const check = this.indicator.check(key);

    try {
      const responseTimeMs = await this.database.ping();
      return check.up({ responseTimeMs });
    } catch (error) {
      // The message is safe to expose: it says the database is unreachable,
      // not where it lives or what credentials were used.
      return check.down({
        message: error instanceof Error ? error.message : 'Database unreachable',
      });
    }
  }
}
