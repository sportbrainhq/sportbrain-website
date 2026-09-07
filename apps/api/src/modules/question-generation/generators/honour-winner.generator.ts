import { Injectable } from '@nestjs/common';
import type { QuestionCategory } from '@sportbrain/contracts';
import { HonourFactRepository } from './honour-fact.repository';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

const OPTION_COUNT = 4;

/**
 * TEMPLATE generation (Part 12.1), sourced from `honour` (team-title wins) —
 * the ingested "who won what" record already populated for every launched
 * sport. Deterministic and fact-first per Part 12.1: the correct answer is
 * read directly off the `honour` row, never guessed, and the only free
 * choice this generator makes is which three other teams to offer as
 * distractors.
 *
 * A candidate here always maps to `CATEGORY_BY_SPORT`'s `RECORDS` bucket
 * (or `TEAMS` where a sport has no `RECORDS`/history-style category) — see
 * `resolveCategory` — since "which team won this honour" is a records/
 * history fact regardless of sport, and the admin form's category picker is
 * how an editor recategorises a specific candidate before approving it.
 */
@Injectable()
export class HonourWinnerGenerator implements QuestionGenerator {
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_HONOUR_WINNER_V1';

  constructor(private readonly honours: HonourFactRepository) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    const facts = await this.honours.findUnambiguousTeamTitles(
      context.sportId,
      context.requestedCount,
    );
    const candidates: GeneratedCandidate[] = [];

    for (const fact of facts) {
      // Competition-scoped first (Part 4/45 plausibility: an IPL question
      // must never draw a non-IPL team), backfilled from the wider
      // sport+kind pool only for whatever slots the competition-scoped
      // query couldn't fill — a competition with very few distinct winners
      // would otherwise starve entirely rather than degrade gracefully.
      const competitionScoped = await this.honours.findCompetitionScopedDistractorNames(
        context.sportId,
        fact.competitionKey,
        fact.winningTeamId,
        fact.winningTeamName,
        fact.winningTeamNotability,
        OPTION_COUNT - 1,
      );
      const stillNeeded = OPTION_COUNT - 1 - competitionScoped.length;
      const backfill =
        stillNeeded > 0
          ? await this.honours.findDistractorTeamNames(
              context.sportId,
              fact.winningTeamId,
              fact.winningTeamKind,
              fact.winningTeamName,
              fact.winningTeamNotability,
              stillNeeded,
            )
          : [];
      const distractorNames = dedupeCaseInsensitive(
        [...competitionScoped, ...backfill],
        fact.winningTeamName,
      ).slice(0, OPTION_COUNT - 1);

      // Fewer than three other teams exist for this sport — cannot build a
      // four-option question from this fact. Skip it rather than padding
      // with duplicate/placeholder options (Part 4's "no duplicate option
      // text" rule would reject it anyway, later, more expensively).
      if (distractorNames.length < OPTION_COUNT - 1) continue;

      const options = shuffle([
        { optionText: fact.winningTeamName, isCorrect: true, explanation: null },
        ...distractorNames.map((name) => ({
          optionText: name,
          isCorrect: false,
          explanation: null,
        })),
      ]);

      candidates.push({
        factKey: `${context.sportSlug}:honour:${normalizeForKey(fact.title)}`,
        sourceEntityType: 'honour',
        sourceEntityId: fact.honourId,
        questionText: `Which team won the ${fact.title}?`,
        options,
        explanation: `${fact.winningTeamName} won the ${fact.title}.`,
        suggestedCategory: resolveCategory(context.categories),
        suggestedDifficulty: resolveDifficulty(fact.prestige, context.difficulties),
        sourceReferences: [
          {
            label: 'SportBrain structured competition record',
            sourceEntityType: 'honour',
            sourceEntityId: fact.honourId,
          },
        ],
        generationMethod: 'TEMPLATE',
        generationModel: null,
      });
    }

    return candidates;
  }
}

/** Same normalization concept as `question.ts`'s `factKey` examples: lowercase, hyphenate, so the same underlying honour never gets two different-looking keys across runs. */
function normalizeForKey(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * "Which team won X" is a records/history fact, not tied to any one
 * requested category. Prefers `RECORDS` when the admin form asked for it
 * (it's the closest semantic fit across every sport's taxonomy), otherwise
 * `HISTORY`, otherwise whatever category the form did request — never
 * fabricates a category outside what the editor selected.
 */
function resolveCategory(requested: QuestionCategory[]): QuestionCategory {
  if (requested.includes('RECORDS')) return 'RECORDS';
  if (requested.includes('HISTORY')) return 'HISTORY';
  return requested[0] ?? 'RECORDS';
}

/**
 * Prestige 1 (the highest-profile honours — top-flight league/major cup
 * wins) reads as EASY/MEDIUM; everything else defaults toward the harder
 * end, since an unranked or lower-prestige honour is more likely obscure.
 * Only ever returns a difficulty the admin form actually requested, falling
 * back to the first requested value when the natural mapping isn't in that
 * set — this generator never publishes outside the editor's own selection.
 */
function resolveDifficulty(
  prestige: number | null,
  requested: GenerationRequestContext['difficulties'],
): GenerationRequestContext['difficulties'][number] {
  const preferred = prestige === 1 ? 'EASY' : prestige === 2 ? 'MEDIUM' : 'HARD';
  if (requested.includes(preferred)) return preferred;
  return requested[0] ?? 'MEDIUM';
}

/** Removes duplicates (case-insensitive) and anything matching the correct answer, so backfill never re-adds a name the competition-scoped query already offered or the winner itself. */
function dedupeCaseInsensitive(names: string[], exclude: string): string[] {
  const seen = new Set<string>([exclude.toLowerCase()]);
  const result: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }
  return result;
}

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
