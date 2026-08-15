import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';

/**
 * Repository layer: the only place in a domain that touches the database.
 *
 * Everything else in the module works with plain objects, which is what makes
 * a service testable without a running Postgres.
 *
 * Three rules that matter more than they look:
 *
 *   1. All SQL lives here. A service that builds a query cannot be unit tested.
 *   2. Public reads filter to published rows, in this layer. Doing it per
 *      controller means one forgotten filter leaks a draft to the public site.
 *   3. Return domain objects, not raw driver rows. The shape crossing this
 *      boundary is the module's own, so a schema change stays local.
 */
@Injectable()
export class ExampleRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * A real repository method looks like this:
   *
   * ```ts
   * async findBySlug(slug: string): Promise<Example | null> {
   *   const [row] = await this.database.db
   *     .select()
   *     .from(example)
   *     .where(and(eq(example.slug, slug), eq(example.publicationStatus, 'published')))
   *     .limit(1);
   *
   *   return row ?? null;
   * }
   * ```
   *
   * The `publicationStatus` predicate is rule 2 above: it belongs in the query,
   * not in the caller.
   *
   * `this.database.db` is the Drizzle instance. It is typed from
   * `src/database/schema/index.ts`, which is currently empty, so no table is
   * addressable until one is defined there.
   */
  async findAll(): Promise<never[]> {
    // No tables exist yet, so there is nothing to select from. The round trip
    // is here only to demonstrate that `this.database.db` is the injected
    // Drizzle instance and to keep the dependency genuinely used.
    // See src/database/schema/index.ts.
    await this.database.db.execute(sql`select 1`);
    return [];
  }
}
