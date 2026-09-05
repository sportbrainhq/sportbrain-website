import type { CandidateOption, QuestionCategory, QuestionDifficulty } from '@sportbrain/contracts';

/**
 * The boundary between the generation pipeline and whatever LLM eventually
 * backs it. Kept as an injectable interface, not a concrete Anthropic/OpenAI
 * client, so `AiGenerator`/`HybridGenerator` never import a provider SDK
 * directly — swapping models or adding a second provider is a new class
 * implementing this interface, not a change to the generators that call it.
 *
 * No API key is configured in this repository yet, so `NullAiQuestionProvider`
 * is the only implementation wired up: it throws clearly rather than
 * fabricating a plausible-looking response, which would be worse than
 * failing loud. Wire a real implementation (and register it in
 * `QuestionGenerationModule` in place of the null provider) once a provider
 * and API key are available.
 */
export interface AiQuestionProviderInput {
  /** e.g. "Argentina won the 2022 FIFA World Cup, defeating France on penalties." — the deterministic fact the wording must stay faithful to. */
  factSummary: string;
  factKey: string | null;
  sportSlug: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  /** Correct answer, decided outside the LLM (Part 12.3: "correct answer determined deterministically"). */
  correctAnswer: string;
  /** Candidate pool the LLM may choose distractors from, when one is known (Part 12.1's "eligible structured pool"). */
  distractorPool?: string[];
}

export interface AiQuestionProviderOutput {
  questionText: string;
  options: CandidateOption[];
  explanation: string;
  model: string;
}

export interface AiQuestionProvider {
  generateQuestion(input: AiQuestionProviderInput): Promise<AiQuestionProviderOutput>;
}

/** Fails loudly and immediately. See file header — this is the seam, not the feature. */
export class NullAiQuestionProvider implements AiQuestionProvider {
  async generateQuestion(): Promise<AiQuestionProviderOutput> {
    throw new Error(
      'No AI question provider is configured. AI/HYBRID generation is wired as an interface ' +
        '(AiQuestionProvider) but has no implementation in this environment — use TEMPLATE generation, ' +
        'or configure a provider and register it in QuestionGenerationModule.',
    );
  }
}
