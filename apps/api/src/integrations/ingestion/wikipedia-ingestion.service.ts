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
  type GridironTeamSpell,
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
    return this.ingestLogos('team', sportSlug, limit, overwrite);
  }

  /**
   * The same backfill for competition logos, which were missing for exactly the
   * competitions a reader can name.
   *
   * Wikidata's P154 covers the second tiers and the smaller leagues, and is
   * absent for the World Cup, the Champions League, La Liga, the Bundesliga and
   * Serie A, for the crest reason above: those logos are trademarks and Commons
   * will not host them. 33 of football's 48 competitions had no logo at all,
   * every tier-one entry among them, so the listing showed initials where a
   * reader expects a badge.
   *
   * Competitions created by the curated seed also arrive with no Wikipedia
   * title, because title mapping runs from the QID and they were inserted after
   * the last mapping pass. Run `wiki map competition` before this, or `wiki all`,
   * which does both in order.
   */
  async ingestCompetitionLogos(
    sportSlug: string | null,
    limit: number,
    overwrite = false,
  ): Promise<{ examined: number; resolved: number; written: number }> {
    return this.ingestLogos('competition', sportSlug, limit, overwrite);
  }

  /**
   * Shared body of the two backfills above.
   *
   * `team` and `competition` differ only in the table joined and the column
   * updated: both hold `logo_url`, both map to Wikipedia by title, and the
   * infobox field carrying the image is one of the same four either way.
   */
  private async ingestLogos(
    entityType: 'team' | 'competition',
    sportSlug: string | null,
    limit: number,
    overwrite: boolean,
  ): Promise<{ examined: number; resolved: number; written: number }> {
    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT e.id, em.external_id AS title, e.name
      FROM external_mapping em
      JOIN ${sql.raw(entityType)} e ON e.id = em.entity_id
      JOIN sport s ON s.id = e.sport_id
      WHERE em.provider = 'wikipedia'
        AND em.entity_type = ${entityType}
        ${sql.raw(sportSlug ? `AND s.slug = '${sportSlug}'` : '')}
        ${sql.raw(overwrite ? '' : 'AND e.logo_url IS NULL')}
      ORDER BY e.notability DESC
      LIMIT ${limit}
    `);

    // Collected before resolving, so the thumbnail lookups can be batched rather
    // than run one per entity.
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
        this.logger.warn(`Logo lookup failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} ${entityType}s scanned`);
      }
    }

    const thumbnails = await this.provider.resolveThumbnails([...wanted.keys()], 512);

    let written = 0;

    for (const [file, entities] of wanted) {
      const url = thumbnails.get(file);
      if (!url) continue;

      for (const entity of entities) {
        await this.database.db.execute(sql`
          UPDATE ${sql.raw(entityType)}
          SET logo_url = ${url}, updated_at = now()
          WHERE id = ${entity.id}
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
   * Cricket sides' per-format leaderboards: matches, runs and wickets.
   *
   * Separate from `ingestTeamRankings` because the unit of work differs. That
   * method writes two tables per team and stops as soon as it has them; this
   * one writes up to nine, and must not stop early, because a side with Test
   * tables and no T20I tables is the normal case rather than a failure.
   *
   * International sides only. A career record belongs to a format, and the
   * formats these tables describe are Test, ODI and T20I: there is no
   * equivalent published for a county or a franchise, and inventing one by
   * reading a domestic side's page would produce a table whose rows mean
   * something different from its label.
   */
  async ingestCricketTeamRankings(limit: number): Promise<{
    teams: number;
    rankings: number;
    skipped: number;
  }> {
    const targets = await this.targets('team', 'cricket', limit, undefined, 'international');
    let teams = 0;
    let rankings = 0;
    let skipped = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const extracted = await this.provider.fetchCricketTeamRankings(target.name, target.title);
        if (extracted.length === 0) {
          // Recorded rather than retried. Several sides publish these tables
          // nowhere a parser can reach, and a run that reports how many it
          // could not serve is more useful than one that quietly serves fewer.
          skipped += 1;
          continue;
        }

        for (const ranking of extracted) {
          await this.writeRanking('team', target.id, ranking, ranking.sourceTitle ?? target.title);
          rankings += 1;
        }
        teams += 1;
      } catch (error) {
        this.logger.warn(`Cricket rankings failed for ${target.name}: ${this.message(error)}`);
        skipped += 1;
      }

      if ((index + 1) % 5 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} teams, ${rankings} tables`);
      }
    }

    // Franchise and domestic sides, in the same run. Their leaderboards are not
    // format-split and come from the team's own article, so they are a second
    // pass rather than a second command: one invocation should leave the whole
    // sport consistent.
    for (const kind of ['franchise', 'representative', 'club'] as const) {
      const clubs = await this.targets('team', 'cricket', limit, undefined, kind);

      for (const target of clubs) {
        try {
          const extracted = await this.provider.fetchCricketClubRankings(target.name, target.title);
          if (extracted.length === 0) {
            skipped += 1;
            continue;
          }

          for (const ranking of extracted) {
            await this.writeRanking(
              'team',
              target.id,
              ranking,
              ranking.sourceTitle ?? target.title,
            );
            rankings += 1;
          }
          teams += 1;
        } catch (error) {
          this.logger.warn(
            `Cricket club rankings failed for ${target.name}: ${this.message(error)}`,
          );
          skipped += 1;
        }
      }

      this.logger.log(`  ${kind}: ${clubs.length} examined, ${rankings} tables so far`);
    }

    await this.revalidate(['sport:cricket']);

    return { teams, rankings, skipped };
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
   * Ingests cricketers' playing spans, and sets the Active or Retired badge.
   *
   * The badge is derived from club spells for footballers, and cricketers have
   * next to none: their ingested sides are national teams and franchises with
   * no dates, so nearly five thousand cricketers carried no status and their
   * pages showed no badge. This reads the span the article does state.
   *
   * `career_status` is written here rather than left to the seed's derivation,
   * because that derivation reasons about club spells and there are none to
   * reason about. The rule is the same one it applies: a career that has ended
   * more than two years ago is over, one still running is active, and anything
   * else stays null so the page shows nothing rather than a guess. Curated rows
   * are left alone, as everywhere else.
   */
  async ingestCricketCareerSpans(
    limit: number,
    /** One player, for correcting a single page without a full crawl. */
    slug?: string,
  ): Promise<{ players: number; active: number; retired: number }> {
    const targets = await this.targets('person', 'cricket', limit, slug);

    // Read once. A year boundary crossing mid-run would put two players on
    // different sides of the same rule.
    const thisYear = new Date().getUTCFullYear();

    let players = 0;
    let active = 0;
    let retired = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const span = await this.provider.fetchCricketCareerSpan(target.title);
        if (!span) continue;

        // "present" in the article, or a last match recent enough that a gap is
        // more likely to be a stale article than a retirement.
        const stillPlaying = span.ongoing || (span.end !== null && span.end >= thisYear - 2);
        const status = stillPlaying ? 'active' : span.end !== null ? 'retired' : null;

        await this.database.db.execute(sql`
          UPDATE person SET
            attributes = attributes || ${JSON.stringify({
              ...(span.start !== null ? { careerStart: span.start } : {}),
              ...(span.end !== null && !span.ongoing ? { careerEnd: span.end } : {}),
            })}::jsonb,
            career_status = coalesce(${status}::text, career_status),
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);

        players += 1;
        if (status === 'active') active += 1;
        if (status === 'retired') retired += 1;
      } catch (error) {
        this.logger.warn(`Cricket career span failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 50 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${players} spans written`);
      }
    }

    return { players, active, retired };
  }

  /**
   * Ingests tennis players' careers: their titles, their span and their status.
   *
   * Tennis arrives with almost nothing that the rest of the pipeline provides
   * for other sports, and every gap has the same cause: **tennis has no clubs**.
   * The catalogue holds zero tennis teams, and the pipeline reasons about
   * careers through club spells. So:
   *
   *   - `derivePersonStatus` finds no spells and leaves 366 of 394 tennis
   *     players with a null `career_status`, which renders no badge at all.
   *   - `derivePersonPriority` awards its two large bonuses for team evidence,
   *     so no tennis player can earn either, and the 150-sitelink cap that
   *     applies to a proven player never applies to any of them. Federer's 159
   *     sitelinks scored exactly what a journeyman's 40 did, and he ranked 36th
   *     on a list headed by a pop musician and the King of Thailand.
   *   - The honour table held 175 tennis rows, of which 174 were awards and one
   *     was a title. Not a single Grand Slam was recorded: Federer's twenty
   *     majors were represented by one ESPY.
   *
   * This method is the tennis equivalent of the club spell. A Grand Slam title
   * is the evidence tennis has that somebody had a real career in it, and the
   * infobox states every one.
   *
   * ## What it writes
   *
   *   - **Honour rows** for every major, Olympic, Tour Finals and national-team
   *     title, resolved to the curated competition so the profile can group
   *     them. Titles are `kind = 'title'`, which is what separates them from
   *     the awards already present.
   *   - **`career_status`**, from whether the infobox carries a `retired`
   *     field. This is the one signal tennis does have, and it is explicit
   *     rather than inferred.
   *   - **Attributes**: the career span, the playing hand, the tour title
   *     counts and the peak ranking, which give the profile something to show
   *     for a sport with no runs, goals or points.
   *
   * Curated rows are left alone, as everywhere else.
   */
  async ingestTennisCareers(
    limit: number,
    /** One player, for correcting a single page without a full crawl. */
    slug?: string,
  ): Promise<{ players: number; titles: number; retired: number; active: number }> {
    const targets = await this.targets('person', 'tennis', limit, slug);

    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'tennis' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, titles: 0, retired: 0, active: 0 };

    // The curated competitions, resolved once. A title whose competition is
    // missing is still written, with a null competition_id: the honour is a
    // fact about the player and should not be lost because the competition
    // seed has not run.
    const competitions = new Map<string, string>();
    const rows = await this.database.db.execute<{ id: string; slug: string }>(
      sql`SELECT id, slug FROM competition WHERE sport_id = ${sportRow.id}`,
    );
    for (const row of rows) competitions.set(row.slug, row.id);

    let players = 0;
    let titles = 0;
    let retired = 0;
    let active = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const career = await this.provider.fetchTennisCareer(target.title);
        // No tennis infobox means the person is not a tennis player in any
        // sense this pipeline can act on. That is the common case for the
        // politicians, monarchs and musicians Wikidata's "sport: tennis"
        // statement drags into the catalogue, and skipping them is deliberate:
        // they keep their null status and score no title evidence.
        if (!career) continue;

        for (const title of career.titles) {
          // The discipline is part of the title text because the honour table
          // is unique on (person, title, year), and Serena Williams won the
          // singles and the doubles at the same Wimbledon more than once.
          // Without it the second insert silently does nothing and her 14
          // doubles majors disappear.
          const label = title.discipline === 'doubles' ? `${title.name} (doubles)` : title.name;

          const inserted = await this.database.db.execute<{ id: string }>(sql`
            INSERT INTO honour (
              sport_id, person_id, competition_id, kind, title, year, source
            )
            SELECT ${sportRow.id}, ${target.id},
                   ${competitions.get(title.slug) ?? null}, 'title',
                   ${label}, ${title.year}, 'wikipedia'
            WHERE NOT EXISTS (
              SELECT 1 FROM honour h
              WHERE h.person_id = ${target.id}
                AND h.title = ${label}
                AND h.year = ${title.year}
            )
            RETURNING id
          `);
          if (inserted.length > 0) titles += 1;
        }

        // The `retired` field is the signal, not the year it parses to. A
        // player whose article carries one has stopped; one with no such field
        // is still competing. Serena Williams' reads "2022-2026", which is a
        // retirement followed by a scheduled return, and the field's presence
        // is the right reading of it either way.
        const status = career.hasRetiredField ? 'retired' : 'active';
        if (status === 'retired') retired += 1;
        else active += 1;

        await this.database.db.execute(sql`
          UPDATE person SET
            attributes = attributes || ${JSON.stringify({
              ...(career.turnedPro !== null ? { careerStart: career.turnedPro } : {}),
              ...(career.retiredYear !== null ? { careerEnd: career.retiredYear } : {}),
              ...(career.plays !== null ? { plays: career.plays } : {}),
              ...(career.singlesTitles !== null ? { singlesTitles: career.singlesTitles } : {}),
              ...(career.doublesTitles !== null ? { doublesTitles: career.doublesTitles } : {}),
              ...(career.highestSinglesRanking !== null
                ? { highestSinglesRanking: career.highestSinglesRanking }
                : {}),
              ...(career.highestDoublesRanking !== null
                ? { highestDoublesRanking: career.highestDoublesRanking }
                : {}),
            })}::jsonb,
            career_status = ${status},
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);

        players += 1;
      } catch (error) {
        this.logger.warn(`Tennis career failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${titles} titles written`);
      }
    }

    return { players, titles, retired, active };
  }

  /**
   * Ingests golfers' careers: their majors, their record and their status.
   *
   * The golf equivalent of `ingestTennisCareers`, and it exists because golf
   * has the same shape as tennis and therefore the same gaps: **golf has no
   * clubs**. The catalogue holds zero golf teams, so:
   *
   *   - `derivePersonStatus` finds no spells and leaves 560 of 748 golfers with
   *     a null `career_status`, which renders no badge at all.
   *   - `derivePersonPriority` awards its two large bonuses for team evidence,
   *     so no golfer can earn either, and its `major_titles` term reads tier-1
   *     competitions of which golf had none. Every golfer scored on capped
   *     sitelinks alone, and the Players tab opened with Arnold Palmer, then
   *     **Heinrich Harrer** (an Austrian mountaineer), Jack Nicklaus and
   *     Annika Sörenstam in a row: fame order, not golf order.
   *   - The honour table held 196 golf rows, every one an award. Not a single
   *     major was recorded: Tiger Woods's fifteen were represented by nothing,
   *     and he was not in the catalogue at all.
   *
   * A major championship is the evidence golf has that somebody had a real
   * career in it, and `Infobox golfer` states every one with its year.
   *
   * ## What it writes
   *
   *   - **Honour rows** for every major won, resolved to the curated
   *     competition so the profile can group them. `kind = 'title'`, which is
   *     what separates them from the awards already present and what
   *     `derivePersonPriority` counts.
   *   - **`career_status`**, from an activity window rather than from a
   *     `retired` field. See below.
   *   - **Attributes**: turned pro, tour, college, the win counts by tour, the
   *     stated major count and the Hall of Fame year, which give the profile
   *     something to show for a sport with no goals, runs or points.
   *
   * ## Why status is a window rather than a field
   *
   * Tennis reads status from whether the infobox carries a `retired` field.
   * That is exactly wrong for golf: the golfer template carries `retired` as an
   * empty placeholder on almost every article, Nicklaus's and Player's
   * included, so its presence means nothing and its absence means nothing.
   *
   * Golf also genuinely lacks a retirement moment for most players. Very few
   * announce one; they play less, then move to a seniors tour, then stop
   * entering. So the honest signals, in order of how much they settle:
   *
   *   1. **Dead.** Decisive, and already handled by `derivePersonStatus`.
   *   2. **A stated retirement year in the past.** Rare, and decisive when present.
   *   3. **Last major won long ago, and turned pro long ago.** A player whose
   *      last major was decades back and who turned professional decades before
   *      that has finished, whatever the article omits.
   *   4. **Turned pro recently.** Somebody who turned professional in the last
   *      few decades and has no retirement statement is competing.
   *
   * Where none of those fire, the status is left alone rather than guessed.
   * Null renders no badge, and labelling somebody Active who stopped in 1975 is
   * worse than labelling them nothing.
   *
   * Curated rows are left alone, as everywhere else.
   */
  async ingestGolfCareers(
    limit: number,
    /** One player, for correcting a single page without a full crawl. */
    slug?: string,
  ): Promise<{ players: number; majors: number; retired: number; active: number }> {
    const targets = await this.targets('person', 'golf', limit, slug);

    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'golf' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, majors: 0, retired: 0, active: 0 };

    // The curated competitions, resolved once. A major whose competition is
    // missing is still written, with a null competition_id: the honour is a
    // fact about the player and should not be lost because the competition
    // seed has not run. The discontinued majors are always in that case.
    const competitions = new Map<string, string>();
    const rows = await this.database.db.execute<{ id: string; slug: string }>(
      sql`SELECT id, slug FROM competition WHERE sport_id = ${sportRow.id}`,
    );
    for (const row of rows) competitions.set(row.slug, row.id);

    const thisYear = new Date().getFullYear();

    let players = 0;
    let majors = 0;
    let retired = 0;
    let active = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const career = await this.provider.fetchGolfCareer(target.title);
        // No golfer infobox means the person is not a golfer in any sense this
        // pipeline can act on. That is the common case for the mountaineers,
        // politicians and actors Wikidata's "sport: golf" statement drags into
        // the catalogue, and skipping them is deliberate: they keep their null
        // status and score no major evidence.
        if (!career) continue;

        for (const major of career.majors) {
          const inserted = await this.database.db.execute<{ id: string }>(sql`
            INSERT INTO honour (
              sport_id, person_id, competition_id, kind, title, year, source
            )
            SELECT ${sportRow.id}, ${target.id},
                   ${major.slug ? (competitions.get(major.slug) ?? null) : null}, 'title',
                   ${major.name}, ${major.year}, 'wikipedia'
            WHERE NOT EXISTS (
              SELECT 1 FROM honour h
              WHERE h.person_id = ${target.id}
                AND h.title = ${major.name}
                AND h.year = ${major.year}
            )
            RETURNING id
          `);
          if (inserted.length > 0) majors += 1;
        }

        // The activity window. See the doc comment for why golf cannot use the
        // `retired` field the way tennis does.
        //
        // Twelve years since the last major is the threshold, and it is chosen
        // to be safely longer than a career gap rather than to be precise:
        // Tiger Woods went eleven years between the 2008 U.S. Open and the 2019
        // Masters, which is the longest such gap in the modern game, and a
        // shorter window would have marked him retired in 2018.
        const status: 'active' | 'retired' | null =
          career.retiredYear !== null && career.retiredYear < thisYear
            ? 'retired'
            : career.lastMajorYear !== null && thisYear - career.lastMajorYear > 12
              ? 'retired'
              : career.lastMajorYear !== null
                ? 'active'
                : career.turnedPro !== null && thisYear - career.turnedPro > 35
                  ? 'retired'
                  : career.turnedPro !== null
                    ? 'active'
                    : null;

        if (status === 'retired') retired += 1;
        else if (status === 'active') active += 1;

        await this.database.db.execute(sql`
          UPDATE person SET
            attributes = attributes || ${JSON.stringify({
              ...(career.turnedPro !== null ? { careerStart: career.turnedPro } : {}),
              ...(career.retiredYear !== null ? { careerEnd: career.retiredYear } : {}),
              ...(career.tour !== null ? { tour: career.tour } : {}),
              ...(career.college !== null ? { college: career.college } : {}),
              ...(career.hallOfFameYear !== null ? { hallOfFameYear: career.hallOfFameYear } : {}),
              ...career.winCounts,
            })}::jsonb,
            -- Left alone where the window says nothing, rather than cleared. A
            -- null here would erase a status derivePersonStatus set from a date
            -- of death, which is better evidence than anything this pass has.
            career_status = coalesce(${status}::text, career_status),
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);

        players += 1;
      } catch (error) {
        this.logger.warn(`Golf career failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${majors} majors written`);
      }
    }

    return { players, majors, retired, active };
  }

  /**
   * NFL teams' championship counts and Super Bowl-winning seasons.
   *
   * The counterpart of `ingestFootballTitles` for a sport whose team articles
   * state a title count directly in the infobox rather than in an honours
   * table to sum, so this reads `fetchNflTeamTitles` rather than
   * `fetchClubTitles`. Counts are written to `team.attributes`, and each
   * Super Bowl-winning season becomes its own `honour` row tied to the
   * `super-bowl` competition, the same shape `ingestGolfCareers` gives a
   * major win.
   */
  async ingestNflTeamTitles(limit: number): Promise<{ teams: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { teams: 0, written: 0 };

    const [superBowl] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM competition WHERE sport_id = ${sportRow.id} AND slug = 'super-bowl' LIMIT 1`,
    );

    const targets = await this.targets('team', 'american-football', limit);
    this.logger.log(`american-football: ${targets.length} teams`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const titles = await this.provider.fetchNflTeamTitles(target.title);
        // No recognised infobox means a parsing failure, not a team that has
        // won nothing, the same distinction `ingestFootballTitles` draws with
        // its `competitions === 0` guard.
        if (!titles) continue;

        await this.database.db.execute(sql`
          UPDATE team SET
            attributes = attributes || ${JSON.stringify({
              ...(titles.superBowlTitles !== null
                ? { superBowlTitles: titles.superBowlTitles }
                : {}),
              ...(titles.conferenceTitles !== null
                ? { conferenceTitles: titles.conferenceTitles }
                : {}),
              ...(titles.divisionTitles !== null ? { divisionTitles: titles.divisionTitles } : {}),
              ...(titles.leagueTitles !== null ? { leagueTitles: titles.leagueTitles } : {}),
              ...(titles.playoffAppearances !== null
                ? { playoffAppearances: titles.playoffAppearances }
                : {}),
            })}::jsonb,
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);

        for (const year of titles.superBowlYears) {
          const inserted = await this.database.db.execute<{ id: string }>(sql`
            INSERT INTO honour (
              sport_id, team_id, competition_id, kind, title, year, source
            )
            SELECT ${sportRow.id}, ${target.id}, ${superBowl?.id ?? null}, 'title',
                   'Super Bowl champions', ${year}, 'wikipedia'
            WHERE NOT EXISTS (
              SELECT 1 FROM honour h
              WHERE h.team_id = ${target.id} AND h.title = 'Super Bowl champions' AND h.year = ${year}
            )
            RETURNING id
          `);
          if (inserted.length > 0) written += 1;
        }
      } catch (error) {
        this.logger.warn(`NFL titles failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} teams, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { teams: targets.length, written };
  }

  /**
   * Quarterbacks' career regular-season passing totals.
   *
   * Scoped to the `quarterback` position only, and to the `passing_yards`,
   * `passing_touchdowns` and `interceptions_thrown` keys the statistic
   * registry already declares for this sport (`completions` and `attempts`
   * are read too, and kept in `stats` even though nothing in the registry
   * names them yet, rather than discarded). See
   * `fetchCareerColumnGroup`'s doc comment on `WikipediaProvider` for why
   * every position needs its own reader rather than one general-purpose
   * table parser: the season table's columns are not consistent enough
   * across positions, articles and eras to read safely by anything other
   * than each column's own header label, checked against a real page.
   * `ingestRunningBackCareerTotals`, `ingestReceiverCareerTotals` and
   * `ingestDefenderCareerTotals` below are the same shape for the three
   * other position groups this reads.
   */
  async ingestQuarterbackCareerPassing(
    limit: number,
  ): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [passingDiscipline] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM discipline WHERE sport_id = ${sportRow.id} AND key = 'passing' LIMIT 1`,
    );

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      WHERE p.attributes->>'position' = 'quarterback'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} quarterbacks`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const totals = await this.provider.fetchQuarterbackCareerPassing(target.title);
        // No table read means a parsing failure or an article too old to
        // carry one, not a quarterback who has thrown for nothing.
        if (!totals || totals.yards === null) continue;

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, discipline_id, scope, primary_value, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, ${passingDiscipline?.id ?? null}, 'career',
            ${totals.yards},
            ${JSON.stringify({
              ...(totals.yards !== null ? { passing_yards: totals.yards } : {}),
              ...(totals.touchdowns !== null ? { passing_touchdowns: totals.touchdowns } : {}),
              ...(totals.interceptions !== null
                ? { interceptions_thrown: totals.interceptions }
                : {}),
              ...(totals.completions !== null ? { completions: totals.completions } : {}),
              ...(totals.attempts !== null ? { attempts: totals.attempts } : {}),
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            primary_value = EXCLUDED.primary_value,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`QB passing totals failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} quarterbacks, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * Running backs' career rushing totals.
   *
   * Position matching covers `running back`, `halfback` and `fullback`: three
   * names Wikipedia's own infoboxes use for what the registry counts as one
   * discipline. Halfback is the older term for the same role a modern article
   * calls running back, and a fullback carries the ball often enough that
   * excluding it would drop real rushers, not just blockers, from the pass.
   */
  async ingestRunningBackCareerTotals(
    limit: number,
  ): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [rushingDiscipline] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM discipline WHERE sport_id = ${sportRow.id} AND key = 'rushing' LIMIT 1`,
    );

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      WHERE p.attributes->>'position' IN ('running back', 'halfback', 'fullback')
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} running backs`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const totals = await this.provider.fetchRunningBackCareerTotals(target.title);
        if (!totals || (totals.yards === null && totals.touchdowns === null)) continue;

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, discipline_id, scope, primary_value, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, ${rushingDiscipline?.id ?? null}, 'career',
            ${totals.yards},
            ${JSON.stringify({
              ...(totals.yards !== null ? { rushing_yards: totals.yards } : {}),
              ...(totals.touchdowns !== null ? { rushing_touchdowns: totals.touchdowns } : {}),
              ...(totals.attempts !== null ? { rushing_attempts: totals.attempts } : {}),
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            primary_value = EXCLUDED.primary_value,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`RB rushing totals failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} running backs, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * Receivers' career receiving totals.
   *
   * Position matching covers `wide receiver` and `tight end`: different roles
   * on the field, but both are read through the same "Receiving" column
   * group. A running back's receiving line is deliberately not read here,
   * even though the same table carries one for them too; a runner is scoped
   * to `ingestRunningBackCareerTotals` and its rushing figures, and giving
   * the same person two competing career rows for two different disciplines
   * from two different ingestion passes at once is exactly the kind of
   * ambiguity the position filter exists to avoid.
   */
  async ingestReceiverCareerTotals(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [receivingDiscipline] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM discipline WHERE sport_id = ${sportRow.id} AND key = 'receiving' LIMIT 1`,
    );

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      WHERE p.attributes->>'position' IN ('wide receiver', 'tight end')
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} receivers`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const totals = await this.provider.fetchReceiverCareerTotals(target.title);
        if (!totals || (totals.yards === null && totals.touchdowns === null)) continue;

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, discipline_id, scope, primary_value, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, ${receivingDiscipline?.id ?? null}, 'career',
            ${totals.yards},
            ${JSON.stringify({
              ...(totals.yards !== null ? { receiving_yards: totals.yards } : {}),
              ...(totals.touchdowns !== null ? { receiving_touchdowns: totals.touchdowns } : {}),
              ...(totals.receptions !== null ? { receptions: totals.receptions } : {}),
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            primary_value = EXCLUDED.primary_value,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`Receiver totals failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} receivers, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * Defenders' career tackle and takeaway totals.
   *
   * Position matching covers every defensive role Wikipedia's infoboxes name
   * for this catalogue: `linebacker`, `defensive end`, `defensive tackle`,
   * `cornerback`, `safety` (and its capitalised variant, an ingestion
   * inconsistency worth matching rather than losing three players over),
   * `defensive back`, `nose tackle` and the bare `end`. See
   * `fetchDefenderCareerTotals` for why a player missing one of the two
   * column groups (an edge rusher with no interceptions, a cornerback whose
   * table carries no sack column) still gets a row for whichever group was
   * found.
   */
  async ingestDefenderCareerTotals(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [defenceDiscipline] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM discipline WHERE sport_id = ${sportRow.id} AND key = 'defence' LIMIT 1`,
    );

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      WHERE p.attributes->>'position' IN (
        'linebacker', 'defensive end', 'defensive tackle', 'cornerback',
        'safety', 'Safety', 'defensive back', 'nose tackle', 'end'
      )
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} defenders`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const totals = await this.provider.fetchDefenderCareerTotals(target.title);
        if (
          !totals ||
          (totals.tackles === null && totals.sacks === null && totals.interceptions === null)
        ) {
          continue;
        }

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, discipline_id, scope, primary_value, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, ${defenceDiscipline?.id ?? null}, 'career',
            ${totals.tackles},
            ${JSON.stringify({
              ...(totals.tackles !== null ? { tackles: totals.tackles } : {}),
              ...(totals.sacks !== null ? { sacks: totals.sacks } : {}),
              ...(totals.interceptions !== null ? { interceptions: totals.interceptions } : {}),
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            primary_value = EXCLUDED.primary_value,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`Defender totals failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} defenders, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * Gridiron players' club histories, replacing whatever undated spells
   * Wikidata's "member of sports team" statements had already written.
   *
   * Not position-scoped, unlike the four career-total ingesters above: a
   * club history applies the same way whatever position a player held.
   *
   * The rewrite is deliberate, not additive. `fetchGridironTeamSpells`'s own
   * doc comment covers why: those Wikidata rows carry no dates, so a player
   * with several spells shows every one of them as still current. A dated
   * `pastteams` row for the same (player, team, role) tuple does not share a
   * conflict key with an undated one (the unique index coalesces null dates
   * to sentinel values that differ from any real date), so simply inserting
   * the new rows would have left the wrong ones sitting alongside them. Every
   * existing spell for a player this successfully reads is deleted first, and
   * only for players whose 'wikidata'-sourced ones are still `provisional`:
   * a spell some other pass has since verified or hand-corrected is left
   * alone rather than being silently overwritten by this one.
   */
  async ingestGridironTeamHistory(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'american-football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const teams = await this.database.db.execute<{ id: string; name: string; aliases: string[] }>(
      sql`
        SELECT t.id, t.name, t.aliases FROM team t
        JOIN sport s ON s.id = t.sport_id AND s.slug = 'american-football'
      `,
    );
    // A player's `pastteams` entry names a franchise under whatever it was
    // called during that spell, not its current name: Jerry Rice's Raiders
    // years are written as "Oakland Raiders", not "Las Vegas Raiders", and
    // several other franchises (the Rams, the Chargers, Washington, the
    // Titans, the Colts, the Cardinals) have moved city or name at least once
    // in the modern era. Each relocated team's known former names are
    // resolved to the same row via `aliases`, populated once by hand for the
    // franchises this catalogue actually has moves for.
    const teamByName = new Map<string, string>();
    for (const team of teams) {
      teamByName.set(team.name.toLowerCase(), team.id);
      for (const alias of team.aliases ?? []) teamByName.set(alias.toLowerCase(), team.id);
    }

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} players`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const spells = await this.provider.fetchGridironTeamSpells(target.title);
        if (!spells) continue;

        const resolved = spells
          .map((spell) => ({ spell, teamId: teamByName.get(spell.teamName.toLowerCase()) }))
          .filter((entry): entry is { spell: GridironTeamSpell; teamId: string } => !!entry.teamId);
        if (resolved.length === 0) continue;

        await this.database.db.execute(sql`
          DELETE FROM person_team
          WHERE person_id = ${target.id} AND role = 'player' AND confidence = 'provisional'
        `);

        for (const { spell, teamId } of resolved) {
          // A spell with no stated end that is not "present" is a single
          // season: Jim Hines' one year at the Chiefs writes as
          // `{{NFL Year|1970}}` with no second date, and leaving the end
          // date null would read as a career still in progress fifty years
          // later. Only an explicit "present" spell stays genuinely open.
          const startDate = `${spell.startYear}-01-01`;
          const endDate = spell.current ? null : `${spell.endYear ?? spell.startYear}-12-31`;

          await this.database.db.execute(sql`
            INSERT INTO person_team (
              person_id, team_id, role, start_date, end_date, confidence
            ) VALUES (
              ${target.id}, ${teamId}, 'player', ${startDate}::date, ${endDate}::date, 'verified'
            )
            ON CONFLICT (
              person_id, team_id, role,
              coalesce(start_date, '1000-01-01'::date),
              coalesce(end_date, '9999-12-31'::date)
            ) DO UPDATE SET
              confidence = EXCLUDED.confidence,
              updated_at = now()
          `);
          written += 1;
        }
      } catch (error) {
        this.logger.warn(`Team history failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${written} spells written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * Gridiron players' position and current team, rewritten from each
   * player's own infobox rather than trusted from Wikidata's unscoped
   * `P413` statement.
   *
   * See `fetchGridironPlayerAttributes`'s own doc comment for the bug this
   * closes: a dual-sport person's Wikidata item can carry a position from
   * each sport they played, with no way for the enrichment query that reads
   * it to prefer the American-football one, and the effect reached beyond a
   * cosmetic label. `derivePersonNotability` treats `positioned` as evidence
   * of a real football career and scores `honours` for a person's Wikidata
   * "award received" statements regardless of which sport they came from, so
   * a handful of real MLB players carrying an incidental American-football
   * Wikidata statement, and a handful of football legends whose position was
   * simply overwritten by an unrelated sport's, were both able to distort
   * the Players tab's ranking. This does not touch `notability` directly;
   * that is `derivePersonNotability`'s job on its next run, over the
   * corrected `position` this writes.
   *
   * Only `position` and `currentClub` are touched. `heightCm` and any other
   * existing attribute is preserved by merging rather than replacing.
   */
  async ingestGridironPlayerAttributes(
    limit: number,
  ): Promise<{ players: number; written: number }> {
    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'american-football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`american-football: ${targets.length} players`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const attrs = await this.provider.fetchGridironPlayerAttributes(target.title);
        if (!attrs || (!attrs.position && !attrs.currentTeam)) continue;

        await this.database.db.execute(sql`
          UPDATE person SET
            attributes = attributes || ${JSON.stringify({
              ...(attrs.position !== null ? { position: attrs.position } : {}),
              ...(attrs.currentTeam !== null ? { currentClub: attrs.currentTeam } : {}),
            })}::jsonb,
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`Player attributes failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players, ${written} written`);
      }
    }

    await this.revalidate(['sport:american-football']);

    return { players: targets.length, written };
  }

  /**
   * MMA fighters' professional records, from `Infobox martial artist` rather
   * than left unfilled: no ingestion for this sport has ever populated a win,
   * loss or draw count, and every fighter's page carried nothing beyond
   * height. See `fetchMmaRecord` for the field-level detail and the real
   * records it was verified against.
   *
   * Written to `person_statistic`'s own typed `wins`/`draws`/`losses`
   * columns, the shape the schema already carries for exactly this, rather
   * than to `stats` jsonb the way a sport without those columns' equivalent
   * has to. `weightClass` and `yearsActive` go to `person.attributes`, and
   * `career_status` is set from whether `years_active` ends in "present":
   * this pipeline has no dedicated MMA retirement signal otherwise, and
   * Wikipedia's own infobox already states the answer plainly.
   */
  async ingestMmaRecords(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'mma' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'mma'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`mma: ${targets.length} fighters`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const record = await this.provider.fetchMmaRecord(target.title);
        if (!record) continue;

        const status: 'active' | 'retired' | null = record.yearsActive
          ? /present/i.test(record.yearsActive)
            ? 'active'
            : 'retired'
          : null;

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, scope, wins, draws, losses, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, 'career',
            ${record.wins}, ${record.draws}, ${record.losses},
            ${JSON.stringify({
              fight_wins: record.wins,
              fight_losses: record.losses,
              fight_draws: record.draws,
              ...(record.noContests > 0 ? { no_contests: record.noContests } : {}),
              ...(record.knockoutWins > 0 ? { knockout_wins: record.knockoutWins } : {}),
              ...(record.submissionWins > 0 ? { submission_wins: record.submissionWins } : {}),
              ...(record.decisionWins > 0 ? { decision_wins: record.decisionWins } : {}),
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            wins = EXCLUDED.wins,
            draws = EXCLUDED.draws,
            losses = EXCLUDED.losses,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);

        await this.database.db.execute(sql`
          UPDATE person SET
            attributes = attributes || ${JSON.stringify({
              ...(record.weightClass !== null ? { weightClass: record.weightClass } : {}),
              ...(record.yearsActive !== null ? { yearsActive: record.yearsActive } : {}),
            })}::jsonb,
            career_status = coalesce(${status}::text, career_status),
            updated_at = now()
          WHERE id = ${target.id} AND confidence <> 'curated'
        `);

        written += 1;
      } catch (error) {
        this.logger.warn(`MMA record failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} fighters, ${written} written`);
      }
    }

    await this.revalidate(['sport:mma']);

    return { players: targets.length, written };
  }

  /**
   * MMA fighters' title reigns, one `honour` row per reign.
   *
   * See `fetchMmaTitles` for how a reign is counted from the article's own
   * "Championships and accomplishments" section. A title is resolved to a
   * `competition_id` only when its own text names one of this sport's
   * curated promotions (UFC, Bellator, ONE, PFL); a title at a promotion
   * outside that set, Fedor Emelianenko's PRIDE and RINGS championships
   * among them, is still written with a null `competition_id`, the same
   * fallback `ingestGolfCareers` uses for a discontinued major: the honour is
   * a fact about the fighter and should not be lost because the promotion
   * is not one this catalogue curates.
   *
   * This is also what closes the gap `derivePersonPriority`'s `major_titles`
   * term depends on: without a tier-1 competition and a real title honour
   * attached to it, every MMA fighter was scoring identically at the
   * sitelinks cap regardless of who actually held a belt.
   */
  async ingestMmaTitles(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'mma' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const competitions = await this.database.db.execute<{ id: string; name: string }>(
      sql`SELECT id, name FROM competition WHERE sport_id = ${sportRow.id}`,
    );

    // A title honour's own text names the promotion by its short form
    // ("UFC Middleweight Championship", "Bellator Featherweight World
    // Championship"), never by the competition row's full stored name
    // ("Ultimate Fighting Championship"). Matching `entry.title.startsWith`
    // against the full name therefore never matched anything, and every
    // title honour this ingestion has ever written carries a null
    // `competition_id` as a result — 412 rows across a full run, none of them
    // attributable to a promotion despite the great majority clearly being
    // UFC titles. Matched here against each promotion's known short form
    // instead, checked longest-alias-first so "UFC" cannot shadow a longer
    // alias that happens to start with the same letters.
    const promotionAliases: Record<string, readonly string[]> = {
      'Ultimate Fighting Championship': ['UFC'],
      'Bellator MMA': ['Bellator'],
      'ONE Championship': ['ONE'],
      'Professional Fighters League': ['PFL'],
    };
    const competitionsWithAliases = competitions
      .map((row) => ({ ...row, aliases: promotionAliases[row.name] ?? [row.name] }))
      .sort(
        (a, b) =>
          Math.max(...b.aliases.map((a2) => a2.length)) -
          Math.max(...a.aliases.map((a2) => a2.length)),
      );

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'mma'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`mma: ${targets.length} fighters`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const titles = await this.provider.fetchMmaTitles(target.title);
        if (titles.length === 0) continue;

        // The reigns are read as a name and a repeat count, not as dated
        // events, so a title held twice becomes two identical rows
        // distinguished only by an ordinal suffix ("(reign 1)", "(reign 2)")
        // rather than by year: the source states how many times, not when.
        for (const entry of titles) {
          const competition = competitionsWithAliases.find((row) =>
            row.aliases.some((alias) => entry.title.startsWith(alias)),
          );

          for (let reign = 1; reign <= entry.count; reign += 1) {
            const honourTitle = entry.count > 1 ? `${entry.title} (reign ${reign})` : entry.title;

            // `WHERE NOT EXISTS` rather than `ON CONFLICT`, deliberately.
            // `honour_person_unique_idx` is `(person_id, title, year)`, and
            // `year` is always null for an MMA title reign: Postgres treats
            // null as never equal to null even inside a matching unique
            // index, so `ON CONFLICT (person_id, title, year)` cannot infer a
            // conflict against an existing null-year row and every "upsert"
            // silently inserted a fresh duplicate instead. Measured cost:
            // 1,153 duplicate honour rows across this ingestion's earlier
            // reruns today, cleaned up separately. `competition_id` on a row
            // this left behind before the promotion-matching fix above is
            // backfilled by the UPDATE that follows this loop instead.
            const inserted = await this.database.db.execute<{ id: string }>(sql`
              INSERT INTO honour (
                sport_id, person_id, competition_id, kind, title, year, source
              )
              SELECT ${sportRow.id}, ${target.id}, ${competition?.id ?? null}, 'title',
                     ${honourTitle}, NULL, 'wikipedia'
              WHERE NOT EXISTS (
                SELECT 1 FROM honour h
                WHERE h.person_id = ${target.id} AND h.title = ${honourTitle} AND h.year IS NULL
              )
              RETURNING id
            `);
            if (inserted.length > 0) written += 1;
          }
        }
      } catch (error) {
        this.logger.warn(`MMA titles failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} fighters, ${written} written`);
      }
    }

    // Backfills `competition_id` on rows a previous run inserted before the
    // promotion-matching fix above existed, or before it recognised a given
    // promotion's short form. `WHERE NOT EXISTS` above only ever inserts, so
    // this is the only place an existing row's `competition_id` changes.
    let backfilled = 0;
    for (const competition of competitionsWithAliases) {
      for (const alias of competition.aliases) {
        const updated = await this.database.db.execute<{ id: string }>(sql`
          UPDATE honour
          SET competition_id = ${competition.id}, updated_at = now()
          WHERE sport_id = ${sportRow.id} AND kind = 'title'
            AND competition_id IS NULL AND title LIKE ${`${alias}%`}
          RETURNING id
        `);
        backfilled += updated.length;
      }
    }
    if (backfilled > 0) this.logger.log(`  backfilled competition_id on ${backfilled} honour rows`);

    await this.revalidate(['sport:mma']);

    return { players: targets.length, written };
  }

  /**
   * MMA fighters' UFC title-fight bouts, win or loss.
   *
   * A different count from `ingestMmaTitles`, which only sees title reigns
   * actually won. Written to `person_statistic` scoped to the UFC
   * (`competitionId` set, `scope='competition'`) rather than career-level,
   * because a title bout is meaningless outside the promotion that recognises
   * the title, and this sport's curated competition list is UFC-only.
   *
   * See `fetchMmaTitleBouts` for how the fight table is read.
   */
  async ingestMmaTitleBouts(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'mma' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [ufc] = await this.database.db.execute<{ id: string }>(sql`
      SELECT id FROM competition
      WHERE sport_id = ${sportRow.id} AND slug = 'ultimate-fighting-championship'
      LIMIT 1
    `);
    if (!ufc) return { players: 0, written: 0 };

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'mma'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
      LIMIT ${limit}
    `);
    this.logger.log(`mma title bouts: ${targets.length} fighters`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const record = await this.provider.fetchMmaTitleBouts(target.title);
        if (!record) continue;
        if (record.titleBoutWins === 0 && record.titleBoutLosses === 0) continue;

        await this.database.db.execute(sql`
          INSERT INTO person_statistic (
            person_id, sport_id, competition_id, scope, wins, losses, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, ${ufc.id}, 'competition',
            ${record.titleBoutWins}, ${record.titleBoutLosses},
            ${JSON.stringify({
              // Reuses `title_fight_wins`, a key the registry already
              // defined but that nothing wrote to before this ingestion.
              title_fight_wins: record.titleBoutWins,
              title_fight_losses: record.titleBoutLosses,
              title_fights: record.titleBoutWins + record.titleBoutLosses,
            })}::jsonb,
            now()
          )
          ON CONFLICT (
            person_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            wins = EXCLUDED.wins,
            losses = EXCLUDED.losses,
            stats = person_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`MMA title bouts failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} fighters, ${written} written`);
      }
    }

    await this.revalidate(['sport:mma']);

    return { players: targets.length, written };
  }

  /**
   * The current champion of each UFC weight class, as `entity_fact` rows on
   * the UFC competition entity.
   *
   * Scoped to fighters who already hold at least one UFC title honour rather
   * than the whole roster, since only someone who has won a UFC title before
   * can plausibly hold one now, and checking one fighter per contested
   * division rather than all 990 fighters this sport carries is what keeps
   * this affordable. See `fetchMmaCurrentUfcTitles` for how a fighter's own
   * record table decides whether they are still champion.
   *
   * Deletes the whole `titles` category on the UFC before rewriting rather
   * than upserting: `entity_fact_unique_idx` includes `value`, so a
   * dethroned champion's fact and the new champion's fact are two different
   * rows under the same key, and an upsert keyed on `(entity_type, entity_id,
   * key, value)` would never touch the stale one.
   */
  async ingestMmaCurrentChampions(): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'mma' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const [ufc] = await this.database.db.execute<{ id: string }>(sql`
      SELECT id FROM competition
      WHERE sport_id = ${sportRow.id} AND slug = 'ultimate-fighting-championship'
      LIMIT 1
    `);
    if (!ufc) return { players: 0, written: 0 };

    const targets = await this.database.db.execute<{ id: string; title: string; name: string }>(sql`
      SELECT DISTINCT ON (p.id) p.id, em.external_id AS title, p.full_name AS name
      FROM person p
      JOIN honour h ON h.person_id = p.id AND h.competition_id = ${ufc.id} AND h.kind = 'title'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.id
    `);
    this.logger.log(
      `mma current champions: checking ${targets.length} former/current title holders`,
    );

    await this.database.db.execute(sql`
      DELETE FROM entity_fact
      WHERE entity_type = 'competition' AND entity_id = ${ufc.id} AND category = 'titles'
    `);

    let written = 0;
    let order = 10;

    for (const target of targets) {
      try {
        const divisions = await this.provider.fetchMmaCurrentUfcTitles(target.title);

        for (const division of divisions) {
          await this.database.db.execute(sql`
            INSERT INTO entity_fact (
              entity_type, entity_id, key, label, value, category, is_current, source, display_order
            ) VALUES (
              'competition', ${ufc.id}, ${`champion:${division}`}, ${division},
              ${target.name}, 'titles', 'true', 'wikipedia', ${order}
            )
            ON CONFLICT (entity_type, entity_id, key, value) DO NOTHING
          `);
          written += 1;
          order += 1;
        }
      } catch (error) {
        this.logger.warn(
          `MMA current champion check failed for ${target.title}: ${this.message(error)}`,
        );
      }
    }

    await this.revalidate(['sport:mma']);

    return { players: targets.length, written };
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
   * Ingests footballers' headline career numbers: appearances, goals, trophies.
   *
   * Football only. Each sport counts a career in its own terms, so each gets
   * its own pass rather than one reader guessing at five vocabularies.
   *
   * All three come from the player's own article, in one pass, so a page's
   * numbers are always read from the same revision. Trophies used to be counted
   * from our honour table instead, and that was the wrong source: the honours
   * there arrive from Wikidata's "award received" statements, which are close to
   * empty for footballers, so Pel\u00e9, Maradona, Zidane, Cruyff and Buffon all
   * reported zero trophies.
   *
   * Values are merged into the existing career row, never replacing it, so the
   * detailed per-discipline statistics survive.
   */
  async ingestFootballCareerTotals(limit: number): Promise<{ players: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'football' LIMIT 1`,
    );
    if (!sportRow) return { players: 0, written: 0 };

    const targets = await this.targets('person', 'football', limit);
    this.logger.log(`football: ${targets.length} players`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const [totals, honours] = await Promise.all([
          this.provider.fetchFootballCareerTotals(target.title),
          this.provider.fetchFootballHonours(target.title),
        ]);

        // A null is "the article does not say", which must not be written as a
        // zero: the page renders a dash for the former and a real figure for
        // the latter, and a stored zero is indistinguishable afterwards.
        const payload: Record<string, number> = {};
        if (totals.games !== null) payload.career_games = totals.games;
        if (totals.goals !== null) payload.career_goals = totals.goals;

        // `groups` guards against a silent zero: an article whose honours
        // section this reader does not recognise parses into no groups at all,
        // which is a parsing failure rather than a trophyless career.
        //
        // The second guard catches a different error: club officials and
        // federations are held in the person table, and their articles carry
        // the *club's* honours rather than a playing record. Santiago Bernabéu,
        // a president with 52 appearances, was credited with Real Madrid's 102
        // trophies, and the Royal Spanish Football Federation with 77.
        //
        // A flat ceiling rather than a ratio, because the obvious ratios reject
        // real records: a threshold on appearances would strip Kobbie Mainoo's
        // two trophies at 92 games, and requiring trophies to be a small
        // fraction of games would strip Aitana Bonmat\u00ed's 33 in 300 and Presnel
        // Kimpembe's 28 in 202, all of which are correct. Players at the
        // dominant clubs genuinely win in bunches.
        //
        // 60 sits well above the most decorated actual career on the site
        // (Messi, 46) and well below a club's total, so it separates the two
        // populations without touching any real player.
        const plausible = honours.won !== null && honours.won <= 60;
        if (honours.won !== null && honours.groups > 0 && plausible) {
          payload.career_trophies = honours.won;
        }

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

    // `sport:football`, not `players`: the website tags its player pages by
    // sport, so a `players` tag matches nothing and the corrected figures sat
    // behind the cache until the hour-long window expired on its own.
    await this.revalidate(['sport:football']);

    return { players: targets.length, written };
  }

  /**
   * Ingests football clubs' and national sides' title counts.
   *
   * The team equivalent of the players' pass, and it exists for the same
   * reason: titles were counted from our honour table, which holds honours for
   * 400 of the 1,005 football teams, so the rest showed nothing at all. A
   * club's article states its count directly in its honours table.
   *
   * Written to the sport-wide career row, since a title belongs to a club
   * rather than to a format, and merged so nothing else in the payload is lost.
   */
  async ingestFootballTitles(limit: number): Promise<{ teams: number; written: number }> {
    const [sportRow] = await this.database.db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = 'football' LIMIT 1`,
    );
    if (!sportRow) return { teams: 0, written: 0 };

    const targets = await this.targets('team', 'football', limit);
    this.logger.log(`football: ${targets.length} teams`);

    let written = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const counted = await this.provider.fetchClubTitles(target.title);

        // `competitions` guards against a silent zero: an honours table this
        // reader does not recognise yields none, which is a parsing failure
        // rather than a club that has won nothing.
        if (counted.titles === null || counted.competitions === 0) continue;

        await this.database.db.execute(sql`
          INSERT INTO team_statistic (
            team_id, sport_id, discipline_id, scope, stats, computed_at
          ) VALUES (
            ${target.id}, ${sportRow.id}, NULL, 'career',
            ${JSON.stringify({ titles_won: counted.titles })}::jsonb, now()
          )
          ON CONFLICT (
            team_id, scope,
            coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
            coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
          ) DO UPDATE SET
            stats = team_statistic.stats || EXCLUDED.stats,
            computed_at = now()
        `);
        written += 1;
      } catch (error) {
        this.logger.warn(`Titles failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} teams, ${written} written`);
      }
    }

    await this.revalidate(['sport:football']);

    return { teams: targets.length, written };
  }

  /**
   * Reads the headline numbers for the most notable footballers and reports
   * them, without writing anything.
   *
   * A review tool rather than a pipeline step. The three tiles are the most
   * visible numbers on the site, and a wrong one is embarrassing in a way a
   * missing statistic is not: Casillas showing zero trophies was noticed
   * immediately. This prints the values so they can be read against what the
   * articles say, and flags the shapes that are suspicious on their face.
   */
  async scanFootballCareerTotals(limit: number): Promise<ScanRow[]> {
    // Its own query rather than `targets`, for two reasons: the player's
    // recorded position is needed to judge a goals figure, and one person can
    // hold two Wikipedia mappings, which `targets` returns as two rows. Raúl
    // appeared twice in the first scan for exactly that reason.
    const targets = await this.database.db.execute<{
      title: string;
      name: string;
      position: string | null;
    }>(sql`
      SELECT DISTINCT ON (p.id)
             em.external_id AS title,
             p.full_name AS name,
             p.attributes->>'position' AS position
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.id, em.external_id
      LIMIT ${limit * 3}
    `);

    // Notability drives the order, and `DISTINCT ON` requires it to lead the
    // sort, so the ranking is applied after de-duplication rather than in SQL.
    const ranked = await this.database.db.execute<{ title: string }>(sql`
      SELECT em.external_id AS title
      FROM person p
      JOIN sport s ON s.id = p.primary_sport_id AND s.slug = 'football'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.provider = 'wikipedia' AND em.entity_type = 'person'
      ORDER BY p.notability DESC
    `);

    const order = new Map(ranked.map((row, index) => [row.title, index]));
    const shortlist = targets
      .sort((a, b) => (order.get(a.title) ?? Infinity) - (order.get(b.title) ?? Infinity))
      .slice(0, limit);

    const rows: ScanRow[] = [];

    for (const [index, target] of shortlist.entries()) {
      try {
        const [totals, honours] = await Promise.all([
          this.provider.fetchFootballCareerTotals(target.title),
          this.provider.fetchFootballHonours(target.title),
        ]);

        // A goalkeeper who scored nothing is the normal case, so the position
        // decides whether a zero is a finding: flagging Buffon, Casillas, Neuer
        // and Yashin as broken buried the real problems in the first scan.
        const keeper = /goal ?keeper|goalie/i.test(target.position ?? '');

        const warnings: string[] = [];
        if (totals.games === null) warnings.push('no appearances');
        if (totals.goals === null) warnings.push('no goals');
        if (honours.won === null || honours.groups === 0) warnings.push('no honours section');
        if (!keeper && totals.goals === 0 && (totals.games ?? 0) > 200) {
          warnings.push('outfielder with no goals');
        }
        if (honours.won === 0 && honours.groups > 0) warnings.push('zero trophies');
        // Nobody has played 1,500 senior matches; a figure that large means two
        // numbers have been added that should not have been.
        if ((totals.games ?? 0) > 1_500) warnings.push('implausible appearances');
        // Puskás genuinely scored more than he played, so this is a prompt to
        // look rather than proof of an error.
        if ((totals.goals ?? 0) > (totals.games ?? 0)) warnings.push('goals exceed games');

        rows.push({
          name: target.name,
          title: target.title,
          position: target.position,
          games: totals.games,
          goals: totals.goals,
          trophies: honours.won,
          warnings,
        });
      } catch (error) {
        rows.push({
          name: target.name,
          title: target.title,
          position: target.position,
          games: null,
          goals: null,
          trophies: null,
          warnings: [`failed: ${this.message(error)}`],
        });
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  scanned ${index + 1}/${shortlist.length}`);
      }
    }

    return rows;
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
    /**
     * Restrict to teams of one kind.
     *
     * Added for cricket's per-format leaderboards, which exist only for
     * international sides: Test, ODI and T20I records are published for
     * countries and for nobody else, so running the same crawl over 800
     * domestic and franchise sides would be 800 fruitless fetches.
     */
    teamKind?: string,
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
        ${sql.raw(teamKind && entityType === 'team' ? `AND e.kind = '${teamKind}'` : '')}
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

  /**
   * Basketball teams' all-time points, rebounds and assists leaders.
   *
   * Its own pass rather than part of `ingestTeamRankings`, because the source is
   * a different article in a different shape: "{Team} all-time roster" carries
   * per-team career totals, which is the one thing no other source we hold does.
   *
   * Ordered by notability so a limited run covers the teams a reader is most
   * likely to open. Teams whose article does not exist or does not parse are
   * counted as skipped and keep whatever they had, rather than having their
   * tables cleared.
   */
  async ingestBasketballTeamLeaders(
    limit: number,
  ): Promise<{ examined: number; written: number; skipped: number }> {
    const teams = await this.database.db.execute<{ id: string; name: string }>(sql`
      SELECT t.id, t.name
      FROM team t
      JOIN sport s ON s.id = t.sport_id
      WHERE s.slug = 'basketball'
      ORDER BY t.notability DESC
      LIMIT ${limit}
    `);

    let written = 0;
    let skipped = 0;

    for (const [index, team] of teams.entries()) {
      try {
        const rankings = await this.provider.fetchBasketballTeamLeaders(team.name);
        if (rankings.length === 0) {
          skipped += 1;
          continue;
        }

        for (const ranking of rankings) {
          await this.writeRanking('team', team.id, ranking, ranking.sourceTitle ?? null);
          written += 1;
        }
      } catch (error) {
        // One unparseable article must not end the run: these are read best
        // effort across hundreds of teams.
        skipped += 1;
        this.logger.warn(`Leaders failed for ${team.name}: ${this.message(error)}`);
      }

      if ((index + 1) % 25 === 0) {
        this.logger.log(`  ${index + 1}/${teams.length} teams scanned`);
      }
    }

    return { examined: teams.length, written, skipped };
  }

  /**
   * Basketball players' career highlights, as the sport summarises them.
   *
   * Stored on `person.attributes.careerHighlights`, an open JSONB bag the player
   * page already reads, so this needs no schema change. Kept as an ordered list
   * of `{ label, times }` rather than rendered prose, so the page can present
   * "22×" as a count rather than parsing a string back apart.
   *
   * Ordered by notability, so a limited run covers the players a reader is most
   * likely to open. A player whose article has no `highlights` field keeps
   * whatever they had rather than having it cleared.
   */
  async ingestBasketballHighlights(
    limit: number,
  ): Promise<{ examined: number; written: number; skipped: number }> {
    const targets = await this.targets('person', 'basketball', limit);

    let written = 0;
    let skipped = 0;

    for (const [index, target] of targets.entries()) {
      try {
        const highlights = await this.provider.fetchCareerHighlights(target.title);
        if (highlights.length === 0) {
          skipped += 1;
          continue;
        }

        await this.database.db.execute(sql`
          UPDATE person
          SET attributes = attributes || jsonb_build_object(
                'careerHighlights', ${JSON.stringify(highlights)}::jsonb
              ),
              updated_at = now()
          WHERE id = ${target.id}
        `);
        written += 1;
      } catch (error) {
        skipped += 1;
        this.logger.warn(`Highlights failed for ${target.title}: ${this.message(error)}`);
      }

      if ((index + 1) % 50 === 0) {
        this.logger.log(`  ${index + 1}/${targets.length} players scanned`);
      }
    }

    return { examined: targets.length, written, skipped };
  }

  /**
   * Lead prose for competitions, into `about`.
   *
   * No competition in any sport had this: the tab rendered a logo, a fact grid
   * and nothing that said what the thing is. The REST summary endpoint returns
   * the article's lead already stripped of templates and references, which is
   * exactly the paragraph wanted.
   */
  async ingestCompetitionAbout(
    sportSlug: string | null,
    limit: number,
  ): Promise<{ examined: number; written: number; skipped: number }> {
    const targets = await this.targets('competition', sportSlug, limit);

    let written = 0;
    let skipped = 0;

    for (const target of targets) {
      try {
        const summary = await this.provider.fetchSummary(target.title);
        if (!summary) {
          skipped += 1;
          continue;
        }

        await this.database.db.execute(sql`
          UPDATE competition SET about = ${summary}, updated_at = now()
          WHERE id = ${target.id}
        `);
        written += 1;
      } catch (error) {
        skipped += 1;
        this.logger.warn(`About failed for ${target.title}: ${this.message(error)}`);
      }
    }

    return { examined: targets.length, written, skipped };
  }

  /**
   * The NBA's roll of honour, award rolls and career leader boards.
   *
   * Its own pass rather than part of `ingestCompetitionRankings`, because the
   * source is ten separate list articles specific to this league rather than
   * one competition page. See `fetchNbaCompetitionTables` for why these are read
   * rather than derived from the honours we already hold.
   */
  /**
   * The same tables for basketball's other competitions.
   *
   * Separate from the NBA pass because the sources are per-competition rather
   * than shared, and because coverage is uneven: see
   * `fetchBasketballCompetitionTables` for what each one publishes and why. A
   * competition whose articles support nothing is reported rather than left
   * looking as though it failed.
   */
  async ingestBasketballCompetitionTables(): Promise<{ slug: string; written: number }[]> {
    const rows = await this.database.db.execute<{ id: string; slug: string }>(sql`
      SELECT c.id, c.slug FROM competition c
      JOIN sport s ON s.id = c.sport_id
      WHERE s.slug = 'basketball' AND c.slug <> 'nba'
      ORDER BY c.notability DESC
    `);

    const results: { slug: string; written: number }[] = [];

    for (const row of rows) {
      try {
        const tables = await this.provider.fetchBasketballCompetitionTables(row.slug);
        for (const table of tables) {
          await this.writeRanking('competition', row.id, table, table.sourceTitle ?? null);
        }
        results.push({ slug: row.slug, written: tables.length });
      } catch (error) {
        this.logger.warn(`Tables failed for ${row.slug}: ${this.message(error)}`);
        results.push({ slug: row.slug, written: 0 });
      }
    }

    return results;
  }

  async ingestNbaCompetitionTables(): Promise<{ written: number; skipped: number }> {
    const [row] = await this.database.db.execute<{ id: string }>(sql`
      SELECT c.id FROM competition c
      JOIN sport s ON s.id = c.sport_id
      WHERE s.slug = 'basketball' AND c.slug = 'nba'
      LIMIT 1
    `);
    if (!row) return { written: 0, skipped: 0 };

    const tables = await this.provider.fetchNbaCompetitionTables();

    let written = 0;
    for (const table of tables) {
      await this.writeRanking('competition', row.id, table, table.sourceTitle ?? null);
      written += 1;
    }

    // Ten are expected. Fewer means an article moved or changed shape, which is
    // worth saying rather than leaving the page quietly short of a table.
    return { written, skipped: 10 - written };
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

/** One player's headline numbers, as read for review rather than for writing. */
export interface ScanRow {
  name: string;
  title: string;
  /** Decides whether a goals figure of zero is a finding or a goalkeeper. */
  position: string | null;
  games: number | null;
  goals: number | null;
  trophies: number | null;
  /** Shapes worth a human look: a zero that should not be, a figure too large. */
  warnings: string[];
}
