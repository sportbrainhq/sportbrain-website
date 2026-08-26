/**
 * Seeds the statistic registry and derives what statistics the current data can
 * actually support.
 *
 * ```bash
 * pnpm --filter @sportbrain/api seed
 * ```
 *
 * Idempotent by design: run it after every deploy or ingestion. Definitions are
 * upserted on their natural key, and derived statistics are recomputed from the
 * base data rather than incremented, so running twice changes nothing.
 *
 * ## What "derived" means here, and its limits
 *
 * Wikidata holds no match statistics, so most registry keys have no values and
 * will not until a paid feed arrives. Two things can honestly be computed from
 * what is already stored, and only two:
 *
 *   - **Honours won**, counted from the honour table.
 *   - **Career span**, from a person's team memberships.
 *
 * Everything else is left absent rather than estimated. A statistics panel that
 * shows two real numbers is worth more than one showing twenty invented ones,
 * and an invented number is impossible to distinguish from a real one once it
 * is in the database.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../../config/configuration';
import * as schema from '../schema';
import { MANUAL_RANKING_SOURCE } from '../schema';
import { EXPLAINERS, SPORT_OVERVIEWS } from './editorial';
import { COMPETITION_SECTIONS, TEAM_SECTIONS } from './entity-editorial';
import {
  FOOTBALL_GOVERNANCE,
  FOOTBALL_SECTIONS,
  FOOTBALL_SOURCES,
  FOOTBALL_TIMELINE,
  type GoverningBodySeed,
  type SectionSeed,
  type SourceSeed,
  type TimelineSeed,
} from './football-overview';
import {
  CRICKET_CONCEPTS,
  CRICKET_FACTS,
  CRICKET_FORMATS,
  CRICKET_GOVERNANCE,
  CRICKET_MEMBERSHIP,
  CRICKET_SECTIONS,
  CRICKET_SOURCES,
  CRICKET_TIMELINE,
  type ConceptSeed,
  type FactSeed,
  type FormatSeed,
  type MembershipTierSeed,
} from './cricket-overview';
import {
  BASKETBALL_CONCEPTS,
  BASKETBALL_FACTS,
  BASKETBALL_FORMATS,
  BASKETBALL_GOVERNANCE,
  BASKETBALL_MEMBERSHIP,
  BASKETBALL_SECTIONS,
  BASKETBALL_SOURCES,
  BASKETBALL_TIMELINE,
  BASKETBALL_FEATURED,
  type FeaturedEntitySeed,
} from './basketball-overview';
import {
  FOOTBALL_EXPLAINER_CATEGORIES,
  FOOTBALL_EXPLAINER_TOPICS,
} from './football-explainer-taxonomy';
import { FOOTBALL_EXPLAINERS, FOOTBALL_EXPLAINER_SOURCES } from './football-explainers';
import { FOOTBALL_SEEDED_AWARDS } from './football-competition-awards';
import { WikipediaClient } from '../../integrations/providers/wikipedia/wikipedia.client';
import { CRICKET_COMPETITION_RANKING_SEEDS } from './cricket-competition-rankings';
import { CRICKET_CURATED_COMPETITIONS, CRICKET_CURATED_SLUGS } from './cricket-competitions';
import {
  FOOTBALL_CURATED_COMPETITIONS,
  FOOTBALL_CURATED_SLUGS,
  type CuratedCompetition,
} from './football-competitions';
import {
  CRICKET_EXPLAINER_CATEGORIES,
  CRICKET_EXPLAINER_TOPICS,
} from './cricket-explainer-taxonomy';
import { CRICKET_EXPLAINERS, CRICKET_EXPLAINER_SOURCES } from './cricket-explainers';
import {
  BASKETBALL_EXPLAINER_CATEGORIES,
  BASKETBALL_EXPLAINER_TOPICS,
} from './basketball-explainer-taxonomy';
import { BASKETBALL_EXPLAINERS, BASKETBALL_EXPLAINER_SOURCES } from './basketball-explainers';
import { BASKETBALL_RULES_AND_COURT } from './basketball-rules-and-court';
import { BASKETBALL_PLAY_AND_STATS } from './basketball-play-and-stats';
import { BASKETBALL_LEAGUES } from './basketball-leagues';
import { seedExplainerLibrary } from './seed-explainers';
import { basketballHonourTier } from './basketball-honour-tiers';
import { cricketHonourTier } from './cricket-honour-tiers';
import { honourTier } from './football-honour-tiers';
import { STATISTIC_REGISTRY } from './statistic-registry';
import { TEAM_RANKING_SEEDS } from './team-rankings';
import { COMPETITION_RANKING_SEEDS, type CompetitionRankingSeed } from './competition-rankings';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const db = drizzle(client, { schema });

  try {
    for (const [slug, curated, slugs] of [
      ['football', FOOTBALL_CURATED_COMPETITIONS, FOOTBALL_CURATED_SLUGS],
      ['cricket', CRICKET_CURATED_COMPETITIONS, CRICKET_CURATED_SLUGS],
    ] as const) {
      const competitions = await seedCuratedCompetitions(db, slug, [...curated], slugs);
      process.stdout.write(
        `Competitions: ${slug} — ${competitions.created} created, ` +
          `${competitions.updated} curated, ${competitions.deleted} removed\n`,
      );
    }

    const awards = await seedCompetitionAwards(db);
    process.stdout.write(
      `Awards:   ${awards.written} seeded award winners merged, ${awards.skipped} skipped\n`,
    );

    const definitions = await seedRegistry(db);
    process.stdout.write(`Registry: ${definitions} definitions upserted\n`);

    const honours = await deriveHonourCounts(db);
    process.stdout.write(`Derived:  ${honours} honour counts written\n`);

    const spans = await deriveCareerSpans(db);
    process.stdout.write(`Derived:  ${spans} career spans written\n`);

    // Deduplicate, then tier, then prioritise. The order is load-bearing and
    // used to be wrong: both priority passes weight honours by `prestige`, and
    // they ran *before* `deriveHonourPrestige` assigned it. Every run therefore
    // scored teams from the previous run's tiers, and on a fresh database the
    // first run scored every honour flat, which is the defect that put Real
    // Madrid Baloncesto above the Lakers. Deduplication comes first so a
    // merged honour is not tiered and then counted twice.
    const merged = await deduplicateHonours(db);
    process.stdout.write(`Derived:  ${merged} duplicate honours merged\n`);

    const tiered = await deriveHonourPrestige(db);
    process.stdout.write(`Derived:  ${tiered} honours tiered\n`);

    const ranked = await derivePersonPriority(db);
    process.stdout.write(`Derived:  ${ranked} people re-prioritised\n`);

    const rankedTeams = await deriveTeamPriority(db);
    process.stdout.write(`Derived:  ${rankedTeams} teams re-prioritised\n`);

    const statuses = await derivePersonStatus(db);
    process.stdout.write(`Derived:  ${statuses} career statuses set\n`);

    const overviews = await seedOverviews(db);
    process.stdout.write(`Content:  ${overviews} sport overviews written\n`);

    const explainers = await seedExplainers(db);
    process.stdout.write(`Content:  ${explainers} explainers published\n`);

    const entitySections = await seedEntitySections(db);
    process.stdout.write(`Content:  ${entitySections} entity sections published\n`);

    const seededRankings = await seedTeamRankings(db);
    process.stdout.write(
      `Rankings: ${seededRankings.written} hand-entered leaderboards, ` +
        `${seededRankings.skipped} teams not in the database\n`,
    );

    const competitionRankings = await seedCompetitionRankings(db);
    process.stdout.write(
      `Rankings: ${competitionRankings.written} competition leaderboards, ` +
        `${competitionRankings.removed} superseded tables removed, ` +
        `${competitionRankings.skipped} competitions not in the database\n`,
    );

    // Football, then cricket, then basketball. Order is irrelevant to
    // correctness: the source prune is scoped by URL and every other prune by
    // sport_id, so no sport's seed can touch another's rows. They are listed
    // rather than looped so that adding a sport stays an explicit decision.
    for (const [slug, content] of [
      [
        'football',
        {
          sources: FOOTBALL_SOURCES,
          timeline: FOOTBALL_TIMELINE,
          governance: FOOTBALL_GOVERNANCE,
          sections: FOOTBALL_SECTIONS,
        },
      ],
      [
        'cricket',
        {
          sources: CRICKET_SOURCES,
          timeline: CRICKET_TIMELINE,
          governance: CRICKET_GOVERNANCE,
          sections: CRICKET_SECTIONS,
          formats: CRICKET_FORMATS,
          concepts: CRICKET_CONCEPTS,
          facts: CRICKET_FACTS,
          membership: CRICKET_MEMBERSHIP,
        },
      ],
      [
        'basketball',
        {
          sources: BASKETBALL_SOURCES,
          timeline: BASKETBALL_TIMELINE,
          governance: BASKETBALL_GOVERNANCE,
          sections: BASKETBALL_SECTIONS,
          formats: BASKETBALL_FORMATS,
          concepts: BASKETBALL_CONCEPTS,
          facts: BASKETBALL_FACTS,
          membership: BASKETBALL_MEMBERSHIP,
          featured: BASKETBALL_FEATURED,
        },
      ],
    ] as const) {
      const overview = await seedSportOverview(db, slug, content);
      process.stdout.write(
        `Overview: ${slug} — ${overview.sources} sources, ${overview.timeline} timeline events, ` +
          `${overview.bodies} governing bodies, ${overview.sections} sections, ` +
          `${overview.formats} formats, ${overview.concepts} concepts, ${overview.facts} facts\n`,
      );
    }

    const library = await seedExplainerLibrary(
      db,
      'football',
      FOOTBALL_EXPLAINER_CATEGORIES,
      FOOTBALL_EXPLAINER_TOPICS,
      FOOTBALL_EXPLAINERS,
      FOOTBALL_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${library.categories} categories, ${library.explainers} concepts ` +
        `(${library.published} published), ${library.sections} sections, ` +
        `${library.aliases} aliases, ${library.relations} relations\n`,
    );

    // Cricket runs through the same function with its own taxonomy and content.
    // That the call is identical is the point: a third sport is one more block
    // here and two data files, with no schema, API or frontend work.
    const cricketLibrary = await seedExplainerLibrary(
      db,
      'cricket',
      CRICKET_EXPLAINER_CATEGORIES,
      CRICKET_EXPLAINER_TOPICS,
      CRICKET_EXPLAINERS,
      CRICKET_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${cricketLibrary.categories} cricket categories, ` +
        `${cricketLibrary.explainers} concepts (${cricketLibrary.published} published), ` +
        `${cricketLibrary.sections} sections, ${cricketLibrary.aliases} aliases, ` +
        `${cricketLibrary.relations} relations\n`,
    );
    // Basketball, through the same function again. That the call is identical
    // to football's and cricket's is the point: a third library is two data
    // files and one block here, with no schema, API or frontend work beyond the
    // court diagram, which is a visual the other two sports do not need.
    const basketballLibrary = await seedExplainerLibrary(
      db,
      'basketball',
      BASKETBALL_EXPLAINER_CATEGORIES,
      BASKETBALL_EXPLAINER_TOPICS,
      [
        ...BASKETBALL_EXPLAINERS,
        ...BASKETBALL_RULES_AND_COURT,
        ...BASKETBALL_PLAY_AND_STATS,
        ...BASKETBALL_LEAGUES,
      ],
      BASKETBALL_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${basketballLibrary.categories} basketball categories, ` +
        `${basketballLibrary.explainers} concepts (${basketballLibrary.published} published), ` +
        `${basketballLibrary.sections} sections, ${basketballLibrary.aliases} aliases, ` +
        `${basketballLibrary.relations} relations\n`,
    );
    await revalidateCaches();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

/**
 * Drops the web app's cached pages after a seed run.
 *
 * The seed derives ordering (`deriveTeamPriority`, `derivePersonPriority`) and
 * rewrites editorial content, and both are read through a one-hour cache. Until
 * this existed the effect was invisible for that hour: `deriveTeamPriority` put
 * Mumbai Indians top of the franchises and the Teams tab went on showing the old
 * order, which looks exactly like the derivation not having worked.
 *
 * Best effort, matching the ingestion service's own revalidation: seeding
 * having succeeded is the valuable outcome, and a web app that is not running
 * must not fail the run. Absent configuration is silent, because that is the
 * normal state in CI.
 */
async function revalidateCaches(): Promise<void> {
  const url = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;

  try {
    const response = await fetch(new URL('/api/revalidate', url), {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
      body: JSON.stringify({ tags: ['sports', 'teams', 'players', 'competitions', 'content'] }),
      signal: AbortSignal.timeout(10_000),
    });
    process.stdout.write(
      response.ok
        ? 'Cache:    web pages revalidated\n'
        : `Cache:    revalidation returned ${response.status}; pages may serve stale data\n`,
    );
  } catch (error) {
    process.stdout.write(
      `Cache:    revalidation failed (${error instanceof Error ? error.message : String(error)})\n`,
    );
  }
}

type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Upserts every definition.
 *
 * Conflict targets differ by whether the definition is sport-wide, because the
 * schema guards those two cases with different partial unique indexes: Postgres
 * treats nulls as distinct, so one index cannot cover both.
 */
async function seedRegistry(db: Db): Promise<number> {
  let count = 0;

  for (const [sportSlug, definitions] of Object.entries(STATISTIC_REGISTRY)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
    );
    if (!sportRow) {
      process.stdout.write(`  skipped ${sportSlug}: not in the database\n`);
      continue;
    }

    for (const definition of definitions) {
      // Resolved per definition rather than cached, because a missing
      // discipline should skip only its own row and not the whole sport.
      let disciplineId: string | null = null;
      if (definition.discipline) {
        const [row] = await db.execute<{ id: string }>(
          sql`SELECT id FROM discipline
              WHERE sport_id = ${sportRow.id} AND key = ${definition.discipline}
              LIMIT 1`,
        );
        if (!row) {
          process.stdout.write(
            `  skipped ${sportSlug}.${definition.key}: no discipline "${definition.discipline}"\n`,
          );
          continue;
        }
        disciplineId = row.id;
      }

      const conflictTarget = disciplineId
        ? sql`(sport_id, discipline_id, key)`
        : sql`(sport_id, key) WHERE discipline_id IS NULL`;

      await db.execute(sql`
        INSERT INTO statistic_definition (
          sport_id, discipline_id, key, label, short_label, applies_to, category,
          aggregation, format, precision, higher_is_better, display_order,
          is_headline, description, formula
        ) VALUES (
          ${sportRow.id}, ${disciplineId}, ${definition.key}, ${definition.label},
          ${definition.shortLabel ?? null}, ${definition.appliesTo}, ${definition.category},
          ${definition.aggregation}, ${definition.format}, ${definition.precision ?? 0},
          ${definition.higherIsBetter ?? true}, ${definition.displayOrder},
          ${definition.isHeadline ?? false}, ${definition.description},
          ${definition.formula ? JSON.stringify(definition.formula) : null}
        )
        ON CONFLICT ${conflictTarget} DO UPDATE SET
          label = EXCLUDED.label,
          short_label = EXCLUDED.short_label,
          applies_to = EXCLUDED.applies_to,
          category = EXCLUDED.category,
          aggregation = EXCLUDED.aggregation,
          format = EXCLUDED.format,
          precision = EXCLUDED.precision,
          higher_is_better = EXCLUDED.higher_is_better,
          display_order = EXCLUDED.display_order,
          is_headline = EXCLUDED.is_headline,
          description = EXCLUDED.description,
          formula = EXCLUDED.formula,
          updated_at = now()
      `);
      count += 1;
    }
  }

  return count;
}

/**
 * Counts honours per person and per team into their statistics rows.
 *
 * One of only two statistics the current data genuinely supports. Written to
 * the `career` scope with a null discipline, because an honour belongs to a
 * career rather than to a format.
 *
 * The JSONB payload is merged rather than replaced, so this cannot destroy
 * values a future feed has written alongside it.
 */
async function deriveHonourCounts(db: Db): Promise<number> {
  const people = await db.execute<{ count: string }>(sql`
    -- Grouped by person alone, not by person and sport. The conflict target
    -- below does not include the sport, so a person holding honours under two
    -- sports produced two rows aiming at one key and Postgres rejected the whole
    -- statement with "ON CONFLICT DO UPDATE command cannot affect row a second
    -- time". One dual-code footballer was enough to fail the entire seed.
    --
    -- The person's primary sport is used for the row, which is what the rest of
    -- the schema treats as their sport.
    WITH counts AS (
      SELECT h.person_id, p.primary_sport_id AS sport_id, count(*) AS honours
      FROM honour h
      JOIN person p ON p.id = h.person_id
      WHERE h.person_id IS NOT NULL
      GROUP BY h.person_id, p.primary_sport_id
    )
    INSERT INTO person_statistic (person_id, sport_id, scope, discipline_id, stats, computed_at)
    SELECT person_id, sport_id, 'career', NULL,
           jsonb_build_object('honours_won', honours), now()
    FROM counts
    -- Must mirror the index expressions exactly, coalescing included, or
    -- Postgres cannot match the constraint and the statement fails.
    ON CONFLICT (
      person_id, scope,
      coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(team_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    DO UPDATE SET
      stats = person_statistic.stats || EXCLUDED.stats,
      computed_at = now()
    RETURNING 1 AS count
  `);

  const teams = await db.execute<{ count: string }>(sql`
    WITH counts AS (
      SELECT team_id, sport_id, count(*) AS honours
      FROM honour WHERE team_id IS NOT NULL
      GROUP BY team_id, sport_id
    )
    INSERT INTO team_statistic (team_id, sport_id, scope, discipline_id, stats, computed_at)
    SELECT team_id, sport_id, 'career', NULL,
           jsonb_build_object('titles_won', honours), now()
    FROM counts
    ON CONFLICT (
      team_id, scope,
      coalesce(competition_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(season_id, '00000000-0000-0000-0000-000000000000'::uuid),
      coalesce(discipline_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    DO UPDATE SET
      stats = team_statistic.stats || EXCLUDED.stats,
      computed_at = now()
    RETURNING 1 AS count
  `);

  return people.length + teams.length;
}

/**
 * Records the first and last year a person is known to have been at a club.
 *
 * Written into `person.attributes` rather than into a statistics row, because a
 * career span is biographical rather than statistical: it is not a quantity
 * anybody aggregates or ranks by.
 */
/**
 * Scores people for list ordering.
 *
 * Two things have to be balanced. Sitelinks measure how well known a person is
 * across languages, which is close to what a reader means by "important" but
 * includes people notable for something other than the sport. Career evidence
 * in our own tables proves the person is a real player, but is a measure of our
 * coverage as much as of them.
 *
 * The first version leaned on career evidence and got the balance badly wrong.
 * Appearing in a club's records table was worth 400 points, so Zlatan
 * Ibrahimović outranked Messi purely by having played for more clubs whose
 * records articles we happen to have parsed, and Pelé finished below two
 * hundred players because Santos has no records article at all. That scores our
 * parsing coverage, not the footballer.
 *
 * So sitelinks are the base, scaled to dominate, and the rest are modifiers:
 *
 *   - **Sitelinks, squared-ish.** Multiplied by 20, so the gap between Pelé at
 *     182 and a journeyman at 20 is decisive rather than marginal.
 *   - **Honours, uncapped.** Messi has 119 recorded honours and Ibrahimović 11;
 *     the old cap of 12 treated those as equal, which is absurd. Weighted
 *     modestly per honour because the counts are wildly incomplete.
 *   - **Career evidence as a small bonus.** Enough to lift a real player above
 *     a politician with a similar article count, not enough to reorder players
 *     among themselves.
 *   - **Sport affiliation, weighted to clear the sitelink cap.** A club naming
 *     the sport, or a recorded position, is proof the person had a career in it
 *     rather than a stray Wikidata statement. This is what puts Archie Jackson
 *     above Arthur Conan Doyle.
 *
 * Reads `sitelinks` and writes `notability`, which are now separate columns.
 * They were the same one, so this function consumed its own output and the raw
 * signal was destroyed on the first run.
 */
async function derivePersonPriority(db: Db): Promise<number> {
  const rows = await db.execute<{ count: string }>(sql`
    WITH evidence AS (
      SELECT
        p.id,
        p.sitelinks,
        (SELECT count(*) FROM honour h WHERE h.person_id = p.id) AS honours,
        (SELECT count(DISTINCT pt.team_id) FROM person_team pt WHERE pt.person_id = p.id) AS clubs,
        EXISTS (
          SELECT 1
          FROM entity_ranking r
          CROSS JOIN LATERAL jsonb_array_elements(r.entries) e
          JOIN external_mapping m
            ON m.entity_id = p.id AND m.entity_type = 'person' AND m.provider = 'wikipedia'
          WHERE r.entity_type = 'team' AND e->>'link' = m.external_id
        ) AS ranked,
        -- Evidence that the person played *this* sport rather than merely
        -- having a statement saying they once did.
        --
        -- Wikidata's sport statement is true of anybody who played the game at
        -- all, which is why the cricket catalogue contains a novelist, a king
        -- and a playwright. Capping sitelinks stopped them opening the list; it
        -- did not stop them outranking several thousand actual Test players,
        -- because a cap of 40 still beats a county professional's nine.
        --
        -- Matched against the sport's own team catalogue rather than against
        -- the sport's name.
        --
        -- Name-matching was tried first and is wrong: an IPL franchise is not
        -- called "... cricket team", so Virat Kohli ("Royal Challengers
        -- Bengaluru"), Adam Gilchrist ("Punjab Kings") and AB de Villiers
        -- ("Delhi Capitals") all failed the test and were demoted below
        -- journeymen whose club happened to carry the word. Resolving the club
        -- against the team table fixes that and is strictly better evidence:
        -- the club is one we actually hold for this sport.
        EXISTS (
          SELECT 1 FROM team tm
          WHERE tm.sport_id = p.primary_sport_id
            AND p.attributes->>'currentClub' IS NOT NULL
            AND (
              lower(tm.name) = lower(p.attributes->>'currentClub')
              OR lower(p.attributes->>'currentClub') = ANY (
                SELECT lower(alias) FROM unnest(coalesce(tm.aliases, '{}'::text[])) AS alias
              )
            )
        ) AS affiliated,
        (p.attributes->>'position' IS NOT NULL) AS positioned
      FROM person p
      LEFT JOIN sport s ON s.id = p.primary_sport_id
    )
    UPDATE person p SET
      notability =
        -- Capped, and the cap is the point.
        --
        -- Uncapped, global fame swamps every sporting signal, because Wikidata
        -- sitelinks measure how many languages wrote about somebody rather than
        -- how good they were. A sport statement is true of anyone who played the
        -- game at all, so the cricket catalogue contains Arthur Conan Doyle
        -- (183 sitelinks), Charles III (176) and Samuel Beckett (140), all of
        -- whom played first-class cricket and none of whom anybody opens a
        -- cricket site to read about. At 20 a link they scored 3,660, 3,520 and
        -- 2,800 against Tendulkar's 1,700, so the Players tab opened with a
        -- novelist, a king and a playwright.
        --
        -- 40 is set above the most-documented actual sportsperson we hold and
        -- below the incidental-cricketer polymaths, so it costs a genuine star
        -- nothing and removes the distortion.
        least(evidence.sitelinks, 40) * 20
        + least(evidence.honours, 150) * 12
        -- Raised from 250, which was too small to matter once sitelinks reached
        -- three figures. Appearing in a team's records table is the strongest
        -- evidence available that somebody played the sport seriously rather
        -- than incidentally, and it is now weighted to say so.
        + CASE WHEN evidence.ranked THEN 900 ELSE 0 END
        + least(evidence.clubs, 6) * 25
        -- Weighted to clear the sitelink cap on its own: 40 links score 800, so
        -- an affiliated player with no other evidence still outranks a polymath
        -- with the maximum. Deliberately not larger, because it must not
        -- reorder genuine players among themselves.
        + CASE WHEN evidence.affiliated THEN 850 ELSE 0 END
        + CASE WHEN evidence.positioned THEN 60 ELSE 0 END,
      updated_at = now()
    FROM evidence
    WHERE evidence.id = p.id
      AND p.confidence <> 'curated'
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * Scores every team for list ordering.
 *
 * The team counterpart of `derivePersonPriority`, added because teams had no
 * such pass at all: `notability` held the raw sitelink count and the Teams tab
 * was ordered by it directly. That measures how many language editions wrote an
 * article, which tracks a football club's standing tolerably and a cricket
 * franchise's not at all. Mumbai Indians, with five IPL titles, scored 4 while
 * Punjab Kings, with none, scored 25, so the tab put the competition's most
 * successful side last among the IPL teams.
 *
 * The weights follow the person formula deliberately, so the two orderings
 * behave alike:
 *
 *   - **Sitelinks** stay the base signal. They are a genuine popularity measure
 *     and the only one available for every team we hold.
 *   - **Honours** are what sitelinks miss, and they are weighted heavily enough
 *     to reorder the franchises: a title is the thing a reader is looking for
 *     when they scan a list of teams. Weighted by the honour's **prestige tier**
 *     rather than counted, because counting made a state side with fifty
 *     domestic titles outrank a Test nation with two World Cups.
 *   - **Squad size and leaderboards** are flat bonuses rather than multipliers,
 *     as in the person pass. Holding players or a records table says our
 *     coverage of that team is real, which is worth surfacing; holding twice as
 *     many does not make the team twice as important.
 *   - **Being active** breaks ties towards sides a reader can still watch.
 *     Defunct franchises keep their honours and sink below their peers.
 *
 * Reads `sitelinks` and writes `notability`, which are separate columns as of
 * migration 0023. Skips curated rows, so a hand-set order survives.
 */
async function deriveTeamPriority(db: Db): Promise<number> {
  const rows = await db.execute<{ count: string }>(sql`
    WITH evidence AS (
      SELECT
        t.id,
        t.sitelinks,
        t.is_active,
        -- Weighted by prestige rather than counted.
        --
        -- A flat count says a Sheffield Shield and a World Cup are the same
        -- thing, and with 48 of the former New South Wales outranked every Test
        -- nation. Tier 1 is worth twelve of a tier 4, which is roughly the ratio
        -- a reader would expect between a world title and a defunct sponsor cup.
        --
        -- Unranked honours score 1, not 0: an honour we have not judged is still
        -- evidence the team won something, and zeroing them would penalise a
        -- team for a gap in our curation rather than in its trophy cabinet.
        (
          SELECT coalesce(sum(
            CASE h.prestige
              WHEN 1 THEN 12
              WHEN 2 THEN 6
              WHEN 3 THEN 2
              WHEN 4 THEN 1
              ELSE 1
            END
          ), 0)
          FROM honour h WHERE h.team_id = t.id
        ) AS honour_weight,
        (SELECT count(*) FROM honour h WHERE h.team_id = t.id) AS honours,
        (SELECT count(DISTINCT pt.person_id) FROM person_team pt WHERE pt.team_id = t.id) AS squad,
        (
          SELECT count(*) FROM entity_ranking r
          WHERE r.entity_type = 'team' AND r.entity_id = t.id
        ) AS tables
      FROM team t
    )
    UPDATE team t SET
      notability =
        evidence.sitelinks * 20
        -- Capped low on purpose.
        --
        -- Honours are the right tiebreak between comparable teams and the wrong
        -- primary signal, because trophy counts scale with a competition's age
        -- rather than a team's standing. New South Wales has 48 Sheffield
        -- Shields going back to 1896; India has eight honours including two
        -- World Cups. With a generous cap the Shields still won, and a state
        -- side sat above every Test nation.
        --
        -- At 40 a team reaches the cap with roughly three world titles or twenty
        -- domestic ones, so honours can lift a decorated side past an
        -- undecorated peer without ever outweighing the reach that sitelinks
        -- measure.
        + least(evidence.honour_weight, 40) * 20
        + CASE WHEN evidence.tables > 0 THEN 150 ELSE 0 END
        + least(evidence.squad, 30) * 5
        + CASE WHEN evidence.is_active THEN 40 ELSE 0 END,
      updated_at = now()
    FROM evidence
    WHERE evidence.id = t.id
      AND t.confidence <> 'curated'
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * Removes honours that two sources record differently.
 *
 * Part of the seed rather than a one-off script because re-reading the
 * Wikipedia honours resurrects the collisions every time, and I have already
 * forgotten to re-run it once: Messi's page showed eight European Golden Shoes
 * against the six he won.
 *
 * Two kinds of duplicate, neither of which is a wrong row on its own:
 *
 *   1. **Season labels.** Wikidata records the Golden Shoe of season 2007-08 as
 *      2008 and Wikipedia as 2007. The pair sits one year apart, and Wikidata's
 *      is dropped because a single year cannot say which season it meant.
 *   2. **Renamed awards.** "FIFA Ballon d'Or" and "FIFA World Player of the
 *      Year" are the Ballon d'Or for the years the awards were merged. Messi's
 *      separate 2009 FIFA World Player of the Year survives, because before the
 *      merger it was a different prize.
 *
 * A genuine pair of consecutive wins is left alone, which is why this compares
 * across sources rather than looking for adjacent years: Modrić really did win
 * six Champions Leagues and Čech really did win twelve Czech Golden Balls.
 */
async function deduplicateHonours(db: Db): Promise<number> {
  const seasons = await db.execute<{ id: string }>(sql`
    DELETE FROM honour wd
    USING honour wp
    WHERE wd.source = 'wikidata'
      AND wp.source = 'wikipedia'
      AND wd.person_id = wp.person_id
      AND wd.title = wp.title
      AND wd.year = wp.year + 1
    RETURNING wd.id
  `);

  const aliases = await db.execute<{ id: string }>(sql`
    DELETE FROM honour a
    USING honour b
    WHERE a.person_id = b.person_id
      AND a.year = b.year
      AND b.title = 'Ballon d''Or'
      AND a.title IN ('FIFA Ballon d''Or', 'FIFA World Player of the Year')
    RETURNING a.id
  `);

  return seasons.length + aliases.length;
}

/**
 * Assigns a prestige tier to every honour, per sport.
 *
 * Applied here rather than at ingestion so the curated lists can be revised and
 * re-applied without re-fetching anything. Recomputed from the title each run,
 * so an honour that moves tier moves everywhere.
 */
async function deriveHonourPrestige(db: Db): Promise<number> {
  const rows = await db.execute<{ id: string; title: string; sport: string }>(sql`
    SELECT h.id, h.title, s.slug AS sport
    FROM honour h
    JOIN sport s ON s.id = h.sport_id
    WHERE s.slug IN ('football', 'cricket', 'basketball')
  `);

  // One curated list per sport, because the competitions have nothing in common.
  // Cricket was omitted originally, which left all 464 of its team honours
  // unranked and therefore counted flat by `deriveTeamPriority`: New South
  // Wales's 48 Sheffield Shields outscored India's two World Cups and a state
  // side opened the Teams tab.
  //
  // Basketball was omitted for the same reason and produced the same defect:
  // all 760 of its honours were unranked, so Real Madrid Baloncesto's 102 Liga
  // ACB and Copa del Rey titles outscored the Lakers' 17 NBA championships and
  // two European clubs opened basketball's Teams tab.
  const tierFor: Record<string, (title: string) => number | null> = {
    football: honourTier,
    cricket: cricketHonourTier,
    basketball: basketballHonourTier,
  };

  // Grouped by tier so the update is one statement per tier rather than per
  // honour: there are thousands of honours and four tiers.
  const byTier = new Map<number, string[]>();
  for (const row of rows) {
    const tier = tierFor[row.sport]?.(row.title) ?? null;
    if (tier === null) continue;
    byTier.set(tier, [...(byTier.get(tier) ?? []), row.id]);
  }

  let updated = 0;
  for (const [tier, ids] of byTier) {
    for (let index = 0; index < ids.length; index += 500) {
      const batch = ids.slice(index, index + 500);
      await db.execute(sql`
        UPDATE honour SET prestige = ${tier}, updated_at = now()
        WHERE id = ANY(${sql.raw(pgUuidArray(batch))})
      `);
      updated += batch.length;
    }
  }

  return updated;
}

/**
 * Works out whether each person is still competing.
 *
 * From evidence rather than inference about age. Three signals, in order of how
 * conclusive they are:
 *
 *   1. A date of death. Conclusive.
 *   2. A career end year in `attributes`, which Wikidata carries for most
 *      retired players.
 *   3. Club spells: a person whose every recorded spell has an end date has
 *      left their last club, and one with an open-ended current spell has not.
 *
 * Left null when none of those apply, and the profile shows no badge rather
 * than guessing. That matters more than it sounds: Zidane's page said "Current
 * club: Juventus FC", a club he left in 2001, because a stale attribute was
 * being rendered as current fact.
 */
async function derivePersonStatus(db: Db): Promise<number> {
  const rows = await db.execute<{ count: string }>(sql`
    WITH evidence AS (
      SELECT
        p.id,
        p.date_of_death,
        (p.attributes->>'careerEnd') AS career_end,
        (SELECT count(*) FROM person_team pt WHERE pt.person_id = p.id) AS spells,
        (SELECT count(*) FROM person_team pt
          WHERE pt.person_id = p.id AND pt.end_date IS NULL) AS open_spells,
        (SELECT max(extract(year FROM pt.end_date)) FROM person_team pt
          WHERE pt.person_id = p.id) AS last_end_year
      FROM person p
    )
    UPDATE person p SET
      career_status = CASE
        WHEN evidence.date_of_death IS NOT NULL THEN 'retired'
        -- A career-end year in the past is decisive; one in the future is a
        -- contract end rather than a retirement, so it says nothing.
        WHEN evidence.career_end ~ '^[0-9]{4}$'
             AND evidence.career_end::int < extract(year FROM now()) THEN 'retired'
        WHEN evidence.open_spells > 0 THEN 'active'
        -- Every spell closed, and the last one closed a while ago. Two years of
        -- slack, because a spell ending last season usually means a transfer
        -- that has not been ingested rather than a retirement.
        WHEN evidence.spells > 0
             AND evidence.last_end_year IS NOT NULL
             AND evidence.last_end_year < extract(year FROM now()) - 2 THEN 'retired'
        -- Keep what is already there rather than clearing it. Cricketers'
        -- statuses are read from the article's own playing span by the
        -- wiki cricket-careers command, because their squads carry no dates and
        -- none
        -- of the signals above fire; a plain NULL here erased every one of them
        -- on the next seed run.
        ELSE p.career_status
      END,
      updated_at = now()
    FROM evidence
    WHERE evidence.id = p.id AND p.confidence <> 'curated'
    RETURNING 1 AS count
  `);

  return rows.length;
}

/** Renders a uuid list as a Postgres array literal. Values are ids we read. */
function pgUuidArray(ids: string[]): string {
  return `ARRAY[${ids.map((id) => `'${id}'`).join(', ')}]::uuid[]`;
}

async function deriveCareerSpans(db: Db): Promise<number> {
  const rows = await db.execute<{ count: string }>(sql`
    WITH spans AS (
      SELECT person_id,
             min(extract(year from start_date))::int AS first_year,
             max(coalesce(extract(year from end_date), extract(year from now())))::int AS last_year
      FROM person_team
      WHERE start_date IS NOT NULL
      GROUP BY person_id
    )
    UPDATE person p
    SET attributes = p.attributes || jsonb_build_object(
          'careerStart', s.first_year,
          'careerEnd', s.last_year
        ),
        updated_at = now()
    FROM spans s
    WHERE p.id = s.person_id
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * Writes each sport's overview prose.
 *
 * Stored twice on purpose: on `sport.summary`, where the Overview tab and page
 * metadata read it, and as a `content` row of type `overview`, so it sits in the
 * same table as everything else editorial and can be edited through the same
 * tooling when that exists.
 */
async function seedOverviews(db: Db): Promise<number> {
  let count = 0;

  for (const [slug, summary] of Object.entries(SPORT_OVERVIEWS)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${slug} LIMIT 1`,
    );
    if (!sportRow) continue;

    // Only written when absent, never overwritten: this is a starting point for
    // an editor, and a seed run must not discard their revisions.
    await db.execute(sql`
      UPDATE sport SET summary = ${summary}, updated_at = now()
      WHERE id = ${sportRow.id} AND summary IS NULL
    `);

    await db.execute(sql`
      INSERT INTO content (sport_id, type, slug, title, excerpt, body, status, published_at)
      VALUES (
        ${sportRow.id}, 'overview', ${`${slug}-overview`},
        ${`About ${slug.replace('-', ' ')}`}, ${summary}, ${summary}, 'published', now()
      )
      ON CONFLICT (type, slug) DO UPDATE SET
        excerpt = EXCLUDED.excerpt, updated_at = now()
    `);
    count += 1;
  }

  return count;
}

/** Publishes the starter explainers. */
async function seedExplainers(db: Db): Promise<number> {
  let count = 0;

  for (const [sportSlug, explainers] of Object.entries(EXPLAINERS)) {
    const [sportRow] = await db.execute<{ id: string }>(
      sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
    );
    if (!sportRow) continue;

    for (const explainer of explainers) {
      await db.execute(sql`
        INSERT INTO content (
          sport_id, type, slug, title, excerpt, body, category,
          display_order, status, published_at
        ) VALUES (
          ${sportRow.id}, 'explainer', ${explainer.slug}, ${explainer.title},
          ${explainer.excerpt}, ${explainer.body}, ${explainer.category},
          ${explainer.displayOrder}, 'published', now()
        )
        ON CONFLICT (type, slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          body = EXCLUDED.body,
          category = EXCLUDED.category,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      count += 1;
    }
  }

  return count;
}

/**
 * Publishes hand-entered appearance and goalscoring leaderboards.
 *
 * Written with `MANUAL_RANKING_SOURCE` as the source title, which the Wikipedia
 * ingestion upsert refuses to overwrite. That is the whole point of the marker:
 * these teams have no article a crawler can read, so a later run must not
 * replace a curated table with nothing, and if one of them ever does gain a
 * records article the marker has to be cleared deliberately.
 *
 * A team named here that is not in the database is reported rather than
 * inserted. Slugs change when a name is corrected upstream, and a silent miss
 * would leave the page empty with nothing to explain why.
 */
async function seedTeamRankings(db: Db): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;

  for (const [slug, rankings] of Object.entries(TEAM_RANKING_SEEDS)) {
    const [team] = await db.execute<{ id: string }>(
      sql`SELECT id FROM team WHERE slug = ${slug} LIMIT 1`,
    );
    if (!team) {
      process.stdout.write(`  skipped team "${slug}": not in the database\n`);
      skipped += 1;
      continue;
    }

    for (const ranking of rankings) {
      const entries = ranking.entries
        .slice()
        .sort((first, second) => second.value - first.value)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          value: entry.value,
          detail: entry.detail ?? null,
        }));

      // The note carries the source and the date the figures were true, because
      // an appearance total for a serving player is only correct on the day it
      // was read.
      const note = `Compiled from ${ranking.source}, correct as of ${ranking.asOf}.`;

      await db.execute(sql`
        INSERT INTO entity_ranking (
          entity_type, entity_id, kind, label, entries, confidence, note, source_title
        ) VALUES (
          'team', ${team.id}, ${ranking.kind}, ${ranking.label},
          ${JSON.stringify(entries)}::jsonb, 'partial', ${note}, ${MANUAL_RANKING_SOURCE}
        )
        ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
          label = EXCLUDED.label,
          entries = EXCLUDED.entries,
          confidence = EXCLUDED.confidence,
          note = EXCLUDED.note,
          source_title = EXCLUDED.source_title,
          updated_at = now()
      `);
      written += 1;
    }
  }

  return { written, skipped };
}

/**
 * Publishes the curated leaderboards for the major club competitions.
 *
 * Rows are written with `MANUAL_RANKING_SOURCE` rather than the article URL,
 * which is what stops the next crawl replacing them. The URL is not lost: it
 * goes into the note, which is what the page actually shows as provenance.
 *
 * A competition listed in the seed has *only* the tables the seed names. Any
 * other leaderboard it holds is deleted, because the tables being replaced here
 * are not merely out of date. Ingestion built league rolls of honour from
 * Wikidata edition items labelled by the season's start year, so every row was
 * a year out, and it left behind single-row award tables and an `award:goal`
 * table of thirty unlabelled names that no reader could interpret. Leaving
 * those in place beside the seeded tables would show two contradictory answers
 * on one page.
 */
async function seedCompetitionRankings(db: Db): Promise<{
  written: number;
  removed: number;
  skipped: number;
}> {
  let written = 0;
  let removed = 0;
  let skipped = 0;

  // Keyed by sport, because a competition slug is unique per sport rather than
  // globally. Looking one up without the sport would match whichever row came
  // first, which is the kind of bug that only shows up once a second sport has
  // a competition with a similar name.
  const bySport: [string, Record<string, CompetitionRankingSeed[]>][] = [
    ['football', COMPETITION_RANKING_SEEDS],
    ['cricket', CRICKET_COMPETITION_RANKING_SEEDS],
  ];

  for (const [sportSlug, seeds] of bySport) {
    for (const [slug, rankings] of Object.entries(seeds)) {
      const [competition] = await db.execute<{ id: string }>(
        sql`
          SELECT competition.id
          FROM competition
          INNER JOIN sport ON sport.id = competition.sport_id
          WHERE competition.slug = ${slug} AND sport.slug = ${sportSlug}
          LIMIT 1
        `,
      );
      if (!competition) {
        process.stdout.write(`  skipped competition "${slug}": not in the database\n`);
        skipped += 1;
        continue;
      }

      for (const ranking of rankings) {
        const entries = ranking.entries.map((entry) => ({
          rank: entry.rank,
          name: entry.name,
          value: entry.value,
          detail: entry.detail,
        }));

        // The source and the date it was true, because a table of active
        // players' totals is only correct on the day it was read.
        const note = [
          `Compiled from ${ranking.source}, correct as of ${ranking.asOf}.`,
          ranking.caveat,
        ]
          .filter(Boolean)
          .join(' ');

        await db.execute(sql`
          INSERT INTO entity_ranking (
            entity_type, entity_id, kind, label, entries, confidence, note, source_title
          ) VALUES (
            'competition', ${competition.id}, ${ranking.kind}, ${ranking.label},
            ${JSON.stringify(entries)}::jsonb, 'high', ${note}, ${MANUAL_RANKING_SOURCE}
          )
          ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
            label = EXCLUDED.label,
            entries = EXCLUDED.entries,
            confidence = EXCLUDED.confidence,
            note = EXCLUDED.note,
            source_title = EXCLUDED.source_title,
            updated_at = now()
        `);
        written += 1;
      }

      const kinds = rankings.map((ranking) => ranking.kind);
      const stale = await db.execute<{ kind: string }>(sql`
        DELETE FROM entity_ranking
        WHERE entity_type = 'competition'
          AND entity_id = ${competition.id}
          AND kind <> ALL(${sql.raw(pgTextArray(kinds))})
        RETURNING kind
      `);
      for (const row of stale) {
        process.stdout.write(`  removed "${slug}" table ${row.kind}: superseded by the seed\n`);
      }
      removed += stale.length;
    }
  }

  return { written, removed, skipped };
}

/**
 * Publishes the authored sections for flagship entities.
 *
 * Written to `entity_section`, which enrichment never touches, so an ingestion
 * run cannot overwrite a paragraph somebody wrote.
 */
async function seedEntitySections(db: Db): Promise<number> {
  let count = 0;

  const groups: [string, Record<string, (typeof TEAM_SECTIONS)[string]>][] = [
    ['team', TEAM_SECTIONS],
    ['competition', COMPETITION_SECTIONS],
  ];

  for (const [entityType, bySlug] of groups) {
    for (const [slug, sections] of Object.entries(bySlug)) {
      const [row] = await db.execute<{ id: string }>(
        sql`SELECT id FROM ${sql.raw(entityType)} WHERE slug = ${slug} LIMIT 1`,
      );
      if (!row) {
        process.stdout.write(`  skipped ${entityType} "${slug}": not in the database\n`);
        continue;
      }

      for (const section of sections) {
        await db.execute(sql`
          INSERT INTO entity_section (
            entity_type, entity_id, kind, heading, body, status, display_order
          ) VALUES (
            ${entityType}, ${row.id}, ${section.kind}, ${section.heading},
            ${section.body}, 'published', ${section.order}
          )
          ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
            heading = EXCLUDED.heading,
            body = EXCLUDED.body,
            display_order = EXCLUDED.display_order,
            updated_at = now()
        `);
        count += 1;
      }
    }
  }

  return count;
}

/**
 * The football overview: sources, timeline, governance and authored sections.
 *
 * Idempotent throughout. Every write is an upsert on a natural key, so running
 * the seeder twice refreshes content rather than duplicating it, and a source
 * that temporarily returns nothing cannot wipe good rows.
 */
/**
 * Renders a string list as a Postgres text array literal.
 *
 * Drizzle expands a bound JS array into a comma-separated record list, which is
 * right for `VALUES` and wrong for `= ANY (...)`. Building the literal keeps the
 * quoting in one place; every caller passes values this file owns, and the
 * escaping below is what stops a stray quote from breaking the statement.
 */
function pgTextArray(values: string[]): string {
  const escaped = values.map((value) => `'${value.replaceAll("'", "''")}'`);
  return `ARRAY[${escaped.join(', ')}]::text[]`;
}

/**
 * Writes one sport's overview: sources, timeline, governance, formats,
 * concepts, quick facts and prose.
 *
 * Generalised from a football-only function when cricket arrived, because
 * cricket needed the same eight upserts against different rows and a second
 * copy would have been a second place for the pruning logic to drift. The sport
 * slug is a parameter and every statement is scoped by the resolved id.
 *
 * ## Pruning, and the bug this fixes
 *
 * Timeline events and governing bodies are pruned by `sport_id`, so seeding
 * cricket cannot disturb football's rows. Sources are different: `content_source`
 * is shared across sports by design, one row per provider and URL.
 *
 * The football-only version ended by deleting every unreferenced source whose
 * URL was not in *its* seed list. With two sports calling it, that statement
 * deletes the other sport's sources on every run: seed football, and cricket's
 * unreferenced rows go; seed cricket, and football's do. The prune is therefore
 * scoped to sources this call actually owns, and only those left referencing
 * nothing.
 */
async function seedSportOverview(
  db: Db,
  sportSlug: string,
  content: {
    sources: SourceSeed[];
    timeline: TimelineSeed[];
    governance: GoverningBodySeed[];
    sections: SectionSeed[];
    formats?: FormatSeed[];
    concepts?: ConceptSeed[];
    facts?: FactSeed[];
    membership?: MembershipTierSeed[];
    featured?: FeaturedEntitySeed[];
  },
): Promise<{
  sources: number;
  timeline: number;
  bodies: number;
  sections: number;
  formats: number;
  concepts: number;
  facts: number;
}> {
  const empty = {
    sources: 0,
    timeline: 0,
    bodies: 0,
    sections: 0,
    formats: 0,
    concepts: 0,
    facts: 0,
  };

  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
  );
  if (!sportRow) {
    process.stdout.write(`  skipped ${sportSlug} overview: sport not in the database\n`);
    return empty;
  }

  // Sources first: everything below references them.
  const sourceIds = new Map<string, string>();
  for (const source of content.sources) {
    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO content_source (provider, title, url, external_id, license, retrieved_at)
      VALUES (${source.provider}, ${source.title}, ${source.url},
              ${source.externalId ?? null}, ${source.license ?? null}, now())
      ON CONFLICT (provider, url) DO UPDATE SET
        title = EXCLUDED.title,
        external_id = EXCLUDED.external_id,
        license = EXCLUDED.license,
        retrieved_at = now(),
        updated_at = now()
      RETURNING id
    `);
    if (row) sourceIds.set(source.key, row.id);
  }

  let timeline = 0;
  for (const [index, event] of content.timeline.entries()) {
    await db.execute(sql`
      INSERT INTO sport_timeline_event (
        sport_id, year, end_year, title, short_description, category,
        is_major_milestone, certainty, source_id, display_order, status
      ) VALUES (
        ${sportRow.id}, ${event.year}, ${event.endYear ?? null}, ${event.title},
        ${event.shortDescription}, ${event.category},
        ${event.isMajorMilestone ? 'true' : 'false'}, ${event.certainty ?? 'established'},
        ${event.sourceKey ? (sourceIds.get(event.sourceKey) ?? null) : null},
        ${event.order ?? (index + 1) * 10}, 'published'
      )
      ON CONFLICT (sport_id, year, title) DO UPDATE SET
        end_year = EXCLUDED.end_year,
        short_description = EXCLUDED.short_description,
        category = EXCLUDED.category,
        is_major_milestone = EXCLUDED.is_major_milestone,
        certainty = EXCLUDED.certainty,
        source_id = EXCLUDED.source_id,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
    timeline += 1;
  }

  // Re-dating an event changes part of its natural key, so the upsert above
  // writes a new row and leaves the old one behind. Deleting what the seed no
  // longer defines is what makes this genuinely idempotent: without it the
  // timeline only ever grows, and a corrected date shows up twice.
  // Matched on the whole natural key, not the title alone: re-dating an event
  // keeps its title, so a title-only check would find the stale row still
  // "seeded" and leave both copies in place.
  // Separated by a control character rather than NUL: Postgres rejects NUL in
  // text values outright, and a printable separator could occur in a title.
  const seededKeys = content.timeline.map((event) => `${event.year}\u001f${event.title}`);
  await db.execute(sql`
    DELETE FROM sport_timeline_event
    WHERE sport_id = ${sportRow.id}
      AND NOT (year::text || chr(31) || title = ANY (${sql.raw(pgTextArray(seededKeys))}))
  `);

  // Two passes: the world body must exist before a confederation can point at
  // it, and a single pass would leave the first parent reference unresolved.
  const bodyIds = new Map<string, string>();
  let bodies = 0;
  for (const pass of ['world', 'continental'] as const) {
    for (const body of content.governance.filter((entry) => entry.level === pass)) {
      const [row] = await db.execute<{ id: string }>(sql`
        INSERT INTO governing_body (
          sport_id, parent_id, slug, short_name, name, level, region,
          founded_year, member_count, headquarters, website_url, display_order
        ) VALUES (
          ${sportRow.id},
          ${body.parentSlug ? (bodyIds.get(body.parentSlug) ?? null) : null},
          ${body.slug}, ${body.shortName}, ${body.name}, ${body.level},
          ${body.region ?? null}, ${body.foundedYear ?? null}, ${body.memberCount ?? null},
          ${body.headquarters ?? null}, ${body.websiteUrl ?? null}, ${body.order ?? 100}
        )
        ON CONFLICT (sport_id, slug) DO UPDATE SET
          parent_id = EXCLUDED.parent_id,
          name = EXCLUDED.name,
          region = EXCLUDED.region,
          founded_year = EXCLUDED.founded_year,
          member_count = EXCLUDED.member_count,
          headquarters = EXCLUDED.headquarters,
          website_url = EXCLUDED.website_url,
          display_order = EXCLUDED.display_order,
          updated_at = now()
        RETURNING id
      `);
      if (row) bodyIds.set(body.slug, row.id);
      bodies += 1;
    }
  }

  // Membership classes, stored in the same table with a tier set.
  //
  // Not part of the hierarchy: Full Membership is a status the world body
  // grants, not a body sitting beneath it, and the API filters these out of the
  // governance tree. `member_count_as_of` is written from the seed's own date
  // rather than `now()`, because the date that matters is when the figure was
  // read from the governing body, not when the seed last ran.
  //
  // Anchored to UTC midnight rather than cast straight to timestamptz. A bare
  // 'YYYY-MM-DD' going into a timestamptz column is read as midnight in the
  // server's zone and stored as the corresponding UTC instant, so on a server
  // set to Asia/Kolkata '2026-08-23' becomes 2026-08-22T18:30Z and the API,
  // which renders the date by slicing the ISO string, published the day before
  // the one the figure was actually read on. `AT TIME ZONE 'UTC'` makes the
  // stored instant midnight UTC, so the calendar date survives the round trip
  // whatever zone the server happens to run in.
  for (const tier of content.membership ?? []) {
    const [row] = await db.execute<{ id: string }>(sql`
      INSERT INTO governing_body (
        sport_id, parent_id, slug, short_name, name, level, region,
        member_count, member_count_as_of, membership_tier, source_id, display_order
      ) VALUES (
        ${sportRow.id}, ${bodyIds.get(content.governance[0]?.slug ?? '') ?? null},
        ${`membership-${tier.tier}`}, ${tier.label}, ${tier.label}, 'membership',
        ${tier.description}, ${tier.count},
        (${tier.asOf}::date)::timestamp AT TIME ZONE 'UTC', ${tier.tier},
        ${sourceIds.get(tier.sourceKey) ?? null}, ${tier.order}
      )
      ON CONFLICT (sport_id, slug) DO UPDATE SET
        name = EXCLUDED.name,
        region = EXCLUDED.region,
        member_count = EXCLUDED.member_count,
        member_count_as_of = EXCLUDED.member_count_as_of,
        membership_tier = EXCLUDED.membership_tier,
        source_id = EXCLUDED.source_id,
        display_order = EXCLUDED.display_order,
        updated_at = now()
      RETURNING id
    `);
    if (row) bodies += 1;
  }

  const seededSlugs = [
    ...content.governance.map((body) => body.slug),
    ...(content.membership ?? []).map((tier) => `membership-${tier.tier}`),
  ];
  await db.execute(sql`
    DELETE FROM governing_body
    WHERE sport_id = ${sportRow.id}
      AND NOT (slug = ANY (${sql.raw(pgTextArray(seededSlugs))}))
  `);

  // Formats, in two passes for the same parent-before-child reason as above.
  // A format's parent is always declared before it in the seed, so one ordered
  // pass over roots then children resolves every reference.
  const formatIds = new Map<string, string>();
  let formats = 0;
  const formatSeeds = content.formats ?? [];
  for (const pass of [false, true]) {
    for (const format of formatSeeds.filter((entry) => !!entry.parentKey === pass)) {
      const [row] = await db.execute<{ id: string }>(sql`
        INSERT INTO sport_format (
          sport_id, parent_id, key, label, match_class, is_international,
          overs_per_side, innings_per_side, max_days, draw_possible,
          description, conditions_authority, source_id, display_order
        ) VALUES (
          ${sportRow.id},
          ${format.parentKey ? (formatIds.get(format.parentKey) ?? null) : null},
          ${format.key}, ${format.label}, ${format.matchClass},
          ${format.isInternational ?? null}, ${format.oversPerSide ?? null},
          ${format.inningsPerSide ?? null}, ${format.maxDays ?? null},
          ${format.drawPossible ?? null}, ${format.description ?? null},
          ${format.conditionsAuthority ?? null},
          ${format.sourceKey ? (sourceIds.get(format.sourceKey) ?? null) : null},
          ${format.order ?? 100}
        )
        ON CONFLICT (sport_id, key) DO UPDATE SET
          parent_id = EXCLUDED.parent_id,
          label = EXCLUDED.label,
          match_class = EXCLUDED.match_class,
          is_international = EXCLUDED.is_international,
          overs_per_side = EXCLUDED.overs_per_side,
          innings_per_side = EXCLUDED.innings_per_side,
          max_days = EXCLUDED.max_days,
          draw_possible = EXCLUDED.draw_possible,
          description = EXCLUDED.description,
          conditions_authority = EXCLUDED.conditions_authority,
          source_id = EXCLUDED.source_id,
          display_order = EXCLUDED.display_order,
          updated_at = now()
        RETURNING id
      `);
      if (row) formatIds.set(format.key, row.id);
      formats += 1;
    }
  }

  if (formatSeeds.length > 0) {
    await db.execute(sql`
      DELETE FROM sport_format
      WHERE sport_id = ${sportRow.id}
        AND NOT (key = ANY (${sql.raw(pgTextArray(formatSeeds.map((entry) => entry.key)))}))
    `);
  }

  let concepts = 0;
  const conceptSeeds = content.concepts ?? [];
  for (const concept of conceptSeeds) {
    await db.execute(sql`
      INSERT INTO sport_concept (
        sport_id, key, term, summary, category, ambiguity_note,
        explainer_slug, source_id, display_order
      ) VALUES (
        ${sportRow.id}, ${concept.key}, ${concept.term}, ${concept.summary},
        ${concept.category}, ${concept.ambiguityNote ?? null},
        ${concept.explainerSlug ?? null},
        ${concept.sourceKey ? (sourceIds.get(concept.sourceKey) ?? null) : null},
        ${concept.order ?? 100}
      )
      ON CONFLICT (sport_id, key) DO UPDATE SET
        term = EXCLUDED.term,
        summary = EXCLUDED.summary,
        category = EXCLUDED.category,
        ambiguity_note = EXCLUDED.ambiguity_note,
        explainer_slug = EXCLUDED.explainer_slug,
        source_id = EXCLUDED.source_id,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
    concepts += 1;
  }

  if (conceptSeeds.length > 0) {
    await db.execute(sql`
      DELETE FROM sport_concept
      WHERE sport_id = ${sportRow.id}
        AND NOT (key = ANY (${sql.raw(pgTextArray(conceptSeeds.map((entry) => entry.key)))}))
    `);
  }

  /*
   * Curated quick facts.
   *
   * These replace, rather than supplement, whatever Wikipedia's infobox
   * ingestion left behind. For cricket that was seven fragments including "16th
   * century; South East England" as an origin, "Cricket field" as a venue and a
   * bare "1900, 2028" for Olympic status.
   *
   * The delete clears *every* sport-level fact, not merely the keys being
   * rewritten, and that is deliberate. A first pass deleted only the curated
   * keys, which left five ingested fragments in place under keys the curated
   * set does not use: `first_played` survived beside the more careful
   * `first_recorded`, and `team_members` beside `players_per_side`, so the panel
   * showed the same fact twice, once well and once badly. Taking the whole set
   * makes the seed the single authority for a sport's quick facts.
   *
   * Sport-level only. `entity_fact` also holds team, person and competition
   * facts, and those are ingested rather than authored; the predicate is scoped
   * by `entity_type` and `entity_id` so none of them is touched.
   *
   * Written with source `curated`, which marks them as not-for-overwrite by a
   * later ingestion run.
   */
  let facts = 0;
  const factSeeds = content.facts ?? [];
  if (factSeeds.length > 0) {
    await db.execute(sql`
      DELETE FROM entity_fact
      WHERE entity_type = 'sport' AND entity_id = ${sportRow.id}
    `);

    for (const fact of factSeeds) {
      await db.execute(sql`
        INSERT INTO entity_fact (
          entity_type, entity_id, key, label, value, category, source, display_order
        ) VALUES (
          'sport', ${sportRow.id}, ${fact.key}, ${fact.label}, ${fact.value},
          ${fact.category}, 'curated', ${fact.order ?? 100}
        )
        ON CONFLICT (entity_type, entity_id, key, value) DO UPDATE SET
          label = EXCLUDED.label,
          category = EXCLUDED.category,
          source = EXCLUDED.source,
          display_order = EXCLUDED.display_order,
          updated_at = now()
      `);
      facts += 1;
    }
  }

  let sections = 0;
  for (const section of content.sections) {
    await db.execute(sql`
      INSERT INTO entity_section (
        entity_type, entity_id, kind, heading, body, status, display_order
      ) VALUES (
        'sport', ${sportRow.id}, ${section.kind}, ${section.heading},
        ${section.body}, 'published', ${section.order}
      )
      ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
        heading = EXCLUDED.heading,
        body = EXCLUDED.body,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
    sections += 1;
  }

  /*
   * Featured entities.
   *
   * Each card names a canonical row by slug, and the lookup is allowed to fail.
   * Entity coverage is ingested and uneven, so a card whose entity is missing
   * is written with a null `entity_id` and renders without a link rather than
   * disappearing. Dropping it instead would let an ingestion gap silently edit
   * an editorial list, which is the opposite of what the seed is for.
   *
   * People are keyed on `primary_sport_id`; teams and competitions on
   * `sport_id`. That asymmetry is in the schema, not here: a person can appear
   * in more than one sport and a club cannot.
   */
  const featuredSeeds = content.featured ?? [];
  let unresolved = 0;
  for (const entry of featuredSeeds) {
    let entityId: string | null = null;

    if (entry.slug) {
      const [row] = await db.execute<{ id: string }>(
        entry.entityType === 'person'
          ? sql`SELECT id FROM person WHERE primary_sport_id = ${sportRow.id} AND slug = ${entry.slug} LIMIT 1`
          : entry.entityType === 'team'
            ? sql`SELECT id FROM team WHERE sport_id = ${sportRow.id} AND slug = ${entry.slug} LIMIT 1`
            : sql`SELECT id FROM competition WHERE sport_id = ${sportRow.id} AND slug = ${entry.slug} LIMIT 1`,
      );
      entityId = row?.id ?? null;
    }
    if (!entityId) unresolved += 1;

    await db.execute(sql`
      INSERT INTO overview_entity_ref (
        sport_id, section, entity_type, entity_id, entity_slug,
        display_name, blurb, meta, display_order
      ) VALUES (
        ${sportRow.id}, ${entry.section}, ${entry.entityType}, ${entityId},
        ${entry.slug ?? null}, ${entry.name}, ${entry.blurb ?? null},
        ${entry.meta ?? null}, ${entry.order}
      )
      ON CONFLICT (sport_id, section, display_name) DO UPDATE SET
        entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        entity_slug = EXCLUDED.entity_slug,
        blurb = EXCLUDED.blurb,
        meta = EXCLUDED.meta,
        display_order = EXCLUDED.display_order,
        updated_at = now()
    `);
  }

  if (featuredSeeds.length > 0) {
    await db.execute(sql`
      DELETE FROM overview_entity_ref
      WHERE sport_id = ${sportRow.id}
        AND NOT (display_name = ANY (${sql.raw(pgTextArray(featuredSeeds.map((e) => e.name)))}))
    `);
    // Reported rather than silent: an unresolved card is a real gap in the
    // entity tables, and the number is how anybody would notice it grew.
    if (unresolved > 0) {
      process.stdout.write(
        `  ${sportSlug}: ${unresolved} of ${featuredSeeds.length} featured entities have no canonical row yet\n`,
      );
    }
  }

  // Sources are shared across sports, so this prunes only rows this call owns
  // and that nothing references any more. Scoping by URL is what stops seeding
  // one sport from deleting another's citations, which is what the earlier
  // football-only version did once a second sport existed.
  await db.execute(sql`
    DELETE FROM content_source cs
    WHERE cs.url = ANY (${sql.raw(pgTextArray(content.sources.map((source) => source.url)))})
      AND NOT EXISTS (SELECT 1 FROM sport_timeline_event e WHERE e.source_id = cs.id)
      AND NOT EXISTS (SELECT 1 FROM governing_body g WHERE g.source_id = cs.id)
      AND NOT EXISTS (SELECT 1 FROM sport_format f WHERE f.source_id = cs.id)
      AND NOT EXISTS (SELECT 1 FROM sport_concept c WHERE c.source_id = cs.id)
  `);

  return { sources: sourceIds.size, timeline, bodies, sections, formats, concepts, facts };
}

void main();

/**
 * Applies a sport's curated competition list, and removes everything not on it.
 *
 * Takes the sport and its list as arguments rather than naming football, so
 * cricket reuses the same upsert, mapping and prune logic. That mattered:
 * cricket's tab was missing every international tournament and had English club
 * leagues filed as international, which is the same pair of defects this
 * function was written to fix for football.
 *
 * Three steps, in order. Competitions on the list are upserted with their
 * curated `kind`, `tier`, `notability` and corrected names; the ones marked
 * `create` are inserted because they were missing from the database entirely.
 * Everything else in the sport is then deleted.
 *
 * The delete is the reason this runs as one statement set rather than three
 * commands: a curated row that failed to insert must not be followed by a
 * delete that removes its unfixed predecessor, leaving the competition absent
 * altogether.
 *
 * Curated columns are added to `lockedFields` so the next crawl cannot undo
 * this. Ingestion already honours that array for teams, and without it a run
 * would reset `kind` to its country-derived guess and flatten `tier` back to
 * the default that caused the original ordering problem.
 */
async function seedCuratedCompetitions(
  db: Db,
  sportSlug: string,
  curated: CuratedCompetition[],
  curatedSlugs: ReadonlySet<string>,
): Promise<{ updated: number; created: number; deleted: number }> {
  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = ${sportSlug} LIMIT 1`,
  );
  if (!sportRow) {
    process.stdout.write(`  skipped competitions: no ${sportSlug} sport row\n`);
    return { updated: 0, created: 0, deleted: 0 };
  }

  const sportId = sportRow.id;
  let updated = 0;
  let created = 0;
  const curatedLogos = new Map<string, string>();

  // The fields this file is authoritative on. Anything else about a
  // competition stays ingestion's to fill.
  const locked = ['kind', 'tier', 'notability', 'name', 'country', 'format'];
  // `logo_url` is locked only for the entries that set one, so the backfill
  // stays free to fill the rest.
  const lockedWithLogo = [...locked, 'logo_url'];

  for (const entry of curated) {
    const rows = await db.execute<{ id: string }>(
      sql`INSERT INTO competition (
            sport_id, slug, name, kind, format, country,
            founded_year, tier, notability, confidence, locked_fields
          )
          VALUES (
            ${sportId}, ${entry.slug}, ${entry.name ?? entry.slug},
            ${entry.kind}::competition_kind, ${entry.format}::competition_format,
            ${entry.country}, ${entry.foundedYear ?? null},
            ${entry.tier}, ${entry.notability}, 'curated',
            ${sql.raw(pgTextArray(entry.logoFile ? lockedWithLogo : locked))}
          )
          ON CONFLICT (sport_id, slug) DO UPDATE SET
            name = COALESCE(${entry.name ?? null}, competition.name),
            kind = ${entry.kind}::competition_kind,
            format = ${entry.format}::competition_format,
            country = ${entry.country},
            founded_year = COALESCE(${entry.foundedYear ?? null}, competition.founded_year),
            tier = ${entry.tier},
            notability = ${entry.notability},
            confidence = 'curated',
            locked_fields = ${sql.raw(pgTextArray(entry.logoFile ? lockedWithLogo : locked))},
            updated_at = now()
          RETURNING (xmax = 0) AS id`,
    );

    // Postgres reports an insert as xmax = 0, which separates a created row
    // from an updated one without a second query.
    if (rows[0] && (rows[0] as unknown as { id: boolean }).id) created += 1;
    else updated += 1;

    // Enrichment reaches a competition only through its Wikidata mapping, so a
    // created row without one can never gain facts or an `about` paragraph
    // however often a crawl runs. The conflict target is the provider's own
    // key, which is what makes a re-run cheap; the `entity_id` update is what
    // repoints Serie A away from the Lega Serie A entity it was mapped to.
    if (entry.wikidata) {
      const [row] = await db.execute<{ id: string }>(
        sql`SELECT id FROM competition
            WHERE sport_id = ${sportId} AND slug = ${entry.slug} LIMIT 1`,
      );
      if (row) {
        await db.execute(
          sql`INSERT INTO external_mapping (
                provider, entity_type, external_id, entity_id,
                match_method, match_confidence
              )
              VALUES (
                'wikidata', 'competition', ${entry.wikidata}, ${row.id}, 'manual', 1
              )
              ON CONFLICT (provider, entity_type, external_id) DO UPDATE SET
                entity_id = EXCLUDED.entity_id`,
        );
      }
    }

    if (entry.logoFile) curatedLogos.set(entry.slug, `File:${entry.logoFile}`);
  }

  // Curated logos, resolved in one batch.
  //
  // Only for the competitions whose article carries no logo in a field the
  // backfill reads, which is why this is a short list rather than the whole
  // catalogue. Resolved through the same client the backfill uses so the
  // filename normalisation it handles — underscores, percent escapes and
  // typographic apostrophes — applies here too. The Cricket World Cup's file
  // name contains a curly apostrophe, and a hand-built URL got it wrong.
  if (curatedLogos.size > 0) {
    const client = new WikipediaClient();
    const resolved = await client.fetchThumbnails([...curatedLogos.values()], 512);

    for (const [slug, file] of curatedLogos) {
      const url = resolved.get(file);
      if (!url) {
        process.stdout.write(`  logo unresolved for ${slug}: ${file}\n`);
        continue;
      }
      await db.execute(
        sql`UPDATE competition SET logo_url = ${url}, updated_at = now()
            WHERE sport_id = ${sportId} AND slug = ${slug}`,
      );
    }
  }

  const slugs = [...curatedSlugs];
  const removed = await db.execute<{ id: string }>(
    sql`DELETE FROM competition
        WHERE sport_id = ${sportId} AND slug <> ALL(${sql.raw(pgTextArray(slugs))})
        RETURNING id`,
  );

  return { updated, created, deleted: removed.length };
}

/**
 * Merges hand-entered results into the crawled award and honour tables.
 *
 * Wikidata's coverage of these lags and, for the roll of honour, is padded with
 * editions that are not tournaments, so the most recent results are missing and
 * the coverage note undercounts itself. Rather than replacing every table, each
 * seeded result is merged into the existing entry list for its `kind` and the
 * whole list re-ranked, which keeps the older editions coming from the source.
 * A `kind` named in `replaceKinds` is rebuilt from the seed alone, for the case
 * where the crawled list is wrong rather than merely short.
 *
 * Idempotent: a result already present for an edition is replaced rather than
 * added again, so a repeat run does not accumulate duplicates.
 */
async function seedCompetitionAwards(db: Db): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;

  type Entry = { rank: number; name: string; value: number | null; detail: string | null };

  for (const group of FOOTBALL_SEEDED_AWARDS) {
    const [competition] = await db.execute<{ id: string }>(
      sql`SELECT c.id FROM competition c
          JOIN sport s ON s.id = c.sport_id AND s.slug = 'football'
          WHERE c.slug = ${group.competitionSlug} LIMIT 1`,
    );

    if (!competition) {
      process.stdout.write(`  skipped ${group.competitionSlug}: not in the database\n`);
      skipped += group.awards.length;
      continue;
    }

    // Grouped by table, so each one is written once with all of its seeded
    // rows rather than once per row. Writing per row would re-read and re-rank
    // the same table dozens of times and leave its note naming one edition.
    const byKind = new Map<string, typeof group.awards>();
    for (const entry of group.awards) {
      byKind.set(entry.kind, [...(byKind.get(entry.kind) ?? []), entry]);
    }

    for (const [kind, seeded] of byKind) {
      const replace = group.replaceKinds?.includes(kind) ?? false;

      const [existing] = replace
        ? []
        : await db.execute<{ entries: unknown }>(
            sql`SELECT entries FROM entity_ranking
                WHERE entity_type = 'competition'
                  AND entity_id = ${competition.id}
                  AND kind = ${kind}
                LIMIT 1`,
          );

      const seededYears = new Set(seeded.map((entry) => String(entry.year)));
      const carried = ((existing?.entries as Entry[] | undefined) ?? []).filter(
        // Dropped so a re-run replaces rather than appends, and so a seeded
        // edition wins over the crawled one it corrects.
        (entry) => !seededYears.has(String(entry.detail)),
      );

      const merged = [
        ...carried,
        ...seeded.map((entry) => ({
          rank: 0,
          name: entry.winner,
          value: entry.value ?? entry.year,
          detail: String(entry.year),
        })),
      ]
        // Newest first, matching how enrichment orders these tables.
        .sort((a, b) => Number(b.detail ?? 0) - Number(a.detail ?? 0))
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      const label = seeded[0]!.label;
      const note = `${merged.length} editions, compiled from ${group.source}`;

      await db.execute(
        sql`INSERT INTO entity_ranking (
              entity_type, entity_id, kind, label, entries, confidence, note, source_title
            )
            VALUES (
              'competition', ${competition.id}, ${kind}, ${label},
              ${JSON.stringify(merged)}::jsonb, 'high', ${note}, ${MANUAL_RANKING_SOURCE}
            )
            ON CONFLICT (entity_type, entity_id, kind) DO UPDATE SET
              label = EXCLUDED.label,
              entries = EXCLUDED.entries,
              confidence = 'high',
              note = EXCLUDED.note,
              source_title = EXCLUDED.source_title,
              updated_at = now()`,
      );
      written += seeded.length;
    }
  }

  return { written, skipped };
}
