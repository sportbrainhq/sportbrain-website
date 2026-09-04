/**
 * Alias/name matching primitive for "does this free text refer to entity X",
 * adapted from `apps/api/src/modules/shared/name-search.ts`.
 *
 * `nameSearch` in that module solves the inverse query shape: a short reader
 *-typed search term tested against a `name`/`aliases` SQL column via
 * `ILIKE`/`unaccent`, built as a Drizzle `SQL` predicate for the database to
 * evaluate. Classification instead needs to test a small, sport-scoped set of
 * candidate entities (already fetched into JS, see
 * `EntityClassificationRepository`) against one long piece of article text,
 * and score every match rather than filter rows — a shape a single SQL
 * predicate cannot produce. Reinventing an independent fuzzy-matching
 * algorithm here would violate the "reuse existing conventions" rule, so this
 * keeps the same normalisation approach `nameSearch` uses (fold accents,
 * case-insensitive, whole-word-ish boundaries) implemented in JS via the
 * same idea `unaccent()` + `ILIKE` expresses in SQL.
 */

/** Folds accents the same way Postgres's `unaccent()` extension does for `nameSearch`, so the two approaches agree on what "the same text" means. */
function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function normalize(value: string): string {
  return foldAccents(value).toLowerCase();
}

/** Escapes a string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface AliasMatch {
  /** The alias or name string that matched. */
  matchedText: string;
  /** Whether the match was against the canonical `name` (stronger signal) or an `aliases` entry. */
  matchedField: 'name' | 'alias';
}

/**
 * Tests whether `candidateName`/`candidateAliases` appears in `text`, mirroring
 * `nameSearch`'s "does a word/phrase from one side appear in the other,
 * accent- and case-insensitively" rule, but for a name appearing inside a
 * longer text rather than a text appearing inside a name column.
 *
 * A whole-word boundary is required (via regex `\b`) so "Man Utd" does not
 * spuriously match on part of some longer unrelated word, mirroring why
 * `nameSearch` splits multi-word terms rather than doing a single blind
 * substring test.
 */
export function findNameMatchInText(
  text: string,
  candidateName: string,
  candidateAliases: string[],
): AliasMatch | null {
  const normalizedText = normalize(text);

  const tryMatch = (raw: string): boolean => {
    const trimmed = raw.trim();
    if (trimmed.length < 3) return false; // Too short to match safely (avoids "US", "A" spurious hits).
    const normalized = normalize(trimmed);
    const pattern = new RegExp(`\\b${escapeRegExp(normalized)}\\b`, 'i');
    return pattern.test(normalizedText);
  };

  if (tryMatch(candidateName)) {
    return { matchedText: candidateName, matchedField: 'name' };
  }

  for (const alias of candidateAliases) {
    if (tryMatch(alias)) {
      return { matchedText: alias, matchedField: 'alias' };
    }
  }

  return null;
}
