import type {
  CandidateOption,
  CandidateSourceReference,
  QuestionCategory,
  QuestionDifficulty,
  QuestionGenerationMethod,
} from '@sportbrain/contracts';

/**
 * What a generator (TEMPLATE, AI, or HYBRID) must produce for one candidate,
 * before validation ever sees it. Deliberately the same shape regardless of
 * which method produced it — `QuestionGenerationJobService` treats all three
 * uniformly, and only `generationMethod` on the output records which path
 * was taken.
 */
export interface GeneratedCandidate {
  factKey: string | null;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  questionText: string;
  options: CandidateOption[];
  explanation: string | null;
  suggestedCategory: QuestionCategory;
  suggestedDifficulty: QuestionDifficulty;
  sourceReferences: CandidateSourceReference[];
  generationMethod: QuestionGenerationMethod;
  generationModel: string | null;
}

/** The admin form's request, reshaped into what a generator needs to run. */
export interface GenerationRequestContext {
  sportId: string;
  sportSlug: string;
  sourceType: string;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  sourceLabel: string;
  seasonContext: string | null;
  categories: QuestionCategory[];
  difficulties: QuestionDifficulty[];
  requestedCount: number;
}

/**
 * A generator turns a request into up to `requestedCount` candidates. It may
 * return fewer — Part 28's "do not silently invent to reach a count" applies
 * here as much as it does to quiz generation: an exhausted structured-fact
 * pool is a legitimate outcome, not an error.
 */
export interface QuestionGenerator {
  readonly method: QuestionGenerationMethod;
  readonly version: string;
  generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]>;
}
