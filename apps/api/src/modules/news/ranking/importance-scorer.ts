import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import { topicImportance } from './topic-importance';

export interface ImportanceScoringInput {
  /** 0 to 1, from `news_sources.trustScore`. */
  sourceTrustScore: number;
  publishedAt: Date;
  now: Date;
  /** Raw `notability` integers (unbounded, see `entity.schema.ts`) of every team/player/competition linked to the article. */
  entityNotabilityScores: number[];
  /** This article's classified topics (`rawMetadata.topics`). */
  topics: string[];
  /** Count of distinct articles in the article's cluster - the "independent sources reporting" signal. */
  clusterSourceCount: number;
}

/**
 * Deterministic v1 importance/ranking score in [0, 10].
 *
 * `computeImportanceScore = sourceAuthority + recency + entityImportance +
 * topicImportance + sourceCount + breakingBonus`, each term the product of
 * a normalised-to-[0,1] factor and a named configurable weight from
 * `config.news.ranking.*` (`NEWS_RANKING_*` env vars), clamped to [0, 10] at
 * the end. Every weight below is a **maximum point contribution**, not a
 * fraction of 1, so the total naturally lands near 10 when all six default
 * weights (2.5 + 2.5 + 2 + 1 + 1.5 + 0.5 = 10) are used unmodified; changing
 * one weight simply shifts how much of that 10-point budget the factor can
 * claim.
 *
 * Factor definitions:
 *
 *   1. Source authority (`sourceAuthorityWeight`, default 2.5 pts):
 *      `sourceTrustScore` (0-1, already the intended editorial signal on
 *      `news_sources`) times the weight, directly. No further transform:
 *      trust score is already a considered 0-1 judgement.
 *
 *   2. Recency (`recencyWeight`, default 2.5 pts): exponential decay,
 *      `2^(-ageHours / halfLifeHours)`, `halfLifeHours` from
 *      `recencyHalfLifeHours` (default 18h). Exponential rather than linear
 *      because news value drops off fast in the first day and then
 *      levels out rather than hitting a hard cliff - a half-life is the
 *      standard, well-understood shape for "matters a lot right now, matters
 *      much less by tomorrow, still matters a little for a while". A
 *      negative age (a clock-skewed or future-dated `publishedAt`) is
 *      clamped to 0 age (full recency credit, not penalised or excluded).
 *
 *   3. Entity importance (`entityImportanceWeight`, default 2 pts): the
 *      article's linked teams/players/competitions' `notability` columns
 *      (see `entity.schema.ts`; reused rather than inventing a new signal,
 *      per the spec's instruction to check for an existing one first),
 *      normalised via `notabilityScore` below, and the *highest* normalised
 *      score among them is used (one genuinely major team/player/competition
 *      should carry the story even if it is co-mentioned with obscure ones,
 *      mirroring the "highest, not average" choice in `topicImportance`).
 *      Zero when the article has no linked team/player/competition entities
 *      (e.g. a governance/business story with only a country link).
 *
 *   4. Topic importance (`topicImportanceWeight`, default 1 pt): the
 *      article's highest-weighted topic per the hand-curated
 *      `topic-importance.ts` table, times the weight.
 *
 *   5. Source count (`sourceCountWeight`, default 1.5 pts): the "multiple
 *      independent publishers are reporting this" signal.
 *      `min(1, (clusterSourceCount - 1) / (SOURCE_COUNT_SATURATION - 1))`,
 *      i.e. one lone article scores 0 on this axis and the score saturates
 *      at `SOURCE_COUNT_SATURATION` (4) distinct sources - beyond four
 *      independent outlets, more corroboration stops meaningfully changing
 *      how important the story is.
 *
 *   6. Breaking bonus (`breakingBonus`, default 0.5 pts): the full bonus
 *      when `'breaking'` is among the article's topics, else 0. Kept as a
 *      flat additive bonus rather than folded into topic importance's
 *      table, because "breaking" is a status (urgency, can combine with any
 *      other topic) rather than one more item in the same ranked list of
 *      topic *kinds*.
 *
 * Not fully AI-driven, per the spec: every factor above is a documented,
 * deterministic function of stored data. There is room to swap in an
 * LLM-derived signal for one factor later without changing this function's
 * shape, but v1 does not do that anywhere.
 */
@Injectable()
export class ImportanceScorer {
  private static readonly NOTABILITY_SATURATION = 40;
  private static readonly SOURCE_COUNT_SATURATION = 4;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  compute(input: ImportanceScoringInput): number {
    const weights = this.config.get('news.ranking', { infer: true });

    const sourceAuthority = input.sourceTrustScore * weights.sourceAuthorityWeight;

    const ageHours = Math.max(
      0,
      (input.now.getTime() - input.publishedAt.getTime()) / (60 * 60 * 1_000),
    );
    const recencyFraction = Math.pow(2, -ageHours / weights.recencyHalfLifeHours);
    const recency = recencyFraction * weights.recencyWeight;

    const entityFraction =
      input.entityNotabilityScores.length === 0
        ? 0
        : Math.max(
            ...input.entityNotabilityScores.map((score) =>
              Math.min(1, Math.max(0, score) / ImportanceScorer.NOTABILITY_SATURATION),
            ),
          );
    const entityImportanceScore = entityFraction * weights.entityImportanceWeight;

    const topicFraction = topicImportance(input.topics);
    const topicImportanceScore = topicFraction * weights.topicImportanceWeight;

    const sourceCountFraction = Math.min(
      1,
      Math.max(0, input.clusterSourceCount - 1) / (ImportanceScorer.SOURCE_COUNT_SATURATION - 1),
    );
    const sourceCount = sourceCountFraction * weights.sourceCountWeight;

    const breakingBonus = input.topics.includes('breaking') ? weights.breakingBonus : 0;

    const total =
      sourceAuthority +
      recency +
      entityImportanceScore +
      topicImportanceScore +
      sourceCount +
      breakingBonus;

    return Math.min(10, Math.max(0, total));
  }
}
