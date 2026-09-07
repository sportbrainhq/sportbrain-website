import { Injectable, Logger } from '@nestjs/common';
import {
  CATEGORY_BY_SPORT,
  type QuestionCategory,
  type QuestionDifficulty,
} from '@sportbrain/contracts';
import { PlayerStatRepository, type PlayerStatRow } from './player-stat.repository';
import type {
  GeneratedCandidate,
  GenerationRequestContext,
  QuestionGenerator,
} from './generator.types';

const OPTION_COUNT = 4;

/** One statistic worth asking "which of these players has the most/highest X" about, per sport. */
interface StatFieldConfig {
  key: string;
  /** "the most career goals" — slotted into "Who has {phrase}: {player list}?" */
  phrase: string;
  difficulty: QuestionDifficulty;
}

/**
 * Curated per-sport stat fields, verified against real ingested data (see
 * `QUIZ_CONTENT_PLAN.md`'s per-sport stat-key audit) — every field listed
 * here was confirmed populated for hundreds to tens of thousands of rows.
 * Deliberately excludes shooting percentages and rate stats (field goal %,
 * batting average) as the *first* wave: a percentage stat needs a minimum
 * attempts/innings floor to be a fair comparison (a player with 2 career
 * attempts and 100% isn't a meaningful answer to "highest field goal %"),
 * which this generator doesn't yet enforce. Counting stats (goals, runs,
 * wins) don't have that problem — more matches played only ever raises the
 * count, so "highest" is always a fair, unambiguous question.
 */
const STAT_FIELDS_BY_SPORT: Record<string, StatFieldConfig[]> = {
  football: [
    { key: 'career_goals', phrase: 'the most career goals', difficulty: 'MEDIUM' },
    { key: 'career_games', phrase: 'the most career appearances', difficulty: 'MEDIUM' },
    { key: 'career_trophies', phrase: 'the most career trophies', difficulty: 'HARD' },
  ],
  cricket: [
    { key: 'runs', phrase: 'the most career runs', difficulty: 'MEDIUM' },
    { key: 'wickets', phrase: 'the most career wickets', difficulty: 'MEDIUM' },
    { key: 'hundreds', phrase: 'the most career centuries', difficulty: 'HARD' },
    { key: 'matches', phrase: 'the most career matches played', difficulty: 'HARD' },
  ],
  basketball: [
    { key: 'points_per_game', phrase: 'the highest career points per game', difficulty: 'MEDIUM' },
    { key: 'assists_per_game', phrase: 'the highest career assists per game', difficulty: 'HARD' },
    {
      key: 'rebounds_per_game',
      phrase: 'the highest career rebounds per game',
      difficulty: 'HARD',
    },
    { key: 'games_played', phrase: 'the most career games played', difficulty: 'HARD' },
  ],
  tennis: [
    { key: 'match_wins', phrase: 'the most career match wins', difficulty: 'MEDIUM' },
    { key: 'honours_won', phrase: 'the most career titles', difficulty: 'MEDIUM' },
  ],
  'formula-1': [
    { key: 'wins', phrase: 'the most career race wins', difficulty: 'MEDIUM' },
    { key: 'podiums', phrase: 'the most career podium finishes', difficulty: 'MEDIUM' },
    { key: 'pole_positions', phrase: 'the most career pole positions', difficulty: 'HARD' },
    { key: 'fastest_laps', phrase: 'the most career fastest laps', difficulty: 'HARD' },
  ],
  golf: [{ key: 'honours_won', phrase: 'the most career titles', difficulty: 'MEDIUM' }],
  'american-football': [
    { key: 'passing_yards', phrase: 'the most career passing yards', difficulty: 'MEDIUM' },
    {
      key: 'passing_touchdowns',
      phrase: 'the most career passing touchdowns',
      difficulty: 'MEDIUM',
    },
    { key: 'honours_won', phrase: 'the most career honours', difficulty: 'HARD' },
  ],
  mma: [
    { key: 'fight_wins', phrase: 'the most career fight wins', difficulty: 'MEDIUM' },
    { key: 'knockout_wins', phrase: 'the most career knockout wins', difficulty: 'MEDIUM' },
    { key: 'submission_wins', phrase: 'the most career submission wins', difficulty: 'HARD' },
  ],
  boxing: [{ key: 'honours_won', phrase: 'the most career titles', difficulty: 'MEDIUM' }],
};

/**
 * "Who has {the most career goals}: {four named players}?" (Part 12.1
 * template generation, backed by `person_statistic`). The safest fact type
 * in the pipeline for distractor plausibility: every option is a real
 * athlete with a real, comparable number for the exact stat being asked
 * about, so there is no category/competition scoping bug possible the way
 * there was for `TemplateGenerator`'s honour questions — the four options
 * are automatically all "the same kind of thing."
 *
 * The question text names the four sampled players explicitly rather than
 * saying "which of these players" — this isn't only better wording, it's
 * what makes `questionFingerprint` (computed from displayed text) actually
 * distinguish one fact from another. A generic "which of these players has
 * the most career titles?" is identical text for every sampled group, which
 * collapsed every candidate for a stat field onto one fingerprint and
 * silently discarded all but the first as duplicates — the direct cause of
 * a sparse sport (tennis, golf, ...) generating dozens of candidates but
 * ending up with exactly one publishable question.
 *
 * Ties are rejected outright (a sampled group with two players sharing the
 * top value has no single correct answer) rather than picked arbitrarily.
 */
@Injectable()
export class PlayerStatSuperlativeGenerator implements QuestionGenerator {
  private readonly logger = new Logger(PlayerStatSuperlativeGenerator.name);
  readonly method = 'TEMPLATE' as const;
  readonly version = 'QUIZ_GEN_TEMPLATE_V1_PLAYER_STAT';

  constructor(private readonly stats: PlayerStatRepository) {}

  async generate(context: GenerationRequestContext): Promise<GeneratedCandidate[]> {
    const fields = STAT_FIELDS_BY_SPORT[context.sportSlug];
    if (!fields || fields.length === 0) {
      this.logger.warn(`No curated stat fields configured for sport "${context.sportSlug}".`);
      return [];
    }

    const candidates: GeneratedCandidate[] = [];
    let attempts = 0;
    // Cycles through the sport's stat fields round-robin so a batch doesn't
    // end up entirely "most goals" questions — the same variety problem
    // that made the honour-only generator feel repetitive in the first
    // place, applied to this generator's one namespace of facts.
    while (candidates.length < context.requestedCount && attempts < context.requestedCount * 4) {
      attempts += 1;
      const field = fields[attempts % fields.length] as StatFieldConfig;
      const candidate = await this.buildCandidate(context, field);
      if (candidate) candidates.push(candidate);
    }

    return candidates;
  }

  private async buildCandidate(
    context: GenerationRequestContext,
    field: StatFieldConfig,
  ): Promise<GeneratedCandidate | null> {
    const sampled = await this.stats.sampleWithStat(context.sportId, field.key, OPTION_COUNT);
    const distinct = dedupeByPerson(sampled).slice(0, OPTION_COUNT);
    if (distinct.length < OPTION_COUNT) return null;

    const sorted = [...distinct].sort((a, b) => b.value - a.value);
    const highest = sorted[0] as PlayerStatRow;
    const runnerUp = sorted[1] as PlayerStatRow;
    // A tie for first has no single correct answer (Part 4: exactly one
    // correct option) — skip rather than pick arbitrarily between them.
    if (highest.value === runnerUp.value) return null;

    const options = shuffle(
      distinct.map((row) => ({
        optionText: row.displayName,
        isCorrect: row.personId === highest.personId,
        explanation: null,
      })),
    );

    // The order the four names appear *in the question text* is independent
    // of `options`' shuffled order — deliberately: shuffling the option
    // order must not change the question's own wording, or the same
    // question would fingerprint differently depending on shuffle luck.
    const playerList = distinct.map((row) => row.displayName);
    const questionText = `Who has ${field.phrase}: ${formatPlayerList(playerList)}?`;

    return {
      factKey: `${context.sportSlug}:person-stat:${field.key}:${highest.personId}`,
      sourceEntityType: 'person_statistic',
      sourceEntityId: highest.personId,
      questionText,
      options,
      explanation: `${highest.displayName} has ${field.phrase.replace('the most', '').replace('the highest', '').trim()} of ${highest.value.toLocaleString()} among these options.`,
      suggestedCategory: resolveCategory(context.categories, context.sportSlug),
      suggestedDifficulty: resolveDifficulty(field.difficulty, context.difficulties),
      sourceReferences: [
        {
          label: 'SportBrain player statistics',
          sourceEntityType: 'person_statistic',
          sourceEntityId: highest.personId,
        },
      ],
      generationMethod: 'TEMPLATE',
      generationModel: null,
    };
  }
}

/** "Serena Williams, Angelique Kerber, Iga Świątek or Andy Murray" — an Oxford-comma-free list reading naturally as a question's tail. */
function formatPlayerList(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

/** Some players have more than one `person_statistic` career row (e.g. re-ingested from a second provider) — keep the first occurrence only, so one player can't fill two of the four option slots. */
function dedupeByPerson(rows: PlayerStatRow[]): PlayerStatRow[] {
  const seen = new Set<string>();
  const result: PlayerStatRow[] = [];
  for (const row of rows) {
    if (seen.has(row.personId)) continue;
    seen.add(row.personId);
    result.push(row);
  }
  return result;
}

/**
 * Prefers PLAYERS when the sport's taxonomy has it (football, cricket,
 * basketball, tennis) and the editor requested it; falls back to DRIVERS
 * for Formula 1 (its taxonomy has no PLAYERS category, per
 * `CATEGORY_BY_SPORT`), then RECORDS, then whatever the editor did request
 * — never fabricates a category outside both the sport's taxonomy and the
 * form's own selection.
 */
function resolveCategory(requested: QuestionCategory[], sportSlug: string): QuestionCategory {
  const allowed = CATEGORY_BY_SPORT[sportSlug];
  const preferredOrder: QuestionCategory[] = ['PLAYERS', 'DRIVERS', 'RECORDS'];
  for (const candidate of preferredOrder) {
    if (requested.includes(candidate) && (!allowed || allowed.includes(candidate)))
      return candidate;
  }
  return requested[0] ?? 'RECORDS';
}

function resolveDifficulty(
  preferred: QuestionDifficulty,
  requested: GenerationRequestContext['difficulties'],
): GenerationRequestContext['difficulties'][number] {
  if (requested.includes(preferred)) return preferred;
  return requested[0] ?? 'MEDIUM';
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
