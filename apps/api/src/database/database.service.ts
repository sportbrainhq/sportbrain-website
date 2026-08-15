import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import type { AppConfig } from '../config';
import * as schema from './schema';

/**
 * Owns the Postgres connection pool and exposes the Drizzle query builder.
 *
 * Every database access in the application goes through the `db` property.
 * Nothing else in the codebase imports `postgres` or opens a connection, so
 * pool sizing, SSL and shutdown are decided in exactly one place.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly client: postgres.Sql;

  /**
   * The Drizzle instance. Typed from the schema barrel, so it currently
   * exposes no tables and will expose them automatically as they are added.
   */
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const database = this.config.get('database', { infer: true });

    this.client = postgres(database.url, {
      max: database.poolMax,
      ssl: database.ssl ? 'require' : false,
      // Fail a stuck connection attempt rather than hanging a request.
      connect_timeout: 10,
      // postgres.js logs notices to console by default; route them through Nest.
      onnotice: (notice) => this.logger.debug(notice.message),
    });

    this.db = drizzle(this.client, { schema });
  }

  /**
   * Verifies connectivity at start-up.
   *
   * Failing here is deliberate: an API that cannot reach its database should
   * not report itself as started, because an orchestrator would route traffic
   * to it and every request would fail.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.ping();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error(
        `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /** Closes the pool so the process can exit cleanly on SIGTERM. */
  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
    this.logger.log('Database connection closed');
  }

  /**
   * Cheapest possible round trip, used by the readiness probe.
   *
   * Returns the elapsed milliseconds so the probe can report latency, which is
   * what turns "the database is up" into "the database is up but slow".
   */
  async ping(): Promise<number> {
    const startedAt = Date.now();
    await this.db.execute(sql`select 1`);
    return Date.now() - startedAt;
  }
}
