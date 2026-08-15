/**
 * Drizzle schema barrel.
 *
 * Intentionally empty. The platform foundation defines no tables: sports,
 * players, teams, stories, records and the rest are domain work that has not
 * started, and inventing their tables before the domain model is agreed is how
 * schemas end up with columns nobody can justify.
 *
 * To add a domain table later:
 *
 *   1. Create `src/database/schema/<entity>.schema.ts` defining the table.
 *   2. Re-export it from this file.
 *   3. Run `pnpm db:generate` to produce a migration from the diff.
 *   4. Review the generated SQL by hand before committing it.
 *   5. Run `pnpm db:migrate` to apply.
 *
 * Drizzle infers the database client's types from these exports, so a table is
 * queryable the moment it appears here and invisible until then.
 */

export {};
