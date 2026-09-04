/**
 * Pairwise similarity primitives for cross-source story clustering.
 *
 * Different publishers report the same real-world event with different
 * words ("Arsenal complete signing of Player X" vs "Arsenal confirm Player X
 * transfer" vs "Player X joins Arsenal"). No single signal reliably tells
 * those apart from two genuinely different stories about the same club, so
 * `combinedSimilarity` blends three independent, cheap-to-compute signals:
 *
 *   - headline text similarity (do the words overlap)
 *   - entity overlap (do they name the same teams/players/competitions)
 *   - publication time proximity (did they appear close together)
 *
 * v1 deliberately stays inside Postgres/JS: no embeddings, no vector
 * database. `headlineSimilarity`'s token-set approach is the part most
 * likely to be swapped for a pgvector cosine-similarity lookup later: it is
 * kept as a pure function of two strings with no other dependency, so
 * swapping its internals (or replacing the whole function with an embedding
 * lookup upstream of it) does not touch `entityOverlap`, `timeProximity` or
 * `combinedSimilarity`.
 */

/**
 * Small, deliberately generic English stopword list for headline comparison.
 *
 * Not the topic/entity keyword tables elsewhere in `modules/news/classification`,
 * which match *specific* sport phrases; this is the opposite job, stripping
 * *common* words so two headlines are compared on their distinctive content
 * ("Arsenal", "Player X", "transfer") rather than scored similar merely for
 * sharing "the", "a", "in".
 */
const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'by',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'as',
  'it',
  'his',
  'her',
  'their',
  'its',
  'this',
  'that',
  'after',
  'before',
  'into',
  'over',
  'up',
  'out',
]);

/** Folds accents the same way `text-entity-matching.ts` does, so headline comparison agrees with entity matching on what "the same text" means. */
function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Normalises a headline into a token set: lowercased, accent-folded,
 * punctuation stripped, split on whitespace, stopwords and empty tokens
 * dropped. A `Set` (not a bag/multiset) because headline comparison cares
 * whether a distinctive word is *present*, not how many times a short
 * headline happens to repeat it.
 */
function tokenize(headline: string): Set<string> {
  const cleaned = foldAccents(headline)
    .toLowerCase()
    .replace(/['’]/g, '') // "Arsenal's" -> "arsenals", kept as one token rather than split
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = cleaned
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));

  return new Set(tokens);
}

/**
 * Normalised headline similarity in [0, 1], via Jaccard similarity
 * (intersection / union) of each headline's stopword-stripped token set.
 *
 * Chosen over an edit-distance ratio because word order varies a lot between
 * outlets covering the same story ("Arsenal complete signing of Player X"
 * vs "Player X joins Arsenal") while the *set* of distinctive words
 * ("arsenal", "player", "x", "signing"/"joins") stays close; edit distance
 * would penalise reordering it should not care about. Token-set Jaccard is
 * dependency-free, symmetric, and cheap enough to run against every
 * candidate cluster's representative headline.
 *
 * Two empty token sets (e.g. both headlines are pure punctuation) are
 * treated as similarity 0, not 1: there is no positive evidence they are the
 * same story.
 */
export function headlineSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionSize = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersectionSize++;
  }

  const unionSize = tokensA.size + tokensB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Jaccard overlap in [0, 1] of two articles' linked entity id sets.
 *
 * `entityType: 'sport'` links are excluded before this function even sees
 * the sets (see `ClusteringRepository.findArticleEntityIds`), rather than
 * filtered here, because "same sport" is true for the overwhelming majority
 * of candidate pairs compared (candidates are already scoped to the same
 * `sportId`, see `findCandidateClusters`) and would otherwise inflate every
 * comparison by a near-constant amount, diluting the signal that actually
 * distinguishes one story from another: shared teams, players,
 * competitions and countries.
 */
export function entityOverlap(
  articleAEntityIds: Set<string>,
  articleBEntityIds: Set<string>,
): number {
  if (articleAEntityIds.size === 0 || articleBEntityIds.size === 0) return 0;

  let intersectionSize = 0;
  for (const id of articleAEntityIds) {
    if (articleBEntityIds.has(id)) intersectionSize++;
  }

  const unionSize = articleAEntityIds.size + articleBEntityIds.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

const MS_PER_HOUR = 60 * 60 * 1_000;

/**
 * Time proximity in [0, 1]: 1.0 for two articles published at the same
 * instant, decaying linearly to 0 at `windowHours` apart and staying 0
 * beyond it.
 *
 * Linear rather than exponential decay: a multi-day transfer saga
 * genuinely produces follow-up coverage days apart that is still the same
 * story, so the curve should not punish a late arrival too harshly as long
 * as it is inside the window at all; a hard cutoff at `windowHours` (rather
 * than an asymptotic exponential tail that never quite reaches 0) keeps the
 * "same story" judgement bounded and easy to reason about. `windowHours` is
 * `news.clustering.timeWindowHours`, defaulting to 72h, chosen because a
 * transfer breaking Friday evening is still routinely being reported and
 * confirmed by other outlets into the following Monday.
 */
export function timeProximity(publishedAtA: Date, publishedAtB: Date, windowHours: number): number {
  if (windowHours <= 0) return publishedAtA.getTime() === publishedAtB.getTime() ? 1 : 0;

  const deltaHours = Math.abs(publishedAtA.getTime() - publishedAtB.getTime()) / MS_PER_HOUR;
  if (deltaHours >= windowHours) return 0;

  return 1 - deltaHours / windowHours;
}

export interface SimilarityWeights {
  headlineWeight: number;
  entityWeight: number;
  timeWeight: number;
}

export interface CombinedSimilarityInput {
  headlineA: string;
  headlineB: string;
  entityIdsA: Set<string>;
  entityIdsB: Set<string>;
  publishedAtA: Date;
  publishedAtB: Date;
  timeWindowHours: number;
  weights: SimilarityWeights;
}

/**
 * Weighted combination of the three signals above, per the spec's
 * "headline similarity 50%, entity overlap 30%, time proximity 20%"
 * starting point. The weights are named configurable constants sourced from
 * `config.news.clustering.{headlineWeight,entityWeight,timeWeight}`
 * (`NEWS_CLUSTERING_*_WEIGHT` env vars) rather than hardcoded here, so tuning
 * them is an env change, not a code change.
 */
export function combinedSimilarity(input: CombinedSimilarityInput): number {
  const headline = headlineSimilarity(input.headlineA, input.headlineB);
  const entity = entityOverlap(input.entityIdsA, input.entityIdsB);
  const time = timeProximity(input.publishedAtA, input.publishedAtB, input.timeWindowHours);

  const { headlineWeight, entityWeight, timeWeight } = input.weights;

  return headline * headlineWeight + entity * entityWeight + time * timeWeight;
}
