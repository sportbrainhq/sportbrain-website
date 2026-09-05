import { Inject, Injectable, Logger } from '@nestjs/common';
import { AI_QUESTION_PROVIDER } from './ai-question-provider.token';
import type { AiQuestionProvider } from './ai-question-provider';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

/**
 * AI generation (Part 12.2): natural wording and distractors from an LLM,
 * without a deterministic fact behind it — Part 12.2's explicit warning
 * ("AI should NOT become the unquestioned source of truth") is the reason
 * this generator has no fact-discovery step of its own and depends entirely
 * on a caller-supplied fact/correct-answer, same as `HybridGenerator`. In
 * Phase C2 this class is exercised only via `AiQuestionProvider`, which has
 * no implementation yet (see that file); it fails per-candidate rather than
 * per-job so a caller can see exactly which facts couldn't be turned into
 * wording rather than losing the whole batch.
 */
@Injectable()
export class AiGenerator implements QuestionGenerator {
  private readonly logger = new Logger(AiGenerator.name);
  readonly method = 'AI' as const;
  readonly version = 'QUIZ_GEN_AI_V1';

  // Injected now so the wiring for a real provider is a binding change, not a
  // constructor change, once `AiQuestionProvider` has an implementation to
  // call from `generate` below.
  constructor(@Inject(AI_QUESTION_PROVIDER) private readonly provider: AiQuestionProvider) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    // No fact-discovery step exists yet (see TemplateGenerator's header for
    // why), so there is nothing to hand the provider — but confirm it's at
    // least reachable, so a misconfigured binding surfaces here rather than
    // silently returning empty results indistinguishable from "no facts".
    if (!this.provider) {
      throw new Error('AiQuestionProvider is not bound.');
    }
    this.logger.warn(
      `AI generation requested for sport "${context.sportSlug}" but no fact-discovery source is wired yet; returning no candidates.`,
    );
    return [];
  }
}
