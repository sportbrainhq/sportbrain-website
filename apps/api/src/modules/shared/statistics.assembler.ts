import { Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, or, sql } from 'drizzle-orm';
import type {
  CareerSummaryEntry,
  Honour,
  StatisticGroup,
  StatisticValue,
} from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  discipline,
  honour,
  personStatistic,
  statisticDefinition,
  teamStatistic,
} from '../../database/schema';

/**
 * The headline statistics a player page shows above its detailed blocks, in
 * render order.
 *
 * Fixed here rather than read from the registry's `is_headline` flag, because
 * the page's promise is these three specifically: a sport that later marks a
 * fourth statistic as a headline must not silently change the layout.
 *
 * A sport opts in by declaring these keys in the registry. Only football does
 * so today: the other sports count a career in their own terms and will get
 * their own trio, so a page whose sport has not declared them renders no
 * headline panel at all rather than three empty tiles.
 */
const CAREER_SUMMARY_KEYS = ['career_games', 'career_goals', 'career_trophies'] as const;

/**
 * Keys the detailed blocks must not render.
 *
 * The three headline keys, because they lead the section already, plus
 * `honours_won`: it counts the same trophies as `career_trophies` and showed up
 * beside it as a second, differently named tile.
 */
const SUPPRESSED_KEYS = new Set<string>([...CAREER_SUMMARY_KEYS, 'honours_won']);

/**
 * Turns stored statistics into something a page can render.
 *
 * This is where the statistics design pays off or fails. The database holds a
 * JSONB payload of raw keys and a registry describing what those keys mean; the
 * website should receive neither, but a list of labelled, formatted, grouped
 * values it can display without knowing anything about the sport.
 *
 * Shared between teams, players and competitions because the assembly is
 * identical for all three. Only the subject changes.
 *
 * The rule that keeps it honest: **a statistic with no registry entry is not
 * rendered.** Ingestion may write whatever a provider supplies, but nothing
 * reaches a page until somebody has declared what it is called and how it
 * should be formatted. That is what stops a raw provider key appearing as a
 * column heading.
 */
@Injectable()
export class StatisticsAssembler {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Statistics for one person, grouped by discipline.
   *
   * A cricketer comes back as separate Test, ODI and T20I blocks that the page
   * renders side by side. A footballer comes back as one block. Neither the
   * caller nor the website needs to know which case it is looking at.
   */
  async forPerson(personId: string, sportId: string): Promise<StatisticGroup[]> {
    const rows = await this.database.db
      .select({
        scope: personStatistic.scope,
        appearances: personStatistic.appearances,
        stats: personStatistic.stats,
        disciplineId: personStatistic.disciplineId,
        disciplineKey: discipline.key,
        disciplineLabel: discipline.label,
        disciplineKind: discipline.kind,
        disciplineOrder: discipline.displayOrder,
      })
      .from(personStatistic)
      .leftJoin(discipline, eq(discipline.id, personStatistic.disciplineId))
      .where(and(eq(personStatistic.personId, personId), eq(personStatistic.scope, 'career')))
      .orderBy(asc(discipline.displayOrder));

    if (rows.length === 0) return [];

    const definitions = await this.definitionsForSport(sportId, 'player');

    return rows.map((row) => ({
      discipline: row.disciplineKey
        ? {
            key: row.disciplineKey,
            label: row.disciplineLabel ?? row.disciplineKey,
            kind: row.disciplineKind ?? 'format',
          }
        : null,
      scope: row.scope,
      appearances: row.appearances,
      statistics: this.render(row.stats as Record<string, unknown>, definitions, row.disciplineId),
    }));
  }

  /**
   * The headline tiles for a player page, in a fixed order.
   *
   * Uniform within a sport, which is the point: every footballer shows games,
   * goals and trophies, in that order, whatever has been ingested for them. A
   * player missing a figure gets a tile with a dash rather than one fewer tile,
   * because a profile that changes shape from player to player reads as broken
   * rather than as incomplete.
   *
   * Empty for a sport that has not declared these keys, so nothing renders.
   * Labels come from the registry rather than from here, so a sport can name
   * its own without a change to this code.
   */
  async careerSummaryFor(personId: string, sportId: string): Promise<CareerSummaryEntry[]> {
    const [rows, definitions] = await Promise.all([
      this.database.db
        .select({ stats: personStatistic.stats })
        .from(personStatistic)
        .where(
          and(
            eq(personStatistic.personId, personId),
            eq(personStatistic.scope, 'career'),
            isNull(personStatistic.disciplineId),
          ),
        ),
      this.definitionsForSport(sportId, 'player'),
    ]);

    const stats = (rows[0]?.stats ?? {}) as Record<string, unknown>;
    const byKey = new Map(definitions.map((definition) => [definition.key, definition]));

    // Every key or none. A sport that declares two of the three has a registry
    // error, and rendering a two-tile panel would hide it.
    if (CAREER_SUMMARY_KEYS.some((key) => !byKey.has(key))) return [];

    return CAREER_SUMMARY_KEYS.map((key) => {
      const definition = byKey.get(key)!;
      const raw = stats[key];

      return {
        key,
        label: definition.label,
        value: typeof raw === 'number' ? raw : null,
        description: definition.description,
      };
    });
  }

  /** Statistics for one team. Same structure, team-scoped registry entries. */
  async forTeam(teamId: string, sportId: string): Promise<StatisticGroup[]> {
    const rows = await this.database.db
      .select({
        scope: teamStatistic.scope,
        played: teamStatistic.played,
        stats: teamStatistic.stats,
        disciplineId: teamStatistic.disciplineId,
        disciplineKey: discipline.key,
        disciplineLabel: discipline.label,
        disciplineKind: discipline.kind,
      })
      .from(teamStatistic)
      .leftJoin(discipline, eq(discipline.id, teamStatistic.disciplineId))
      .where(and(eq(teamStatistic.teamId, teamId), eq(teamStatistic.scope, 'career')))
      .orderBy(asc(discipline.displayOrder));

    if (rows.length === 0) return [];

    const definitions = await this.definitionsForSport(sportId, 'team');

    return rows.map((row) => ({
      discipline: row.disciplineKey
        ? {
            key: row.disciplineKey,
            label: row.disciplineLabel ?? row.disciplineKey,
            kind: row.disciplineKind ?? 'format',
          }
        : null,
      scope: row.scope,
      appearances: row.played,
      statistics: this.render(row.stats as Record<string, unknown>, definitions, row.disciplineId),
    }));
  }

  /** Honours for a person or a team, most recent first. */
  async honoursFor(subject: { personId?: string; teamId?: string }): Promise<Honour[]> {
    const predicate = subject.personId
      ? eq(honour.personId, subject.personId)
      : subject.teamId
        ? eq(honour.teamId, subject.teamId)
        : null;

    if (!predicate) return [];

    const rows = await this.database.db
      .select({
        id: honour.id,
        kind: honour.kind,
        title: honour.title,
        year: honour.year,
        note: honour.note,
        prestige: honour.prestige,
      })
      .from(honour)
      .where(predicate)
      // Prestige first, then recency. Ordered by year alone, Messi's profile
      // led with a ceremonial award and buried eight Ballons d'Or below it,
      // because the newest thing is rarely the most important one.
      //
      // Unranked honours sort after every tier rather than before: null means
      // the sport's list does not cover it, which is not a claim that it is
      // significant. Undated honours likewise sort last within their tier,
      // since a null year is missing information and not an ancient one.
      .orderBy(sql`${honour.prestige} asc nulls last`, sql`${honour.year} desc nulls last`)
      // Raised from 100 because the cap was cutting the part that matters.
      // Messi has 200 recorded honours, and truncating at 100 removed four of
      // his eight Ballons d'Or, so the page counted the award twice at four
      // each. Ordered by prestige the important rows come first, but the count
      // of repeats is only right if the whole set is present.
      .limit(400);

    return rows;
  }

  /**
   * The registry for one sport and subject.
   *
   * Both sport-wide definitions (discipline null) and discipline-specific ones
   * are fetched together, because a single statistics block may draw on both:
   * a cricketer's Test block uses Test-specific definitions, while `appearances`
   * is defined once for the sport.
   */
  private async definitionsForSport(
    sportId: string,
    appliesTo: 'player' | 'team',
  ): Promise<DefinitionRow[]> {
    return this.database.db
      .select({
        key: statisticDefinition.key,
        label: statisticDefinition.label,
        shortLabel: statisticDefinition.shortLabel,
        category: statisticDefinition.category,
        format: statisticDefinition.format,
        precision: statisticDefinition.precision,
        higherIsBetter: statisticDefinition.higherIsBetter,
        description: statisticDefinition.description,
        displayOrder: statisticDefinition.displayOrder,
        disciplineId: statisticDefinition.disciplineId,
      })
      .from(statisticDefinition)
      .where(
        and(
          eq(statisticDefinition.sportId, sportId),
          or(
            eq(statisticDefinition.appliesTo, appliesTo),
            eq(statisticDefinition.appliesTo, 'both'),
          ),
        ),
      )
      .orderBy(asc(statisticDefinition.displayOrder));
  }

  /**
   * Matches stored values against the registry.
   *
   * Definitions scoped to the row's own discipline win over sport-wide ones with
   * the same key, which is what lets `batting_average` mean something slightly
   * different in Test and T20 while sharing a key.
   */
  private render(
    stats: Record<string, unknown>,
    definitions: DefinitionRow[],
    disciplineId: string | null,
  ): StatisticValue[] {
    const applicable = definitions.filter(
      (definition) => definition.disciplineId === null || definition.disciplineId === disciplineId,
    );

    // Discipline-specific definitions take precedence, so they are written last.
    const byKey = new Map<string, DefinitionRow>();
    for (const definition of applicable.filter((d) => d.disciplineId === null)) {
      byKey.set(definition.key, definition);
    }
    for (const definition of applicable.filter((d) => d.disciplineId !== null)) {
      byKey.set(definition.key, definition);
    }

    const values: StatisticValue[] = [];

    for (const [key, definition] of byKey) {
      // The sport's fixed set leads the statistics section already. Leaving
      // these in here as well printed each number twice on the page.
      if (SUPPRESSED_KEYS.has(key)) continue;

      const raw = stats[key];
      // Undefined means the statistic was never recorded, which is different
      // from a recorded zero and must not render as one.
      if (raw === undefined) continue;

      values.push({
        key,
        label: definition.label,
        shortLabel: definition.shortLabel,
        category: definition.category,
        format: definition.format,
        precision: definition.precision,
        higherIsBetter: definition.higherIsBetter,
        description: definition.description,
        value: typeof raw === 'number' || typeof raw === 'string' ? raw : null,
      });
    }

    return values;
  }
}

interface DefinitionRow {
  key: string;
  label: string;
  shortLabel: string | null;
  category: string | null;
  format: string;
  precision: number;
  higherIsBetter: boolean;
  description: string | null;
  displayOrder: number;
  disciplineId: string | null;
}

/** Re-exported so callers can reference the null-discipline predicate. */
export { isNull };
