import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QuizMode, QuizType } from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import {
  EligibleQuestionsRepository,
  type EligibleQuestionRow,
} from './eligible-questions.repository';
import { allocateMasterQuizSlots } from './master-allocation';
import { QuestionExposureRepository } from './question-exposure.repository';
import { selectQuestions } from './question-selector';

export interface QuizGenerationInput {
  userId: string;
  quizType: QuizType;
  sportId: string | null;
  mode: QuizMode;
}

export interface QuizGenerationResult {
  requestedQuestionCount: number;
  questions: EligibleQuestionRow[];
  /** Per-sport breakdown for MASTER; empty for SPORT. Stored on the attempt's `generationMetadata` for audit/debugging. */
  sportAllocation: Record<string, number>;
}

/**
 * Turns a quiz request into a concrete, ordered list of canonical
 * `question` rows — never question copies (Part 1), never a duplicate id
 * within the result (Part 7.3, Part 28), and gracefully short of the
 * requested count when inventory is exhausted rather than inventing or
 * repeating to fill it (Part 28).
 */
@Injectable()
export class QuizGenerationService {
  constructor(
    private readonly eligibleQuestions: EligibleQuestionsRepository,
    private readonly exposure: QuestionExposureRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async generate(input: QuizGenerationInput): Promise<QuizGenerationResult> {
    const quizConfig = this.config.get('quiz', { infer: true });
    const requestedQuestionCount =
      input.quizType === 'SPORT'
        ? quizConfig.sportModeCounts[input.mode as 'QUICK' | 'STANDARD' | 'CHALLENGE']
        : quizConfig.masterModeCounts[input.mode as 'QUICK' | 'STANDARD' | 'MARATHON'];

    if (input.quizType === 'SPORT') {
      if (!input.sportId) throw new Error('sportId is required for a SPORT quiz');
      const questions = await this.selectForSport(
        input.userId,
        input.sportId,
        requestedQuestionCount,
      );
      return {
        requestedQuestionCount,
        questions,
        sportAllocation: { [input.sportId]: questions.length },
      };
    }

    return this.generateMaster(input.userId, requestedQuestionCount);
  }

  private async selectForSport(
    userId: string,
    sportId: string,
    count: number,
  ): Promise<EligibleQuestionRow[]> {
    const quizConfig = this.config.get('quiz', { infer: true });
    const eligible = await this.eligibleQuestions.findEligible(sportId);
    const exposures = await this.exposure.findForUser(
      userId,
      eligible.map((row) => row.id),
    );
    return selectQuestions(eligible, exposures, count, quizConfig, new Date());
  }

  /**
   * Master Quiz: allocate slots across sports by available inventory (Part
   * 25's breadth-first logic), then run the same unseen-first/cooldown
   * selection independently per sport, and concatenate. Never duplicates a
   * question across sports since question ids are sport-scoped in
   * practice, but concatenation order is still shuffled so the attempt
   * doesn't visibly group by sport.
   */
  private async generateMaster(userId: string, totalCount: number): Promise<QuizGenerationResult> {
    const quizConfig = this.config.get('quiz', { infer: true });
    const launchedSportIds = await this.eligibleQuestions.findLaunchedSportIds();

    const eligibleBySport = new Map<string, EligibleQuestionRow[]>();
    const exposuresBySport = new Map<
      string,
      Awaited<ReturnType<QuestionExposureRepository['findForUser']>>
    >();

    for (const sportId of launchedSportIds) {
      const eligible = await this.eligibleQuestions.findEligible(sportId);
      eligibleBySport.set(sportId, eligible);
      exposuresBySport.set(
        sportId,
        await this.exposure.findForUser(
          userId,
          eligible.map((row) => row.id),
        ),
      );
    }

    // "Available" inventory per sport, for the allocator: unseen + cooldown-
    // expired count, not raw eligible count, so a sport whose questions are
    // all still cooling down for this user is correctly treated as having
    // no slack to allocate toward right now.
    const availableBySport = new Map<string, number>();
    for (const sportId of launchedSportIds) {
      const eligible = eligibleBySport.get(sportId) ?? [];
      const exposures = exposuresBySport.get(sportId) ?? [];
      const selectable = selectQuestions(
        eligible,
        exposures,
        eligible.length,
        quizConfig,
        new Date(),
      );
      availableBySport.set(sportId, selectable.length);
    }

    const allocation = allocateMasterQuizSlots(availableBySport, totalCount);

    const questions: EligibleQuestionRow[] = [];
    const sportAllocation: Record<string, number> = {};
    for (const [sportId, slots] of allocation) {
      if (slots === 0) continue;
      const eligible = eligibleBySport.get(sportId) ?? [];
      const exposures = exposuresBySport.get(sportId) ?? [];
      const selected = selectQuestions(eligible, exposures, slots, quizConfig, new Date());
      questions.push(...selected);
      sportAllocation[sportId] = selected.length;
    }

    return { requestedQuestionCount: totalCount, questions: shuffle(questions), sportAllocation };
  }
}

/** Fisher-Yates. Deterministic tests should construct `QuizGenerationService` with a fixed input set and assert on membership/counts, not on order. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = temp;
  }
  return result;
}
