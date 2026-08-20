import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import {
  discipline,
  entityFact,
  entityRanking,
  externalMapping,
  MANUAL_RANKING_SOURCE,
} from '../../database/schema';
import {
  WikipediaProvider,
  type WikiFact,
  type WikiRanking,
} from '../providers/wikipedia/wikipedia.provider';

/**
 * Lands Wikipedia content in the canonical schema.
 *
 * The entity layer already holds Wikidata QIDs, and every QID carries the title
 * of its English Wikipedia article. That means no name matching is required
 * here: the join is exact, and the duplicate-and-mismatch problems that dogged
 * earlier ingestion simply do not arise.
 *
 * Facts land in `entity_fact`, leaderboards in `entity_ranking`, and cricket
 * career records in `person_statistic`. Nothing here writes prose.
 */
@Injectable()
export class WikipediaIngestionService {
  private readonly logger = new Logger(WikipediaIngestionService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly provider: WikipediaProvider,
    private readonly cache: CacheService,
  ) {}

  /**
   * Resolves Wikipedia titles for entities we already hold, via their QIDs.
   *
   * One request covers fifty entities, because the Wikidata API accepts batched
   * identifiers and returns sitelinks for all of them. Doing this per entity
   * would be fifty times the traffic against a donated service for identical
   * results.
   */
  async mapTitles(
    entityType: 'team' | 'person' | 'competition' | 'sport',
    sportSlug: string | null,
    limit: number,
  ): Promise<number> {
    const table = entityType === 'person' ? 'person' : entityType;
    const sportColumn = entityType === 'person' ? 'primary_sport_id' : 'sport_id';

    const rows = await this.database.db.execute<{ entity_id: string; qid: string }>(sql`
      SELECT em.entity_id, em.external_id AS qid
      FROM external_mapping em
      JOIN ${sql.raw(table)} e ON e.id = em.entity_id
      ${sql.raw(entityType === 'sport' ? '' : `JOIN sport s ON s.id = e.${sportColumn}`)}
      WHERE em.provider = 'wikidata'
        AND em.entity_type = ${entityType}
        ${sql.raw(sportSlug && entityType !== 'sport' ? `AND s.slug = '${sportSlug}'` : '')}
        AND NOT EXISTS (
          SELECT 1 FROM external_mapping w
          WHERE w.provider = 'wikipedia'
            AND w.entity_type = ${entityType}
            AND w.entity_id = em.entity_id
        )
      LIMIT ${limit}
    `);

    let mapped = 0;

    for (let index = 0; index < rows.length; index += 50) {
      const batch = rows.slice(index, index + 50);
      const qids = batch.map((row) => row.qid);

      const url =
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qids.join('|')}` +
        `&props=sitelinks&sitefilter=enwiki&format=json&formatversion=2`;

      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'SportBrainHQ/0.1 (tech@sportbrainhq.com)' },
          signal: AbortSignal.timeout(45_000),
        });
        const body = (await response.json()) as {
          entities?: Record<string, { sitelinks?: { enwiki?: { title?: string } } }>;
        };

        for (const row of batch) {
          const title = body.entities?.[row.qid]?.sitelinks?.enwiki?.title;
          // Plenty of entities have no English article. That is missing data,
          // not an error, and the entity keeps its Wikidata facts.
          if (!title) continue;

          await this.database.db
            .insert(externalMapping)
            .values({
              provider: 'wikipedia',
              entityType,
              externalId: title,
              entityId: row.entity_id,
              matchMethod: 'deterministic',
              matchConfidence: '1.000',
              lastSyncedAt: new Date(),
            })
            .onConflictDoNothing();
          mapped += 1;
        }
      } catch (error) {
        this.logger.warn(`Title mapping batch failed: ${this.message(error)}`);
      }
    }

    return mapped;
  }

  /** Ingests facts for one entity type across a sport. */
  async ingestFacts(
    entityType: 'team' | 'person' | 'competition' | 'sport',
    sportSlug: string | null,
    limit: number,
    slug?: string,
  ): Promise<{ entities: number; facts: number }> {
    const targets = await this.targets(entityType, sportSlug, limit, slug);
    let facts = 0;
    let entities = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const extracted =
          entityType === 'sport'
            ? await this.provider.fetchSportFacts(target.title)
            : entityType === 'competition'
              ? await this.provider.fetchCompetitionFacts(target.title)
              : entityType === 'team'
                ? await this.provider.fetchTeamFacts(target.title)
                : await this.provider.fetchPlayerFacts(target.title);

        if (extracted.length > 0) {
          facts += await this.writeFacts(entityType, target.id, extracted);
          entities += 1;
        }
      } catch (error) {
        this.logger.warn(`Facts failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} ${entityType}`);
      }
    }

    return { entities, facts };
  }

  /**
   * Backfills team crests from en.wikipedia infoboxes.
   *
   * Wikidata cannot supply these. Its crest property is absent for Real Madrid,
   * Arsenal, Manchester City, Manchester United and France, because a club crest
   * is a copyrighted logo and Commons hosts only freely-licensed media. The
   * files live on en.wikipedia under fair use, and the infobox is what names
   * them. See `WikipediaProvider.crestFileFrom` and
   * `WikipediaClient.fetchThumbnails` for the verification behind both halves.
   *
   * Requested at 512px and stored at that width. Crests are overwhelmingly SVG,
   * so the rasterised thumbnail is sharp at any display size, and 512 covers the
   * largest place one is currently drawn (80px at 2x) with room to spare. Storing
   * a rendered thumbnail rather than the SVG is deliberate: it keeps the existing
   * `<img>` rendering path unchanged.
   *
   * `overwrite` is off by default, so a crest already held is left alone and the
   * job can be re-run cheaply to fill only what is missing. Pass it to replace
   * the Wikidata-sourced values that are not crests at all: 92 of the 317 stored
   * logos are photographs, flags or colour swatches, Barcelona's among them.
   *
   * One wikitext fetch per team, throttled by the client. The thumbnail lookups
   * are batched fifty at a time.
   */
  async ingestTeamCrests(
    sportSlug: string | null,
    limit: number,
    overwrite = false,
  ): Promise<{ examined: number; resolved: number; written: number }> {
    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT e.id, em.external_id AS title, e.name
      FROM external_mapping em
      JOIN team e ON e.id = em.entity_id
      JOIN sport s ON s.id = e.sport_id
      WHERE em.provider = 'wikipedia'
        AND em.entity_type = 'team'
        ${sql.raw(sportSlug ? `AND s.slug = '${sportSlug}'` : '')}
        ${sql.raw(overwrite ? '' : 'AND e.logo_url IS NULL')}
      ORDER BY e.notability DESC
      LIMIT ${limit}
    `);

    // Collected before resolving, so the thumbnail lookups can be batched rather
    // than run one per team.
    const wanted = new Map<string, { id: string; name: string }[]>();
    let examined = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const wikitext = await this.provider.fetchWikitextFor(target.title);
        examined += 1;
        if (!wikitext) continue;

        const file = this.provider.crestFileFrom(wikitext);
        if (!file) continue;

        const group = wanted.get(file) ?? [];
        group.push({ id: target.id, name: target.name });
        wanted.set(file, group);
      } catch (error) {
        this.logger.warn(`Crest lookup failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} teams scanned`);
      }
    }

    const thumbnails = await this.provider.resolveThumbnails([...wanted.keys()], 512);

    let written = 0;

    for (const [file, teams] of wanted) {
      const url = thumbnails.get(file);
      if (!url) continue;

      for (const team of teams) {
        await this.database.db.execute(sql`
          UPDATE team SET logo_url = ${url}, updated_at = now() WHERE id = ${team.id}
        `);
        written += 1;
      }
    }

    return { examined, resolved: wanted.size, written };
  }

  /**
   * Ingests club record tables.
   *
   * The records article is a separate page from the club's own, and its title
   * has to be searched for rather than constructed: three of four guessed
   * titles resolved and Liverpool's did not. Clubs without one are skipped.
   */
  async ingestTeamRankings(
    sportSlug: string,
    limit: number,
  ): Promise<{ teams: number; rankings: number }> {
    const targets = await this.targets('team', sportSlug, limit);
    let teams = 0;
    let rankings = 0;

    for (const [index, target] of targets.entries()) {
      try {
        // No early exit on a missing records article: national sides without one
        // can still be read from their list of internationals, which is where
        // Poland's and Ecuador's leaderboards come from.
        const recordsTitle = await this.provider.findRecordsArticle(target.name, sportSlug);

        // The team's own article is passed as a second source: most sides
        // without a records article publish the same two tables there.
        const extracted = await this.provider.fetchTeamRankings(
          recordsTitle,
          target.name,
          target.title,
        );
        if (extracted.length === 0) continue;

        for (const ranking of extracted) {
          await this.writeRanking('team', target.id, ranking, ranking.sourceTitle ?? recordsTitle);
          rankings += 1;
        }
        teams += 1;
      } catch (error) {
        this.logger.warn(`Rankings failed for ${target.name}: ${this.message(error)}`);
      }

      if ((index + 1) % 10 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} teams, ${rankings} tables`);
      }
    }

    // The cache is evicted here rather than left to expire. Cache tags were
    // declared on every page fetch and nothing ever invalidated them, so a
    // corrected figure waited out the full hour: Atlético Madrid went on
    // showing Real Madrid's leaderboards long after the rows were deleted, and
    // the only reliable fix was rebuilding the web server.
    await this.revalidate([`sport:${sportSlug}`]);

    return { teams, rankings };
  }

  /**
   * Asks the web app to drop cached pages for a set of tags.
   *
   * Best effort by design: ingestion having succeeded is the valuable outcome,
   * and a web app that is not running, or not configured with the shared
   * secret, must not fail the run. The failure is logged so a stale page is
   * traceable to a missed revalidation rather than looking like bad data.
   */
  private async revalidate(tags: string[]): Promise<void> {
    // The API's own cache first. Revalidating only the web app left it fetching
    // fresh pages from a stale API, which is how the Players tab went on
    // listing countries after they had been deleted: both layers hold the same
    // response, and clearing one changes nothing.
    try {
      await this.cache.deleteByPrefix('players:');
      await this.cache.deleteByPrefix('teams:');
      await this.cache.deleteByPrefix('competitions:');
      await this.cache.deleteByPrefix('content:');
    } catch (error) {
      this.logger.warn(`Clearing the API cache failed: ${this.message(error)}`);
    }

    const url = process.env.WEB_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!url || !secret) return;

    try {
      const response = await fetch(new URL('/api/revalidate', url), {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        this.logger.warn(`Revalidation returned ${response.status}; pages may serve stale data`);
        return;
      }
      this.logger.log(`  revalidated ${tags.join(', ')}`);
    } catch (error) {
      this.logger.warn(`Revalidation failed: ${this.message(error)}`);
    }
  }

  /**
   * Ingests cricketers' per-format career records.
   *
   * The payoff for the whole exercise. Wikidata holds no cricket batting
   * averages at all; a cricket infobox holds a player's complete Test, ODI and
   * T20I records, which map directly onto the discipline model.
   */
  async ingestCricketStats(limit: number): Promise<{ players: number; blocks: number }> {
    const targets = await this.targets('person', 'cricket', limit);

    const disciplines = await this.database.db
      .select({ id: discipline.id, key: discipline.key })
      .from(discipline)
      .innerJoin(sql`sport`, sql`sport.id = ${discipline.sportId} AND sport.slug = 'cricket'`);

    const byKey = new Map(disciplines.map((row) => [row.key, row.id]));

    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'cricket' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, blocks: 0 };

    let players = 0;
    let blocks = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const stats = await this.provider.fetchCricketStats(target.title);
        if (stats.length === 0) continue;

        for (const block of stats) {
          const disciplineId = block.discipline ? byKey.get(block.discipline) : null;
          if (!disciplineId) continue;

          await this.database.db.execute(sql`
            INSERT INTO person_statistic (
              person_id, sport_id, discipline_id, scope, appearances, stats, computed_at
            ) VALUES (
              ${target.id}, ${sportRow.id}, ${disciplineId}, 'career',
              ${block.appearances ?? 0}, ${JSON.stringify(block.stats)}::jsonb, now()
            )
            ON CONFLICT (
              person_id, scope,
              coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
            ) DO UPDATE SET
              appearances = EXCLUDED.appearances,
              stats = person_statistic.stats || EXCLUDED.stats,
              computed_at = now()
          `);
          blocks += 1;
        }

        players += 1;
      } catch (error) {
        this.logger.warn(`Cricket stats failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${blocks} stat blocks`);
      }
    }

    return { players, blocks };
  }

  /**
   * Ingests basketball players' career averages, per competition phase.
   *
   * Wikipedia rather than the NBA's own statistics service, and the reason is
   * licensing rather than data quality: the NBA's terms restrict its statistics
   * to news reporting and non-commercial use, and specifically prohibit use in
   * a service featuring a comprehensive statistics database. Wikipedia's
   * per-season tables carry the same figures under a licence that permits
   * storing facts.
   */
  async ingestBasketballStats(limit: number): Promise<{ players: number; blocks: number }> {
    const targets = await this.targets('person', 'basketball', limit);

    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'basketball' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, blocks: 0 };

    const disciplines = await this.database.db.execute<{ id: string; key: string }>(
      sql`SELECT d.id, d.key FROM discipline d WHERE d.sport_id = ${sportRow.id}`,
    );
    const byKey = new Map(disciplines.map((row) => [row.key, row.id]));

    let players = 0;
    let blocks = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const stats = await this.provider.fetchBasketballStats(target.title);
        if (stats.length === 0) continue;

        for (const block of stats) {
          const disciplineId = block.discipline ? byKey.get(block.discipline) : null;
          if (!disciplineId) continue;

          await this.database.db.execute(sql`
            INSERT INTO person_statistic (
              person_id, sport_id, discipline_id, scope, appearances, stats, computed_at
            ) VALUES (
              ${target.id}, ${sportRow.id}, ${disciplineId}, 'career',
              ${block.appearances ?? 0}, ${JSON.stringify(block.stats)}::jsonb, now()
            )
            ON CONFLICT (
              person_id, scope,
              coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
            ) DO UPDATE SET
              appearances = EXCLUDED.appearances,
              stats = person_statistic.stats || EXCLUDED.stats,
              computed_at = now()
          `);
          blocks += 1;
        }

        players += 1;
      } catch (error) {
        this.logger.warn(`Basketball stats failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${blocks} stat blocks`);
      }
    }

    return { players, blocks };
  }

  /**
   * Ingests footballers' club careers into `person_team`.
   *
   * Club names are matched against teams we already hold, and spells at clubs
   * outside the catalogue are skipped rather than creating placeholder teams.
   */
  async ingestFootballCareers(limit: number): Promise<{ players: number; spells: number }> {
    const targets = await this.targets('person', 'football', limit);

    const teams = await this.database.db.execute<{ id: string; name: string }>(sql`
      SELECT t.id, t.name FROM team t
      JOIN sport s ON s.id = t.sport_id AND s.slug = 'football'
    `);

    // Club-type tokens are stripped with optional dots, because the same club
    // appears as "Swansea City A.F.C." here and "Swansea City" on Wikipedia,
    // and as "Real Madrid Club de Futbol" against "Real Madrid".
    const normalise = (value: string) =>
      value
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .replace(
          /\b(f\.?c\.?|a\.?f\.?c\.?|c\.?f\.?|s\.?k\.?|a\.?c\.?|s\.?c\.?|clube?|de|del|futbol|football|fussball|calcio|sporting)\b/g,
          '',
        )
        .replace(/[^a-z0-9]/g, '');

    const byName = new Map<string, string>();
    for (const team of teams) {
      const key = normalise(team.name);
      // First writer wins. Two clubs can normalise identically ("Barcelona"
      // the club and "Barcelona B" the reserve side), and overwriting means the
      // senior side loses its spells to its own B team.
      if (key.length > 2 && !byName.has(key)) byName.set(key, team.id);
    }

    /**
     * Resolves a Wikipedia club name to a team we hold.
     *
     * Exact normalised match first, then containment in either direction, which
     * is what connects "Naotico" to "Clube Nautico Capibaribe". Containment is
     * length-guarded: a three-character key matches far too much.
     */
    const resolveTeam = (name: string): string | undefined => {
      // Reserve and youth sides are not the senior club and must not inherit
      // its spells. Messi's Barcelona B and C rows resolved to FC Barcelona and
      // appeared on the senior club's timeline as separate spells.
      if (/\b(b|c|ii|iii|u\d{2}|reserves?|youth|academy|junior)\b\s*$/i.test(name.trim())) {
        return undefined;
      }

      const key = normalise(name);
      if (key.length < 3) return undefined;

      const exact = byName.get(key);
      if (exact) return exact;

      for (const [candidate, id] of byName) {
        if (candidate.length < 4 || key.length < 4) continue;
        if (candidate === key || candidate.includes(key) || key.includes(candidate)) return id;
      }

      return undefined;
    };

    let players = 0;
    let spells = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const career = await this.provider.fetchFootballCareer(target.title);
        if (career.length === 0) continue;

        // A club a player appears at twice, with the earlier spell carrying no
        // appearances, is a youth-academy row rather than a second senior
        // spell. Wikipedia lists those under "Youth career" and they read as
        // duplicates on a timeline: Messi's page showed Barcelona twice, once
        // for 2000-2004 with no figures and once for his senior career.
        const senior = new Set(
          career.filter((row) => row.apps !== null).map((row) => row.team.toLowerCase()),
        );

        for (const entry of career) {
          if (entry.apps === null && senior.has(entry.team.toLowerCase())) continue;
          const teamId = resolveTeam(entry.team);
          if (!teamId) continue;

          const [startYear, endYear] = entry.years.split(/[–-]/);
          const start = startYear?.trim().match(/^\d{4}$/) ? `${startYear.trim()}-01-01` : null;
          const end = endYear?.trim().match(/^\d{4}$/) ? `${endYear.trim()}-12-31` : null;

          await this.database.db.execute(sql`
            INSERT INTO person_team (
              person_id, team_id, role, start_date, end_date, attributes, confidence
            ) VALUES (
              ${target.id}, ${teamId}, 'player',
              ${start}::date, ${end}::date,
              ${JSON.stringify({
                appearances: entry.apps,
                goals: entry.goals,
                years: entry.years,
              })}::jsonb,
              'verified'
            )
            -- Targets the unique index explicitly, coalescing included. A bare
            -- ON CONFLICT DO NOTHING matches no constraint here and therefore
            -- does nothing at all, which is how the first run duplicated every
            -- spell it had already written.
            ON CONFLICT (
              person_id, team_id, role,
              coalesce(start_date, '1000-01-01'::date),
              coalesce(end_date, '9999-12-31'::date)
            ) DO UPDATE SET
              attributes = person_team.attributes || EXCLUDED.attributes,
              confidence = EXCLUDED.confidence,
              updated_at = now()
          `);
          spells += 1;
        }

        players += 1;
      } catch (error) {
        this.logger.warn(`Career failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${spells} spells`);
      }
    }

    return { players, spells };
  }

  /**
   * Ingests the three headline career numbers for every player of a sport.
   *
   * These are the tiles the player page always shows, so this runs across every
   * sport rather than per sport like the detailed statistics passes: a profile
   * that promises games, a scoring total and trophies has to be able to keep
   * that promise for a cricketer and a driver as much as a footballer.
   *
   * Trophies are counted from our own honours table rather than fetched, in the
   * same pass, so a page's three numbers are always computed from the same
   * moment. Values are merged into the existing career row, never replacing it,
   * so the detailed per-discipline statistics survive.
   */
  async ingestCareerTotals(
    sportSlug: string | null,
    limit: number,
  ): Promise<{ players: number; written: number }> {
    const sports = sportSlug
      ? [sportSlug]
      : ['football', 'cricket', 'basketball', 'tennis', 'formula-1'];

    let players = 0;
    let written = 0;

    for (const sport of sports) {
      const [sportRow] = await this.database.db.execute<{ id: string }>(
        sql`SELECT id FROM sport WHERE slug = ${sport} LIMIT 1`,
      );
      if (!sportRow) continue;

      const targets = await this.targets('person', sport, limit);
      this.logger.log(`${sport}: ${targets.length} players`);

      for (const [index, target] of targets.entries()) {
        players += 1;

        try {
          const totals = await this.provider.fetchCareerTotals(target.title, sport);

          // A null is "the article does not say", which must not be written as
          // a zero: the page renders a dash for the former and a real figure
          // for the latter, and a stored zero is indistinguishable afterwards.
          const payload: Record<string, number> = {};
          if (totals.games !== null) payload.career_games = totals.games;
          if (totals.goals !== null) payload.career_goals = totals.goals;

          if (Object.keys(payload).length === 0) continue;

          await this.database.db.execute(sql`
            INSERT INTO person_statistic (
              person_id, sport_id, discipline_id, scope, stats, computed_at
            ) VALUES (
              ${target.id}, ${sportRow.id}, NULL, 'career',
              ${JSON.stringify(payload)}::jsonb, now()
            )
            ON CONFLICT (
              person_id, scope,
              coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
              coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
            ) DO UPDATE SET
              stats = person_statistic.stats || EXCLUDED.stats,
              computed_at = now()
          `);
          written += 1;
        } catch (error) {
          this.logger.warn(`Career totals failed for ${target.title}: ${this.message(error)}`);
        }

        if ((index + 1) % 25 === 0) {
          this.logger.log(`  ${index + 1}/${targets.length} players, ${written} written`);
        }
      }
    }

    const trophies = await this.deriveTrophyCounts();
    this.logger.log(`${trophies} players' trophy counts refreshed`);

    await this.revalidate(['players']);

    return { players, written };
  }

  /**
   * Counts each player's honours into `career_trophies`.
   *
   * A count rather than a fetch: the honours are already ingested and counting
   * them here means the tile can never disagree with the honours list rendered
   * directly above it on the same page.
   */
  private async deriveTrophyCounts(): Promise<number> {
    const rows = await this.database.db.execute<{ person_id: string }>(sql`
      WITH counts AS (
        SELECT person_id, sport_id, count(*) AS trophies
        FROM honour WHERE person_id IS NOT NULL
        GROUP BY person_id, sport_id
      )
      INSERT INTO person_statistic (person_id, sport_id, scope, discipline_id, stats, computed_at)
      SELECT person_id, sport_id, 'career', NULL,
             jsonb_build_object('career_trophies', trophies), now()
      FROM counts
      ON CONFLICT (
        person_id, scope,
        coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
        coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
        coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
        coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) DO UPDATE SET
        stats = person_statistic.stats || EXCLUDED.stats,
        computed_at = now()
      RETURNING person_id
    `);

    return rows.length;
  }

  // ---------------------------------------------------------------------------

  /**
   * Entities with a Wikipedia title, most notable first.
   *
   * Ordered by honours held, which is the best proxy available for how likely
   * anybody is to look an entity up. A partial run therefore improves the pages
   * that matter rather than an arbitrary slice.
   */
  private async targets(
    entityType: 'team' | 'person' | 'competition' | 'sport',
    sportSlug: string | null,
    limit: number,
    slug?: string,
  ): Promise<{ id: string; title: string; name: string }[]> {
    const table = entityType === 'person' ? 'person' : entityType;
    const nameColumn = entityType === 'person' ? 'full_name' : 'name';
    const sportColumn = entityType === 'person' ? 'primary_sport_id' : 'sport_id';
    const honourColumn =
      entityType === 'person' ? 'person_id' : entityType === 'team' ? 'team_id' : 'competition_id';

    return this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT e.id, em.external_id AS title, e.${sql.raw(nameColumn)} AS name
      FROM external_mapping em
      JOIN ${sql.raw(table)} e ON e.id = em.entity_id
      ${sql.raw(entityType === 'sport' ? '' : `JOIN sport s ON s.id = e.${sportColumn}`)}
      ${sql.raw(entityType === 'sport' ? '' : `LEFT JOIN honour h ON h.${honourColumn} = e.id`)}
      WHERE em.provider = 'wikipedia'
        AND em.entity_type = ${entityType}
        ${sql.raw(sportSlug && entityType !== 'sport' ? `AND s.slug = '${sportSlug}'` : '')}
        AND (${slug ?? null}::text IS NULL OR e.slug = ${slug ?? null})
      GROUP BY e.id, em.external_id, e.${sql.raw(nameColumn)}${sql.raw(
        entityType === 'sport' ? '' : ', e.notability',
      )}
      ${sql.raw(
        entityType === 'sport'
          ? ''
          : // Notability before honours. Ordering by honours alone works for
            // clubs, which accumulate trophies, and fails for national teams,
            // which record almost none: Brazil and Germany sorted below
            // Trinidad and Tobago and were never reached.
            'ORDER BY e.notability DESC, count(h.id) DESC',
      )}
      LIMIT ${limit}
    `);
  }

  private async writeFacts(
    entityType: string,
    entityId: string,
    facts: WikiFact[],
  ): Promise<number> {
    let written = 0;

    for (const fact of facts) {
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
          source: 'wikipedia',
        })
        .onConflictDoUpdate({
          target: [entityFact.entityType, entityFact.entityId, entityFact.key, entityFact.value],
          set: {
            label: fact.label,
            category: fact.category,
            source: 'wikipedia',
            updatedAt: new Date(),
          },
        });
      written += 1;
    }

    return written;
  }

  private async writeRanking(
    entityType: string,
    entityId: string,
    ranking: WikiRanking,
    sourceTitle: string | null,
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
        sourceTitle,
      })
      .onConflictDoUpdate({
        target: [entityRanking.entityType, entityRanking.entityId, entityRanking.kind],
        set: {
          label: ranking.label,
          entries: ranking.entries,
          confidence: ranking.confidence,
          note: ranking.note,
          sourceTitle,
          updatedAt: new Date(),
        },
        // Hand-curated rows survive ingestion. Around a hundred notable teams
        // have no records article Wikipedia can be read from at all, so their
        // leaderboards are seeded by hand; without this guard the next crawl
        // would either overwrite them with a worse table or, for a team the
        // parser still cannot read, leave them intact only by luck.
        setWhere: sql`${entityRanking.sourceTitle} IS DISTINCT FROM ${MANUAL_RANKING_SOURCE}`,
      });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
