import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { entityFact, entityRanking } from '../../database/schema';
import { WikidataProvider } from '../providers/wikidata/wikidata.provider';

/**
 * Fills entity pages with the detail that makes them worth reading.
 *
 * Separate from the bulk ingestion because it works the other way round: bulk
 * ingestion fetches many entities shallowly, this fetches one entity deeply. A
 * club profile is a handful of queries against a single QID, so it is run for
 * the entities that matter rather than across the whole catalogue.
 *
 * Everything written here is replaceable. Facts and rankings are overwritten on
 * each run; authored sections live in a different table precisely so that this
 * cannot touch them.
 */
@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly wikidata: WikidataProvider,
  ) {}

  /**
   * Enriches one club: identity facts, current officials, and player totals.
   *
   * Returns counts rather than throwing on partial failure. Coverage varies so
   * much between clubs that a missing section is the normal case, not an error:
   * Barcelona has a motto and an anthem, Real Madrid has neither, and both are
   * among the best-documented clubs in existence.
   */
  async enrichTeam(teamId: string, teamQid: string): Promise<{ facts: number; rankings: number }> {
    let facts = 0;
    let rankings = 0;

    try {
      const profile = await this.wikidata.fetchClubProfile(teamQid);
      facts += await this.writeFacts('team', teamId, profile);
    } catch (error) {
      this.logger.warn(`Club profile failed for ${teamQid}: ${this.message(error)}`);
    }

    try {
      const people = await this.wikidata.fetchClubPeople(teamQid);
      facts += await this.writeFacts('team', teamId, people);
    } catch (error) {
      this.logger.warn(`Club people failed for ${teamQid}: ${this.message(error)}`);
    }

    try {
      const totals = await this.wikidata.fetchClubPlayerTotals(teamQid);

      const scorers = totals
        .filter((row) => row.goals > 0)
        .slice(0, 15)
        .map((row, index) => ({
          rank: index + 1,
          name: row.name,
          value: row.goals,
          detail: row.appearances > 0 ? `${row.appearances} appearances` : null,
        }));

      if (scorers.length > 0) {
        // Labelled "Notable", never "All-time top scorers". The aggregation is
        // built from roughly a third of the club's player spells and is known to
        // surface at least one figure that is plainly wrong, so presenting it as
        // a definitive ranking would be publishing something we know to be
        // incorrect. The note below carries that caveat to the reader.
        await this.writeRanking('team', teamId, {
          kind: 'top_scorers',
          // Same label as the parsed table, because the reader is looking for
          // the same thing either way. The `partial` confidence and the note
          // below are what say the figures are incomplete, not the heading.
          label: 'Top scorers',
          entries: scorers,
          confidence: 'partial',
          note: 'Aggregated from community-maintained records. Coverage is incomplete and figures may differ from official club records.',
        });
        rankings += 1;
      }

      const appearances = [...totals]
        .filter((row) => row.appearances > 0)
        .sort((a, b) => b.appearances - a.appearances)
        .slice(0, 15)
        .map((row, index) => ({
          rank: index + 1,
          name: row.name,
          value: row.appearances,
          detail: row.goals > 0 ? `${row.goals} goals` : null,
        }));

      if (appearances.length > 0) {
        await this.writeRanking('team', teamId, {
          kind: 'most_appearances',
          label: 'Most appearances',
          entries: appearances,
          confidence: 'partial',
          note: 'Aggregated from community-maintained records. Coverage is incomplete.',
        });
        rankings += 1;
      }
    } catch (error) {
      this.logger.warn(`Player totals failed for ${teamQid}: ${this.message(error)}`);
    }

    return { facts, rankings };
  }

  /**
   * Enriches one competition: its editions, their winners, and per-edition awards.
   *
   * Unlike the club scorer aggregation, the awards here are recorded facts
   * rather than a sum over partial data, so they carry high confidence. Edition
   * coverage still varies: the FIFA World Cup is essentially complete, while the
   * Cricket World Cup is missing about half its winners.
   */
  async enrichCompetition(
    competitionId: string,
    competitionQid: string,
  ): Promise<{ rankings: number }> {
    let rankings = 0;

    try {
      const editions = await this.wikidata.fetchCompetitionEditions(competitionQid);

      // Future editions are present in the source and occasionally carry a
      // "winner" already. A roll of honour listing a tournament that has not
      // been played is worse than one that stops at the present.
      const currentYear = new Date().getFullYear();
      const played = editions.filter((row) => row.year !== undefined && row.year <= currentYear);

      // A host is worth showing for a tournament that moves between countries
      // and is noise for a domestic league, where every season is "hosted by"
      // the same nation. Judged by whether the hosts actually vary.
      const distinctHosts = new Set(played.map((row) => row.hosts).filter(Boolean));
      const hostsAreMeaningful = distinctHosts.size > 1;

      const withWinners = played
        .filter((row) => row.winner)
        .map((row, index) => ({
          rank: index + 1,
          name: row.winner ?? '',
          value: row.year ?? null,
          detail: hostsAreMeaningful && row.hosts ? `hosted by ${row.hosts}` : null,
        }));

      if (withWinners.length > 0) {
        const missing = played.length - withWinners.length;
        await this.writeRanking('competition', competitionId, {
          kind: 'roll_of_honour',
          label: 'Winners',
          entries: withWinners,
          confidence: missing > withWinners.length / 4 ? 'partial' : 'high',
          note:
            missing > 0
              ? `${missing} of ${played.length} recorded editions have no winner listed in the source.`
              : null,
        });
        rankings += 1;
      }
    } catch (error) {
      this.logger.warn(`Editions failed for ${competitionQid}: ${this.message(error)}`);
    }

    try {
      const awards = await this.wikidata.fetchCompetitionAwards(competitionQid);

      // Grouped by what the award was for, so a page shows separate top-scorer
      // and player-of-the-tournament tables rather than one undifferentiated
      // list. The criterion text comes from the source and is used as given.
      const byCriterion = new Map<string, typeof awards>();
      for (const award of awards) {
        const key = award.criterion ?? 'Award';
        byCriterion.set(key, [...(byCriterion.get(key) ?? []), award]);
      }

      for (const [criterion, entries] of byCriterion) {
        if (entries.length < 2) continue;

        await this.writeRanking('competition', competitionId, {
          kind: `award:${this.slugifyKey(criterion)}`,
          label: this.humaniseCriterion(criterion),
          entries: entries.slice(0, 30).map((entry, index: number) => ({
            rank: index + 1,
            name: entry.person,
            value: entry.value ?? entry.year ?? null,
            detail: entry.year ? String(entry.year) : null,
          })),
          confidence: 'high',
          note: null,
        });
        rankings += 1;
      }
    } catch (error) {
      this.logger.warn(`Awards failed for ${competitionQid}: ${this.message(error)}`);
    }

    return { rankings };
  }

  /** Enriches one person: draft, physical detail, position. */
  async enrichPerson(personId: string, personQid: string): Promise<{ facts: number }> {
    try {
      const profile = await this.wikidata.fetchPlayerProfile(personQid);
      return { facts: await this.writeFacts('person', personId, profile) };
    } catch (error) {
      this.logger.warn(`Player profile failed for ${personQid}: ${this.message(error)}`);
      return { facts: 0 };
    }
  }

  // ---------------------------------------------------------------------------

  private async writeFacts(
    entityType: string,
    entityId: string,
    facts: { key: string; label: string; value: string; category: string; order: number }[],
  ): Promise<number> {
    let written = 0;

    for (const fact of facts) {
      if (!fact.value) continue;

      await this.database.db
        .insert(entityFact)
        .values({
          entityType,
          entityId,
          key: fact.key,
          label: fact.label,
          value: fact.value,
          category: fact.category,
          displayOrder: fact.order,
          source: 'wikidata',
        })
        .onConflictDoUpdate({
          target: [entityFact.entityType, entityFact.entityId, entityFact.key, entityFact.value],
          set: { label: fact.label, category: fact.category, updatedAt: new Date() },
        });
      written += 1;
    }

    return written;
  }

  private async writeRanking(
    entityType: string,
    entityId: string,
    ranking: {
      kind: string;
      label: string;
      entries: unknown[];
      confidence: string;
      note: string | null;
    },
  ): Promise<void> {
    await this.database.db
      .insert(entityRanking)
      .values({
        entityType,
        entityId,
        kind: ranking.kind,
        label: ranking.label,
        entries: ranking.entries,
        confidence: ranking.confidence,
        note: ranking.note,
      })
      .onConflictDoUpdate({
        target: [entityRanking.entityType, entityRanking.entityId, entityRanking.kind],
        set: {
          label: ranking.label,
          entries: ranking.entries,
          confidence: ranking.confidence,
          note: ranking.note,
          updatedAt: new Date(),
        },
        // A partial aggregation must never replace a table parsed from the
        // club's records article. Both write the same key, so without this the
        // winner was whichever ran last: Barcelona's page showed Josep Samitier
        // as its leading scorer on 333, where the records article says Messi on
        // 672. The aggregate is built from about a third of the club's player
        // spells, so it is a fallback for clubs with no parsable article and
        // nothing more.
        setWhere: sql`${entityRanking.confidence} <> 'high' OR ${ranking.confidence} = 'high'`,
      });
  }

  /** `more goals scored` becomes `more-goals-scored`, for use in a ranking key. */
  private slugifyKey(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  }

  /**
   * Turns the source's criterion wording into a heading.
   *
   * The source phrases these as comparisons ("more goals scored") because they
   * describe why somebody led a statistic. As a table heading that reads oddly,
   * so the common cases are mapped and anything unrecognised is passed through
   * rather than mangled.
   */
  private humaniseCriterion(criterion: string): string {
    const known: Record<string, string> = {
      'more goals scored': 'Top scorers',
      'most valuable player award': 'Player of the tournament',
      'best goalkeeper': 'Best goalkeeper',
      'best young player': 'Best young player',
    };
    return known[criterion.toLowerCase()] ?? criterion.replace(/^./, (c) => c.toUpperCase());
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
