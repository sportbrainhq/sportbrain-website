import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The migration journal's own consistency.
 *
 * This exists because of a failure that reported success. drizzle applies
 * migrations in the order `idx` gives, but decides which are outstanding by
 * comparing `when`, so an entry that is later by index and earlier by timestamp
 * is skipped in silence. Two migrations written by hand carried round future
 * timestamps, which put the next generated one apparently in the past: its
 * column never reached the database and `db:migrate` printed "Migrations
 * applied."
 *
 * A unit test rather than only a runtime guard, because the runtime guard
 * cannot run in CI without a database and this is a property of the repository.
 */
describe('migration journal', () => {
  const journal = JSON.parse(
    readFileSync(resolve(__dirname, '../../migrations/meta/_journal.json'), 'utf8'),
  ) as { entries: { idx: number; when: number; tag: string }[] };

  it('has timestamps that increase with order', () => {
    const entries = [...journal.entries].sort((a, b) => a.idx - b.idx);

    const inversions = entries
      .slice(1)
      .filter((entry, index) => entry.when <= entries[index]!.when)
      .map((entry) => entry.tag);

    expect(inversions).toEqual([]);
  });

  it('numbers its entries contiguously from zero', () => {
    // A gap means a migration was removed by hand, which leaves the database
    // and the folder disagreeing about what has run.
    const indices = journal.entries.map((entry) => entry.idx).sort((a, b) => a - b);
    expect(indices).toEqual(indices.map((_, position) => position));
  });

  it('names a file for every entry', () => {
    for (const entry of journal.entries) {
      const path = resolve(__dirname, `../../migrations/${entry.tag}.sql`);
      expect(() => readFileSync(path, 'utf8'), `${entry.tag}.sql is missing`).not.toThrow();
    }
  });
});
