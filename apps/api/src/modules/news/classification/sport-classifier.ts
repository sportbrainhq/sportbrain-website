import { Injectable, Logger } from '@nestjs/common';
import { SPORT_KEYWORD_RULES } from './sport-keyword-rules';

export interface SportClassificationInput {
  headline: string;
  summary: string | null;
  /** The article's source's configured default sport slug, if any. A strong prior when the source is sport-specific. */
  defaultSportSlug: string | null;
}

export interface SportClassificationResult {
  /** Null only when there is neither a keyword match nor a source default — a genuinely cross-sport/unclassifiable article. */
  sportSlug: string | null;
  /** 0 to 1. */
  confidence: number;
  /** Human-readable reason, useful for debugging and the CLI's manual-review output. */
  reason: string;
}

/**
 * Step 1 of the hybrid classification pipeline (deterministic keyword rules).
 *
 * Combines two signals:
 *   - keyword/phrase matches from `SPORT_KEYWORD_RULES` against headline+summary
 *   - the source's own configured `defaultSportId`, a strong prior since most
 *     sources in this seed list are sport-specific outlets (ESPN FC is always
 *     football, ESPN MMA is always MMA)
 *
 * When keyword evidence and the source default agree, confidence is boosted.
 * When they disagree, the keyword evidence wins if it is strong (weight-sum
 * above `DISAGREEMENT_OVERRIDE_THRESHOLD`), otherwise the source default is
 * trusted over a weak/ambiguous keyword signal. With no keyword evidence at
 * all, the source default is used at a fixed moderate confidence. With
 * neither, the result is null at zero confidence — this is the "no match"
 * case a caller should treat as needing the LLM fallback / manual review.
 */
@Injectable()
export class SportClassifier {
  private readonly logger = new Logger(SportClassifier.name);

  private static readonly DISAGREEMENT_OVERRIDE_THRESHOLD = 1.2;
  private static readonly SOURCE_DEFAULT_ONLY_CONFIDENCE = 0.55;

  classify(input: SportClassificationInput): SportClassificationResult {
    const text = `${input.headline} ${input.summary ?? ''}`.toLowerCase();

    const scoreBySport = new Map<string, number>();
    const matchedPhrasesBySport = new Map<string, string[]>();

    for (const rule of SPORT_KEYWORD_RULES) {
      if (text.includes(rule.phrase)) {
        scoreBySport.set(rule.sportSlug, (scoreBySport.get(rule.sportSlug) ?? 0) + rule.weight);
        const phrases = matchedPhrasesBySport.get(rule.sportSlug) ?? [];
        phrases.push(rule.phrase);
        matchedPhrasesBySport.set(rule.sportSlug, phrases);
      }
    }

    let topSport: string | null = null;
    let topScore = 0;
    for (const [sportSlug, score] of scoreBySport) {
      if (score > topScore) {
        topSport = sportSlug;
        topScore = score;
      }
    }

    if (topSport === null) {
      if (input.defaultSportSlug) {
        return {
          sportSlug: input.defaultSportSlug,
          confidence: SportClassifier.SOURCE_DEFAULT_ONLY_CONFIDENCE,
          reason: `No keyword match; fell back to source default sport "${input.defaultSportSlug}".`,
        };
      }
      return {
        sportSlug: null,
        confidence: 0,
        reason: 'No keyword match and no source default sport.',
      };
    }

    const phrases = matchedPhrasesBySport.get(topSport) ?? [];

    if (input.defaultSportSlug && input.defaultSportSlug === topSport) {
      // Keyword evidence and source default agree: highest confidence.
      const confidence = Math.min(1, 0.75 + topScore * 0.1);
      return {
        sportSlug: topSport,
        confidence,
        reason: `Keyword match (${phrases.join(', ')}) agrees with source default sport.`,
      };
    }

    if (input.defaultSportSlug && input.defaultSportSlug !== topSport) {
      if (topScore >= SportClassifier.DISAGREEMENT_OVERRIDE_THRESHOLD) {
        // Strong keyword evidence overrides a disagreeing source default.
        const confidence = Math.min(0.95, 0.6 + topScore * 0.1);
        this.logger.debug(
          `Keyword evidence for "${topSport}" (score ${topScore}) overrode source default "${input.defaultSportSlug}".`,
        );
        return {
          sportSlug: topSport,
          confidence,
          reason: `Strong keyword match (${phrases.join(', ')}) overrode disagreeing source default "${input.defaultSportSlug}".`,
        };
      }
      // Weak keyword evidence against a real source default: trust the source.
      return {
        sportSlug: input.defaultSportSlug,
        confidence: SportClassifier.SOURCE_DEFAULT_ONLY_CONFIDENCE,
        reason: `Weak keyword match (${phrases.join(', ')}) for "${topSport}" did not override source default "${input.defaultSportSlug}".`,
      };
    }

    // No source default at all: keyword match stands alone.
    const confidence = Math.min(0.9, 0.5 + topScore * 0.1);
    return {
      sportSlug: topSport,
      confidence,
      reason: `Keyword match (${phrases.join(', ')}), no source default to corroborate.`,
    };
  }
}
