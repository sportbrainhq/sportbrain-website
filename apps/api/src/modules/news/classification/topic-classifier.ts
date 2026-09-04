import { Injectable } from '@nestjs/common';
import type { NewsTopic } from '@sportbrain/contracts';
import { TOPIC_KEYWORD_RULES } from './topic-keyword-rules';

export interface TopicClassificationInput {
  headline: string;
  summary: string | null;
}

export interface TopicClassificationResult {
  /**
   * Every topic whose keyword rules matched. Multiple topics per article are
   * expected and supported (e.g. a "player ruled out ahead of Saturday's
   * match" headline is both `injury` and `match-preview`).
   *
   * Can be empty: when nothing matches, this classifier deliberately does
   * NOT fall back to a default topic like 'analysis' — an empty topic list
   * is a legitimate, honest signal ("we found no topic evidence"), whereas
   * fabricating a fallback label would misrepresent confidence to readers
   * filtering by topic. `ClassificationService` factors the empty-topics
   * case into its overall confidence instead.
   */
  topics: NewsTopic[];
  /** 0 to 1, driven by how many distinct topics matched and how much text they covered. */
  confidence: number;
  reason: string;
}

/**
 * Step: deterministic keyword/rule matching against the FIXED topic
 * taxonomy (`NewsTopic`, `packages/contracts/src/news.ts`). Never invents a
 * label outside that enum — `TOPIC_KEYWORD_RULES` is typed against it, so
 * this is enforced by the type system, not just convention.
 */
@Injectable()
export class TopicClassifier {
  classify(input: TopicClassificationInput): TopicClassificationResult {
    const text = `${input.headline} ${input.summary ?? ''}`.toLowerCase();

    const matched = new Set<NewsTopic>();
    const matchedPhrases: string[] = [];

    for (const rule of TOPIC_KEYWORD_RULES) {
      if (text.includes(rule.phrase)) {
        matched.add(rule.topic);
        matchedPhrases.push(rule.phrase);
      }
    }

    const topics = Array.from(matched);

    if (topics.length === 0) {
      return {
        topics: [],
        confidence: 0,
        reason: 'No topic keyword matched.',
      };
    }

    // Confidence rises with distinct topic matches but is capped: several
    // topics matching is a sign of a rich article, not certainty about any
    // one of them individually.
    const confidence = Math.min(0.95, 0.5 + topics.length * 0.15);

    return {
      topics,
      confidence,
      reason: `Matched phrases: ${matchedPhrases.join(', ')} -> topics: ${topics.join(', ')}.`,
    };
  }
}
