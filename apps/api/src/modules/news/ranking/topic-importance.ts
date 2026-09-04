import type { NewsTopic } from '@sportbrain/contracts';

/**
 * Editorial weight per topic, in [0, 1], used by `computeImportanceScore`'s
 * topic-importance factor. A small, hand-curated table rather than a
 * formula: "how newsworthy is a topic" is an editorial judgement call, not
 * something derivable from the topic string itself, and keeping it as a
 * flat table (like `topic-keyword-rules.ts` and `sport-keyword-rules.ts`
 * elsewhere in this module) means adjusting one topic's weight never risks
 * touching the scoring logic that consumes it.
 *
 * Rationale for the tiers:
 *   - 1.0 ("breaking"): the highest tier by definition - urgent, time-critical.
 *   - 0.8 (result/record/retirement/disciplinary): outcomes and career
 *     events readers actively seek out and that rarely get "undone" by a
 *     follow-up story, unlike a rumour.
 *   - 0.6 (transfer/injury/contract/milestone/selection): significant but
 *     routine sports-business news, expected to recur constantly through a
 *     season.
 *   - 0.4 (match-preview/match-report/business/governance): useful context
 *     rather than standalone news value on its own.
 *   - 0.25 (rumour/interview/analysis): lowest tier - speculative, opinion,
 *     or soft content, not "what happened".
 *
 * A topic absent from an article's `topics` list (or an article with no
 * topics at all) contributes the `DEFAULT_TOPIC_IMPORTANCE` fallback via
 * `topicImportance` below, and an article with several topics takes the
 * *highest* weight among them (the most newsworthy angle wins) rather than
 * an average, which would let a "breaking, interview" article score lower
 * than a plain "breaking" one purely for having more tags.
 */
const TOPIC_IMPORTANCE: Partial<Record<NewsTopic, number>> = {
  breaking: 1.0,
  result: 0.8,
  record: 0.8,
  retirement: 0.8,
  disciplinary: 0.8,
  transfer: 0.6,
  injury: 0.6,
  contract: 0.6,
  milestone: 0.6,
  selection: 0.6,
  'match-preview': 0.4,
  'match-report': 0.4,
  business: 0.4,
  governance: 0.4,
  rumour: 0.25,
  interview: 0.25,
  analysis: 0.25,
};

/** Weight used for a topic not present in the table above, or when `topics` is empty. */
export const DEFAULT_TOPIC_IMPORTANCE = 0.4;

/** The highest editorial weight among an article's topics, or `DEFAULT_TOPIC_IMPORTANCE` when it has none. */
export function topicImportance(topics: string[]): number {
  if (topics.length === 0) return DEFAULT_TOPIC_IMPORTANCE;

  let max = 0;
  for (const topic of topics) {
    const weight = TOPIC_IMPORTANCE[topic as NewsTopic] ?? DEFAULT_TOPIC_IMPORTANCE;
    if (weight > max) max = weight;
  }
  return max;
}
