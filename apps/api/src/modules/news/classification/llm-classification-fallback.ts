import { Injectable, Logger } from '@nestjs/common';

/**
 * The "AI/LLM fallback only when uncertain" step from the spec.
 *
 * DELIBERATELY NOT WIRED TO A REAL LLM IN THIS PHASE. No API key, no
 * external LLM SDK dependency, and no prompt are added here. Wiring an
 * actual model (e.g. via the Claude API) is a follow-up requiring a human
 * to choose:
 *   - which model (cost/latency/quality trade-off — see the `claude-api`
 *     skill for current Claude model options/pricing before deciding)
 *   - the exact prompt and output schema (must still only emit sport slugs
 *     and topics from the existing controlled vocabularies — never invent
 *     new labels)
 *   - a per-article cost budget / rate limit, since this runs on every
 *     low-confidence article the deterministic pipeline produces
 *   - how confidently to trust its output relative to the deterministic
 *     signals it is topping up
 *
 * Until that decision is made, `NoopLlmClassificationFallback` is the only
 * implementation: it does nothing and reports itself unavailable, which
 * `ClassificationService` treats as "leave this article for manual review"
 * rather than silently guessing.
 */

export interface LlmFallbackInput {
  articleId: string;
  headline: string;
  summary: string | null;
  /** What the deterministic pipeline produced, for context/logging even though the noop implementation ignores it. */
  deterministicSportSlug: string | null;
  deterministicConfidence: number;
}

export interface LlmFallbackResult {
  /** False for the noop implementation. A real implementation sets this once it has produced a usable classification. */
  available: boolean;
  sportSlug?: string;
  topics?: string[];
  confidence?: number;
  /** Why no result was produced (always populated when `available` is false). */
  unavailableReason?: string;
}

export interface LlmClassificationFallback {
  classify(input: LlmFallbackInput): Promise<LlmFallbackResult>;
}

/**
 * Default implementation. Always reports itself unavailable so a caller
 * cannot mistake "no fallback wired" for "the AI looked and found nothing".
 */
@Injectable()
export class NoopLlmClassificationFallback implements LlmClassificationFallback {
  private readonly logger = new Logger(NoopLlmClassificationFallback.name);

  async classify(input: LlmFallbackInput): Promise<LlmFallbackResult> {
    this.logger.warn(
      `LLM classification fallback invoked for article "${input.articleId}" but no real ` +
        'implementation is wired (Phase 3 deliberately ships only the extension point). ' +
        'Article will be left for manual review.',
    );
    return {
      available: false,
      unavailableReason:
        'No LLM fallback implementation is configured. Wiring one is a deliberate follow-up ' +
        'decision (model choice, cost budget, prompt) — see LlmClassificationFallback doc comment.',
    };
  }
}
