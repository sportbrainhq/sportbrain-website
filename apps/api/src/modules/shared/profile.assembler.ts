import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { EntityProfile } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  entityFact,
  entityRanking,
  entitySection,
  externalMapping,
  person,
  team,
} from '../../database/schema';

/**
 * The order the ranking tables appear in on an entity page.
 *
 * A fixed sequence rather than a column on the table, because the ordering is a
 * presentation decision shared by every entity of a type, not a property of any
 * one row. Appearances come before goals: a reader comparing two clubs wants
 * the same table in the same place, and appearances is the broader measure.
 *
 * For a competition the roll of honour leads, because who won is the first
 * thing anyone opens a tournament page to see, and the individual awards follow
 * in the order the trophies are ranked: the Golden Ball is the tournament's
 * headline prize, then the Golden Boot, the Golden Glove, and the young player
 * award. Listing them alphabetically put Best Young Player above all three.
 *
 * The two groups share one list because a kind belongs to only one of them: a
 * club has no `award:` tables and a competition has no `most_appearances`.
 *
 * Cricket's tables come last in this list and are ordered format by format:
 * Test, then ODI, then T20I, and within each, matches then runs then wickets.
 * The grouping is what makes the page readable. A cricket side has up to nine
 * of these, and interleaving them by metric would put a Test batting record
 * beside a T20I bowling one, which invites exactly the cross-format comparison
 * the discipline model exists to prevent. Formats run longest-first because
 * that is the order the sport itself lists them in.
 *
 * Anything unlisted sorts after these, alphabetically by kind, so a new kind
 * appears predictably rather than at a random position.
 */
const RANKING_ORDER = [
  'roll_of_honour',
  'most_appearances',
  // Cricket's individual award sits above the metric leaderboards: a reader
  // scanning a tournament asks who won it, who played most and who was named
  // its best player before asking for the run and wicket tables.
  'award:player-of-the-tournament',
  'award:player-of-the-season',
  'top_scorers',
  'award:most-valuable-player-award',
  'award:more-goals-scored',
  'award:best-goalkeeper',
  'award:best-young-player',
  // Cricket competition tables. Placed after football's shared kinds and before
  // the per-format career kinds, in the order a reader asks the questions:
  // who won it, who played most, who won the individual award, then the runs,
  // wickets and catches leaderboards.
  //
  // `roll_of_honour`, `most_appearances` and `top_scorers` are reused above
  // rather than duplicated, because "winners", "most matches" and "most runs"
  // are the same questions football already asks.
  'most_wickets',
  'most_catches',
  'most_wicketkeeper_dismissals',
  'test_most_matches',
  'test_most_runs',
  'test_most_wickets',
  'odi_most_matches',
  'odi_most_runs',
  'odi_most_wickets',
  't20i_most_matches',
  't20i_most_runs',
  't20i_most_wickets',
  // Franchise and domestic sides. Separate kinds from the international ones
  // because an IPL record is not a T20I record: the competition is not
  // international cricket, and sharing a kind would invite summing the two.
  'club_most_runs',
  'club_most_wickets',
  // Basketball team tables. The two award rolls lead, because who won the MVP
  // here is the question a reader opens a franchise page with, and the per-game
  // leaders follow in the order the sport quotes them: points, rebounds,
  // assists.
  'basketball_league_mvp',
  'basketball_finals_mvp',
  'basketball_all_time_points',
  'basketball_all_time_rebounds',
  'basketball_all_time_assists',
  // A basketball league's own page: who won it, then the individual awards in
  // the order the sport ranks them, then the career boards. `roll_of_honour` is
  // declared at the top of this list and covers the champions table.
  'award:most-valuable-player',
  'award:finals-most-valuable-player',
  'award:scoring-champion',
  'award:defensive-player-of-the-year',
  'award:rookie-of-the-year',
  'all_time_points',
  'all_time_rebounds',
  'all_time_assists',
  'all_time_steals',
  // The UFC's own page: bouts before wins, career figures before the
  // title-scoped ones, matching the order the sport's own record pages quote
  // them in.
  'most_bouts',
  'most_title_bouts',
  'most_wins',
  'most_title_wins',
];

const rankingOrder = sql`array_position(
  ${sql.raw(`ARRAY[${RANKING_ORDER.map((kind) => `'${kind}'`).join(', ')}]::text[]`)},
  ${entityRanking.kind}
) NULLS LAST`;

/**
 * Gathers the rich detail behind an entity page.
 *
 * Shared by teams, players and competitions because the assembly is identical
 * for all three: only the subject changes. The three sources are queried in
 * parallel, since none depends on the others and running them in sequence would
 * treble the latency of every entity page.
 */
@Injectable()
export class ProfileAssembler {
  constructor(private readonly database: DatabaseService) {}

  async forEntity(
    entityType: 'team' | 'person' | 'competition',
    entityId: string,
  ): Promise<EntityProfile> {
    const [facts, sections, rankings] = await Promise.all([
      this.database.db
        .select({
          key: entityFact.key,
          label: entityFact.label,
          value: entityFact.value,
          category: entityFact.category,
        })
        .from(entityFact)
        .where(and(eq(entityFact.entityType, entityType), eq(entityFact.entityId, entityId)))
        .orderBy(asc(entityFact.displayOrder))
        .limit(60),

      this.database.db
        .select({
          kind: entitySection.kind,
          heading: entitySection.heading,
          body: entitySection.body,
        })
        .from(entitySection)
        .where(
          and(
            eq(entitySection.entityType, entityType),
            eq(entitySection.entityId, entityId),
            // Drafts never reach the public site. Filtered here rather than by
            // callers, so one forgotten predicate cannot leak unfinished prose.
            eq(entitySection.status, 'published'),
          ),
        )
        .orderBy(asc(entitySection.displayOrder))
        .limit(20),

      this.database.db
        .select({
          kind: entityRanking.kind,
          label: entityRanking.label,
          confidence: entityRanking.confidence,
          note: entityRanking.note,
          entries: entityRanking.entries,
        })
        .from(entityRanking)
        .where(and(eq(entityRanking.entityType, entityType), eq(entityRanking.entityId, entityId)))
        // Ordered explicitly. Without this the rows came back in whatever order
        // Postgres happened to hold them, which is write order, so a club whose
        // scorers table was ingested first showed its tables the other way up
        // from its neighbours: Liverpool led with Top scorers where Real Madrid
        // led with Most appearances.
        .orderBy(rankingOrder, asc(entityRanking.kind))
        // Raised from 20, which was sized when a team had two tables. A cricket
        // side carries up to nine leaderboards on its own, and a limit that
        // clipped them would drop whichever format sorted last.
        .limit(40),
    ]);

    // Resolved in one query for every table on the page rather than per entry,
    // so a club with two tables of fifteen players costs one lookup instead of
    // thirty.
    const allEntries = rankings.flatMap((ranking) => (ranking.entries ?? []) as RawEntry[]);
    const [playerSlugs, teamSlugs, playersByName, teamsByName] = await Promise.all([
      this.resolvePlayers(allEntries.map((entry) => entry.link ?? '')),
      this.resolveTeams(allEntries.map((entry) => entry.link ?? '')),
      // The curated competition tables carry no source link, so the name is the
      // only handle on the entity. Ambiguous names resolve to nothing.
      this.resolveByName(
        'person',
        allEntries.map((entry) => entry.name),
      ),
      this.resolveByName(
        'team',
        allEntries.map((entry) => entry.name),
      ),
    ]);

    return {
      facts,
      sections,
      rankings: rankings.map((ranking) => ({
        kind: ranking.kind,
        label: ranking.label,
        // Widened at the database level and narrowed here, so an unexpected
        // value degrades to the most cautious reading rather than failing
        // validation and taking the whole page with it.
        confidence:
          ranking.confidence === 'high' || ranking.confidence === 'partial'
            ? ranking.confidence
            : 'indicative',
        note: ranking.note,
        entries: ((ranking.entries ?? []) as RawEntry[]).map((entry) => {
          const key = normaliseName(entry.name);
          const mapped = entry.link ? (playerSlugs.get(entry.link) ?? null) : null;
          const namedPlayer = playersByName.get(key) ?? null;
          const namedTeam = teamsByName.get(key) ?? null;

          // A slug stored on the row is the most authoritative of the three:
          // whoever wrote it resolved the entity rather than guessing from a
          // name. Then a mapped Wikipedia link. Only then a name, and a name is
          // followed only when it points at one kind of entity: a row reading
          // "Brazil" that matches both a nation and a person stays plain text
          // rather than sending a reader to the wrong page.
          const stored = entry.playerSlug ?? null;
          const mappedTeam = entry.link ? (teamSlugs.get(entry.link) ?? null) : null;

          const playerSlug = stored ?? mapped ?? (namedTeam ? null : namedPlayer);
          // A team link resolved through the mapping outranks a name match, and
          // is only consulted once the row has failed to resolve to a person.
          const teamSlug = stored || mapped || namedPlayer ? null : (mappedTeam ?? namedTeam);

          return {
            rank: entry.rank,
            name: entry.name,
            value: entry.value ?? null,
            detail: entry.detail ?? null,
            playerSlug,
            teamSlug,
          };
        }) as EntityProfile['rankings'][number]['entries'],
      })),
    };
  }

  /**
   * Maps Wikipedia article titles onto the slugs of players we hold.
   *
   * Joined through `external_mapping` rather than matched on name, which is the
   * whole reason that table exists: the tables print "Raúl" where the entity is
   * "Raúl (footballer)", and two players can share a name while no two share an
   * article. Titles with no mapping are simply absent from the result, and the
   * page renders those rows as plain text.
   */
  private async resolvePlayers(titles: string[]): Promise<Map<string, string>> {
    const wanted = [...new Set(titles.filter(Boolean))];
    if (wanted.length === 0) return new Map();

    const rows = await this.database.db
      .select({ title: externalMapping.externalId, slug: person.slug })
      .from(externalMapping)
      .innerJoin(person, eq(person.id, externalMapping.entityId))
      .where(
        and(
          eq(externalMapping.provider, 'wikipedia'),
          eq(externalMapping.entityType, 'person'),
          inArray(externalMapping.externalId, wanted),
        ),
      );

    return new Map(rows.map((row) => [row.title, row.slug]));
  }

  /**
   * Maps Wikipedia article titles onto the slugs of teams we hold.
   *
   * The team counterpart of `resolvePlayers`, and needed for the same reason:
   * a roll of honour prints a name the entity is not stored under. FIBA's
   * champions read "Germany" where the team is "Germany men's national
   * basketball team", and the NCAA's read "Michigan" for "Michigan Wolverines
   * men's basketball", so matching on the printed name found nothing and every
   * row on four competition pages rendered as plain text.
   *
   * A trailing "team" is tolerated on the way in. The champions articles link to
   * "... men's basketball team" while the catalogue stores the title without it,
   * which is a difference in the source rather than in the entity.
   */
  private async resolveTeams(titles: string[]): Promise<Map<string, string>> {
    const wanted = [...new Set(titles.filter(Boolean))];
    if (wanted.length === 0) return new Map();

    // Both spellings are asked for, so either mapping resolves.
    const variants = [
      ...new Set(
        wanted.flatMap((title) =>
          title.endsWith(' team') ? [title, title.slice(0, -' team'.length)] : [title],
        ),
      ),
    ];

    const rows = await this.database.db
      .select({ title: externalMapping.externalId, slug: team.slug })
      .from(externalMapping)
      .innerJoin(team, eq(team.id, externalMapping.entityId))
      .where(
        and(
          eq(externalMapping.provider, 'wikipedia'),
          eq(externalMapping.entityType, 'team'),
          inArray(externalMapping.externalId, variants),
        ),
      );

    const bySlug = new Map<string, string>();
    for (const row of rows) {
      bySlug.set(row.title, row.slug);
      // Indexed under the spelling the caller asked for as well.
      bySlug.set(`${row.title} team`, row.slug);
    }

    return bySlug;
  }

  /**
   * Maps the names printed in a table onto the slugs of entities we hold.
   *
   * The fallback for tables with no source link, which is all of the curated
   * competition ones: a roll of honour prints "Spain men's national football
   * team" and a scorers table prints "Alan Shearer", and neither carries an
   * article title to join on.
   *
   * A name that matches more than one entity is dropped rather than resolved to
   * the first row, because the duplicates are the dangerous cases: two players
   * called Ronaldo are different people and a link to the wrong one is worse
   * than no link. Aliases and short names are matched as well as the canonical
   * name, so "Barcelona" reaches FC Barcelona where the alias is recorded.
   */
  private async resolveByName(
    entityType: 'person' | 'team',
    names: string[],
  ): Promise<Map<string, string>> {
    const wanted = [...new Set(names.map(normaliseName).filter(Boolean))];
    if (wanted.length === 0) return new Map();
    const wantedSet = new Set(wanted);

    const rows =
      entityType === 'person'
        ? await this.database.db
            .select({
              slug: person.slug,
              names: sql<
                string[]
              >`array[${person.fullName}, ${person.displayName}] || ${person.aliases}`,
            })
            .from(person)
            .where(nameMatches(wanted, [person.fullName, person.displayName], person.aliases))
        : await this.database.db
            .select({
              slug: team.slug,
              names: sql<string[]>`array[${team.name}, ${team.shortName}] || ${team.aliases}`,
            })
            .from(team)
            .where(nameMatches(wanted, [team.name, team.shortName], team.aliases));

    const bySlug = new Map<string, string | null>();
    for (const row of rows) {
      for (const candidate of new Set((row.names ?? []).map(normaliseName))) {
        if (!wantedSet.has(candidate)) continue;
        // The second entity claiming a name marks it ambiguous, and a later
        // match cannot rescue it.
        const seen = bySlug.get(candidate);
        if (seen === undefined) bySlug.set(candidate, row.slug);
        else if (seen !== row.slug) bySlug.set(candidate, null);
      }
    }

    return new Map([...bySlug].filter((pair): pair is [string, string] => pair[1] !== null));
  }
}

/**
 * "Any of these columns, or any alias, equals one of the wanted names."
 *
 * Compared case-insensitively, since the source tables and the entity records
 * disagree on capitalisation often enough to matter.
 */
function nameMatches(
  wanted: string[],
  columns: AnyPgColumn[],
  aliases: AnyPgColumn,
): SQL | undefined {
  const list = sql.join(
    wanted.map((name) => sql`${name}`),
    sql`, `,
  );
  return or(
    ...columns.map((column) => sql`lower(${column}) in (${list})`),
    sql`exists (select 1 from unnest(${aliases}) as alias where lower(alias) in (${list}))`,
  );
}

/** Table names and entity names differ only in case and padding, in practice. */
function normaliseName(name: string | null | undefined): string {
  return (name ?? '').trim().toLowerCase();
}

/** The stored shape of a ranking entry, before the link is resolved. */
interface RawEntry {
  rank: number;
  name: string;
  value: number | string | null;
  detail: string | null;
  link?: string | null;
  /**
   * A slug resolved when the row was written, rather than from its name.
   *
   * Derived tables know exactly which person a row is about, because they are
   * built from a join on `person.id`. Re-deriving that from the name here can
   * only lose information, and did: three fictional characters ingested as
   * basketball teams made "Michael Jordan" and "Charles Barkley" ambiguous
   * between a person and a team, and the guard below then blanked the link on
   * every one of their MVP rows.
   */
  playerSlug?: string | null;
}
