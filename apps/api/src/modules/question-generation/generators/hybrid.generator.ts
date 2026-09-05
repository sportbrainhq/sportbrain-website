import { Injectable, Logger } from '@nestjs/common';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

/**
 * HYBRID — the recommended default (Part 12.3): a structured fact decides
 * the correct answer deterministically, an AI provider proposes wording and
 * distractors, and `QuestionValidationService` checks every option
 * afterwards. This is architecturally "TemplateGenerator's fact discovery,
 * AiGenerator's wording," which is why it composes both rather than
 * duplicating either — once fact discovery exists, wiring it here is adding
 * the AI-provider call between two already-built pieces, not new
 * architecture.
 *
 * Returns no candidates in Phase C2 for the same reason `TemplateGenerator`
 * does: no fact-discovery source is wired yet.
 */
@Injectable()
export class HybridGenerator implements QuestionGenerator {
  private readonly logger = new Logger(HybridGenerator.name);
  readonly method = 'HYBRID' as const;
  readonly version = 'QUIZ_GEN_HYBRID_V1';

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    this.logger.warn(
      `Hybrid generation requested for sport "${context.sportSlug}" but no fact-discovery source is wired yet; returning no candidates.`,
    );
    return [];
  }
}
