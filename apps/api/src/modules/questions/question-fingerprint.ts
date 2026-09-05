import { createHash } from 'node:crypto';

/**
 * Text normalization and fingerprinting for exact-duplicate detection (Part
 * 7.1). Pure functions, no I/O — kept out of the service so the validation
 * pipeline and the repository's pre-insert check always compute the same
 * fingerprint from the same rule, rather than each having its own idea of
 * "normalized."
 */

/**
 * Lowercase, trim, collapse internal whitespace, and normalize common
 * punctuation variants (curly quotes, em/en dashes) to their plain
 * equivalents so two questions differing only in how they were typed collapse
 * to the same normalized form. Unicode-normalized (NFKC) so visually
 * identical characters compiled from different code points do not evade the
 * fingerprint.
 */
export function normalizeQuestionText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”‟]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** SHA-256(sportId + normalizedQuestionText) — the unique key `question_fingerprint_idx` enforces. */
export function computeQuestionFingerprint(
  sportId: string,
  normalizedQuestionText: string,
): string {
  return createHash('sha256').update(`${sportId}:${normalizedQuestionText}`).digest('hex');
}
