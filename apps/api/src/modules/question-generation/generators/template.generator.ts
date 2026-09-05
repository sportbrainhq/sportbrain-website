import { Injectable } from '@nestjs/common';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

/**
 * TEMPLATE generation (Part 12.1): safest for highly structured facts
 * (winners, hosts, records) where the correct answer is looked up, not
 * guessed, and wording comes from a fixed sentence pattern rather than free
 * generation.
 *
 * Phase C2 ships the generator's shape and orchestration, not a populated
 * template library or the structured-fact lookup it would query — that
 * depends on which per-entity fact tables (`entity_fact`, `honour`,
 * `competition_statistic`) are ready to be read as "eligible facts" per
 * sport, which is a data-modelling decision for a follow-up phase, not a
 * generation-pipeline one. `generate` here returns an empty list rather than
 * fabricating placeholder questions: Part 28's "do not invent to reach a
 * count" applies to the generator itself, not only to quiz assembly.
 *
 * Extend this by implementing fact discovery + a template sentence per
 * `sourceType`/category and mapping its output to `GeneratedCandidate` —
 * the interface this class satisfies does not change.
 */
@Injectable()
export class TemplateGenerator implements QuestionGenerator {
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_TEMPLATE_V1';

  async generate(_context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    return [];
  }
}
