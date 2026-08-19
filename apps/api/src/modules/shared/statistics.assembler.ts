import { Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, or, sql } from 'drizzle-orm';
import type { Honour, StatisticGroup, StatisticValue } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  discipline,
  honour,
  personStatistic,
  statisticDefinition,
  teamStatistic,
} from '../../database/schema';

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
      })
      .from(honour)
      .where(predicate)
      // Undated honours sort last rather than first: a null year is missing
      // information, not an ancient one.
      .orderBy(sql`${honour.year} desc nulls last`)
      .limit(100);

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
