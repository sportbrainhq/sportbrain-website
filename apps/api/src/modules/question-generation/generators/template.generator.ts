import { Injectable, Logger } from '@nestjs/common';
import { ClubHistoryGenerator } from './club-history.generator';
import { HonourWinnerGenerator } from './honour-winner.generator';
import { PlayerIdentityGenerator } from './player-identity.generator';
import { PlayerStatSuperlativeGenerator } from './player-stat-superlative.generator';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

/**
 * TEMPLATE generation's public face (Part 12.1) — a thin composite over the
 * sub-generators that actually read structured facts. Splitting fact
 * discovery into one class per fact type (`HonourWinnerGenerator` — team
 * titles, `PlayerStatSuperlativeGenerator` — career stat leaderboards,
 * `ClubHistoryGenerator` — transfer/spell history, `PlayerIdentityGenerator`
 * — birthplace/position/current-club) rather than one generator with a
 * branch per fact type is what fixed the original "every question in a
 * batch is the same shape" complaint: this class's only job is deciding how
 * many of the requested count go to each sub-generator and interleaving
 * their output, so a single job naturally produces a mix.
 *
 * Splits the requested count evenly across every sub-generator — a sport
 * with no `person_team` coverage still gets its full count from whichever
 * generators *did* have something to offer, rather than losing slots to a
 * generator that returned nothing (Part 28's "do not invent to fill a
 * count" logic, applied at the composite level: never pad, only
 * redistribute what real fact sources actually produced).
 */
@Injectable()
export class TemplateGenerator implements QuestionGenerator {
  private readonly logger = new Logger(TemplateGenerator.name);
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_TEMPLATE_COMPOSITE_V2';

  constructor(
    private readonly honourWinner: HonourWinnerGenerator,
    private readonly playerStat: PlayerStatSuperlativeGenerator,
    private readonly clubHistory: ClubHistoryGenerator,
    private readonly playerIdentity: PlayerIdentityGenerator,
  ) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    const subGenerators: QuestionGenerator[] = [
      this.honourWinner,
      this.playerStat,
      this.clubHistory,
      this.playerIdentity,
    ];
    const perGeneratorCount = Math.ceil(context.requestedCount / subGenerators.length);

    const batches = await Promise.all(
      subGenerators.map((generator) =>
        generator
          .generate({ ...context, requestedCount: perGeneratorCount })
          .catch((error: unknown) => {
            this.logger.warn(
              `Sub-generator failed during TEMPLATE generation for "${context.sportSlug}": ${(error as Error).message}`,
            );
            return [] as GeneratedCandidate[];
          }),
      ),
    );

    return interleave(batches).slice(0, context.requestedCount);
  }
}

/** Round-robins across each sub-generator's output — [a1,b1,a2,b2,...] rather than [a1,a2,...,b1,b2,...] — so a batch capped below the full combined total still ends up mixed rather than front-loaded with one fact type. */
function interleave<T>(lists: T[][]): T[] {
  const result: T[] = [];
  const maxLength = Math.max(0, ...lists.map((list) => list.length));
  for (let i = 0; i < maxLength; i += 1) {
    for (const list of lists) {
      const item = list[i];
      if (item !== undefined) result.push(item);
    }
  }
  return result;
}
