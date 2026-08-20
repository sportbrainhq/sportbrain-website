import { Injectable, Logger } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { entityFact, entityRanking, MANUAL_RANKING_SOURCE } from '../../database/schema';
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

    // Shared by the roll of honour and the awards, which both have to exclude
    // editions that have not been played yet.
    const currentYear = new Date().getFullYear();
    const today = new Date();

    // The years of editions confirmed to have finished. Populated by the roll
    // of honour below and read by the awards, which have no dates of their own
    // and would otherwise need a second, weaker rule for the same judgement.
    const playedYears = new Set<number>();
    // Whether the editions lookup actually returned. The two lookups fail
    // independently, and an empty `playedYears` caused by a failed request
    // means "unknown", not "nothing has been played": treating the two alike
    // would silently drop every dated award whenever that one query errored.
    let editionsKnown = false;

    try {
      const editions = await this.wikidata.fetchCompetitionEditions(competitionQid);

      // Editions that have not finished are excluded, because the source lists
      // scheduled tournaments and sometimes attaches a winner to them before
      // they are played.
      //
      // Completion is judged on the end date, not the year. An earlier version
      // compared the year against the current one, which was wrong in both
      // directions: it admitted a season running right now, and it discarded
      // the 2026 World Cup, a tournament that finished on 19 July 2026 with
      // Spain beating Argentina. Dropping a real result is the worse failure,
      // since the page then contradicts every other source.
      //
      // Where no end date is recorded the year is the only signal available, and
      // an edition from a previous year has certainly finished.
      const played = editions.filter((row) => {
        if (row.endsOn) return new Date(row.endsOn) <= today;
        return row.year !== undefined && row.year < currentYear;
      });

      // A host is worth showing for a tournament that moves between countries
      // and is noise for a domestic league, where every season is "hosted by"
      // the same nation. Judged by whether the hosts actually vary.
      editionsKnown = true;
      for (const row of played) if (row.year !== undefined) playedYears.add(row.year);

      const distinctHosts = new Set(played.map((row) => row.hosts).filter(Boolean));
      const hostsAreMeaningful = distinctHosts.size > 1;

      // Deduplicated on the edition rather than the row. The same edition can
      // come back more than once when its qualifiers differ: the 2020 Nations
      // League returned France twice, once carrying a host and once not, and
      // the roll of honour listed the same title in consecutive rows. Keeping
      // the first occurrence keeps the richer row, since the sort below has not
      // run yet and the hosted variant sorts no differently.
      const seenEditions = new Set<string>();
      const withWinners = played
        .filter((row) => row.winner)
        .filter((row) => {
          const key = `${row.winner}\u001f${row.year ?? ''}`;
          if (seenEditions.has(key)) return false;
          seenEditions.add(key);
          return true;
        })
        .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
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
        // Deduplicated here as well as in the query. The SPARQL UNION is one
        // source of repeats and the only one that has bitten, but an award held
        // jointly, or recorded twice with different qualifiers, arrives as two
        // identical rows too, and a repeated line in a table is the single most
        // visible kind of wrong.
        // Keyed on person and year, and on the person alone when no year is
        // recorded. Without the second case an award whose edition is undated
        // repeated whenever the two rows carried different qualifier values:
        // the Euro listed Lamine Yamal twice as best young player.
        const seen = new Set<string>();
        const unique = entries.filter((entry) => {
          const key = `${entry.person}\u001f${entry.year ?? ''}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Same reasoning as the roll of honour: an award for a tournament that
        // has not been played yet is not a result. Matched against the editions
        // that were found to have finished, so an award is admitted on the same
        // evidence as its tournament's winner rather than on a second, weaker
        // rule of its own.
        const played = unique.filter((entry) => {
          if (entry.year === undefined) return true;
          if (editionsKnown) return playedYears.has(entry.year);
          // Editions unavailable: fall back to the year comparison rather than
          // rejecting everything.
          return entry.year <= currentYear;
        });

        // A table too short to be worth showing is deleted rather than skipped.
        // Skipping leaves whatever a previous run wrote, so the Euro kept a
        // two-row "Best young player" listing Lamine Yamal twice long after
        // deduplication had reduced it to a single entry: the fix could never
        // land because the fixed table was too small to be written.
        if (played.length < 2) {
          await this.database.db.delete(entityRanking).where(
            and(
              eq(entityRanking.entityType, 'competition'),
              eq(entityRanking.entityId, competitionId),
              eq(entityRanking.kind, `award:${this.slugifyKey(criterion)}`),
              // Never delete a hand-seeded table. The crawled version of an
              // award can shrink below the threshold while the seeded one is
              // complete, and this delete would otherwise remove it.
              sql`${entityRanking.sourceTitle} IS DISTINCT FROM ${MANUAL_RANKING_SOURCE}`,
            ),
          );
          continue;
        }

        await this.writeRanking('competition', competitionId, {
          kind: `award:${this.slugifyKey(criterion)}`,
          label: this.humaniseCriterion(criterion),
          entries: played
            .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
            .slice(0, 30)
            .map((entry, index: number) => ({
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
        // A hand-seeded table is never replaced by a crawled one. Wikidata's
        // award coverage lags: it carries World Cup awards only to 2022, while
        // the 2026 winners are published and seeded here, and without this the
        // next enrichment run would overwrite them with the shorter list.
        setWhere: sql`${entityRanking.sourceTitle} IS DISTINCT FROM ${MANUAL_RANKING_SOURCE}
          AND (${entityRanking.confidence} <> 'high' OR ${ranking.confidence} = 'high')`,
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
      'more goals scored': 'Golden Boot',
      'most valuable player award': 'Golden Ball',
      'best goalkeeper': 'Golden Glove',
      'best young player': 'Best Young Player',
    };
    return known[criterion.toLowerCase()] ?? criterion.replace(/^./, (c) => c.toUpperCase());
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
