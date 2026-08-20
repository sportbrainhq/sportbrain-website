import { and, sql, type Column, type SQL } from 'drizzle-orm';

/**
 * Builds a name predicate for a listing search.
 *
 * Shared by players, teams and competitions because all three had the same
 * `ilike(name, '%term%')` and therefore the same two defects.
 *
 * Accents were fatal. "puskas" matched nothing while "Puskás" matched, and a
 * reader on an English keyboard cannot type the second, so the players most
 * worth searching for were the ones hardest to find. `unaccent` folds both
 * sides; the extension has been installed since the first migration for exactly
 * this and was never used.
 *
 * Multi-word terms failed too. A single `%term%` requires the words to appear
 * together in that order, so "di stefano" missed "Alfredo Di Stéfano" only
 * because of the first name. Each word now has to appear somewhere in one of
 * the columns, which also keeps "sergio ramos" from returning every Sergio.
 *
 * `columns` takes more than one because the name a reader types is not always
 * the stored canonical one: a person has a full name and a display name, and
 * either may be the familiar one.
 */
export function nameSearch(
  term: string,
  columns: [Column, ...Column[]],
  options: { aliases?: Column } = {},
): SQL | undefined {
  const words = term
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    // Capped so a pathological term cannot build an unbounded predicate.
    .slice(0, 6);

  if (words.length === 0) return undefined;

  return and(
    ...words.map((word) => {
      const pattern = `%${word}%`;

      const clauses = columns.map(
        (column) => sql`unaccent(coalesce(${column}, '')) ILIKE unaccent(${pattern})`,
      );

      if (options.aliases) {
        clauses.push(sql`EXISTS (
          SELECT 1 FROM unnest(coalesce(${options.aliases}, ARRAY[]::text[])) AS alias
          WHERE unaccent(alias) ILIKE unaccent(${pattern})
        )`);
      }

      return sql`(${sql.join(clauses, sql` OR `)})`;
    }),
  );
}
