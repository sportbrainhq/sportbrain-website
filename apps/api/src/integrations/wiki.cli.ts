/**
 * Wikipedia ingestion.
 *
 * ```bash
 * pnpm --filter @sportbrain/api wiki map teams football 500
 * pnpm --filter @sportbrain/api wiki facts teams football 200
 * pnpm --filter @sportbrain/api wiki crests football 300
 * pnpm --filter @sportbrain/api wiki crests all 3000 overwrite
 * pnpm --filter @sportbrain/api wiki logos football 60
 * pnpm --filter @sportbrain/api wiki rankings football 60
 * pnpm --filter @sportbrain/api wiki cricket-stats 300
 * pnpm --filter @sportbrain/api wiki careers 300
 * pnpm --filter @sportbrain/api wiki career-totals 400
 * pnpm --filter @sportbrain/api wiki scan-totals 100
 * pnpm --filter @sportbrain/api wiki titles 150
 * pnpm --filter @sportbrain/api wiki all football 200
 * ```
 *
 * `map` must run before anything else for a given entity type: it resolves
 * Wikipedia titles from the Wikidata identifiers already held, and every other
 * command reads those titles.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import type { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { InMemoryCacheService } from '../infrastructure/cache/cache.service';
import { WikipediaIngestionService } from './ingestion/wikipedia-ingestion.service';
import { WikipediaClient } from './providers/wikipedia/wikipedia.client';
import { WikipediaProvider } from './providers/wikipedia/wikipedia.provider';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    process.stderr.write(
      'Usage: wiki <map|facts|crests|logos|rankings|cricket-team-rankings|cricket-stats|cricket-careers|tennis-careers|golf-careers|basketball-stats|basketball-leaders|basketball-highlights|competition-about|nba-tables|basketball-competition-tables|careers|career-totals|scan-totals|titles|nfl-titles|qb-passing|rb-rushing|receiver-stats|defender-stats|nfl-careers|nfl-positions|mma-records|mma-titles|mma-title-bouts|mma-current-champions|all> [entityType] [sport] [limit]\n',
    );
    process.exitCode = 1;
    return;
  }

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const database = { db: drizzle(client, { schema }) } as unknown as DatabaseService;
  // A no-op cache, deliberately. This CLI is its own process, so the running
  // API's in-memory cache is not reachable from here and clearing a local one
  // would be theatre. The web revalidation call below is what makes the change
  // visible; an API served from a long-lived process still needs restarting or
  // its own invalidation endpoint, which is why the cache TTLs are short.
  const cache = new InMemoryCacheService();
  const ingestion = new WikipediaIngestionService(
    database,
    new WikipediaProvider(new WikipediaClient()),
    cache,
  );

  const startedAt = Date.now();

  try {
    switch (command) {
      case 'map': {
        const [entityType, sport, limit] = args;
        const mapped = await ingestion.mapTitles(
          (entityType ?? 'team') as 'team',
          sport === 'all' ? null : (sport ?? null),
          Number(limit ?? 500),
        );
        process.stdout.write(`Mapped ${mapped} Wikipedia titles\n`);
        break;
      }

      case 'facts': {
        const [entityType, sport, limit, slug] = args;
        const result = await ingestion.ingestFacts(
          (entityType ?? 'team') as 'team',
          sport === 'all' ? null : (sport ?? null),
          Number(limit ?? 100),
          // A fourth argument names one entity. Needed because the default
          // ordering is by honours held, and an entity whose honours are
          // recorded against a differently named article sorts last however
          // high the limit goes: FC Barcelona fell outside the top 400 clubs.
          slug,
        );
        process.stdout.write(`${result.entities} entities, ${result.facts} facts\n`);
        break;
      }

      case 'rankings': {
        const [sport, limit] = args;
        const result = await ingestion.ingestTeamRankings(sport ?? 'football', Number(limit ?? 40));
        process.stdout.write(`${result.teams} teams, ${result.rankings} tables\n`);
        break;
      }

      case 'crests': {
        const [sport, limit, mode] = args;
        const result = await ingestion.ingestTeamCrests(
          sport === 'all' ? null : (sport ?? 'football'),
          Number(limit ?? 200),
          mode === 'overwrite',
        );
        process.stdout.write(
          `${result.examined} scanned, ${result.resolved} crests, ${result.written} teams updated\n`,
        );
        break;
      }

      case 'logos': {
        const [sport, limit, mode] = args;
        const result = await ingestion.ingestCompetitionLogos(
          sport === 'all' ? null : (sport ?? 'football'),
          Number(limit ?? 200),
          mode === 'overwrite',
        );
        process.stdout.write(
          `${result.examined} scanned, ${result.resolved} logos, ${result.written} competitions updated\n`,
        );
        break;
      }

      /**
       * Basketball teams' all-time points, rebounds and assists leaders.
       *
       * Reads "{Team} all-time roster", the only source that attributes career
       * totals to a team rather than to a whole career.
       */
      /** Basketball players' career highlights, as the sport summarises them. */
      /** Lead prose into `about`, for competitions that have none. */
      case 'competition-about': {
        const [sport, limit] = args;
        const result = await ingestion.ingestCompetitionAbout(
          sport === 'all' ? null : (sport ?? 'basketball'),
          Number(limit ?? 50),
        );
        process.stdout.write(
          `${result.examined} examined, ${result.written} written, ${result.skipped} skipped\n`,
        );
        break;
      }

      /** The NBA's roll of honour, award rolls and career leader boards. */
      /** The same tables for basketball's other competitions. */
      case 'basketball-competition-tables': {
        const results = await ingestion.ingestBasketballCompetitionTables();
        for (const entry of results) {
          process.stdout.write(`  ${entry.slug.padEnd(28)} ${entry.written} tables\n`);
        }
        break;
      }

      case 'nba-tables': {
        const result = await ingestion.ingestNbaCompetitionTables();
        process.stdout.write(`${result.written} tables written, ${result.skipped} missing\n`);
        break;
      }

      case 'basketball-highlights': {
        const result = await ingestion.ingestBasketballHighlights(Number(args[0] ?? 200));
        process.stdout.write(
          `${result.examined} players examined, ${result.written} with highlights, ` +
            `${result.skipped} without\n`,
        );
        break;
      }

      case 'basketball-leaders': {
        const result = await ingestion.ingestBasketballTeamLeaders(Number(args[0] ?? 60));
        process.stdout.write(
          `${result.examined} teams examined, ${result.written} tables written, ` +
            `${result.skipped} without a readable roster article\n`,
        );
        break;
      }

      case 'basketball-stats': {
        const result = await ingestion.ingestBasketballStats(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.blocks} stat blocks\n`);
        break;
      }

      /**
       * Cricket sides' per-format leaderboards.
       *
       * Separate from `rankings`, which is football-shaped: two tables a team,
       * appearances and goals. Cricket has up to nine, because matches, runs
       * and wickets each mean something different in Test, ODI and T20I
       * cricket and must never be merged.
       */
      case 'cricket-team-rankings': {
        const result = await ingestion.ingestCricketTeamRankings(Number(args[0] ?? 40));
        process.stdout.write(
          `${result.teams} teams, ${result.rankings} tables, ${result.skipped} with no parseable source\n`,
        );
        break;
      }

      /**
       * A cricketer's playing span, and the Active or Retired badge with it.
       *
       * Separate from `cricket-stats` because it reads different fields and is
       * worth re-running on its own: an active player's status changes when
       * they retire, and their statistics do not.
       */
      case 'cricket-careers': {
        // An optional slug, so one wrong page can be corrected in seconds
        // rather than behind a crawl of seven thousand articles.
        const result = await ingestion.ingestCricketCareerSpans(Number(args[0] ?? 200), args[1]);
        process.stdout.write(
          `${result.players} players, ${result.active} active, ${result.retired} retired\n`,
        );
        break;
      }

      /**
       * A tennis player's titles, career span, status and playing attributes.
       *
       * The single command tennis needs, because one infobox carries all of it
       * and fetching the page four times to read four fields would be four
       * times the requests for no gain. See `ingestTennisCareers` for why
       * tennis needs a command of its own at all: it has no clubs, so none of
       * the pipeline's club-based derivations produce anything for it.
       */
      case 'tennis-careers': {
        const result = await ingestion.ingestTennisCareers(Number(args[0] ?? 200), args[1]);
        process.stdout.write(
          `${result.players} players, ${result.titles} titles, ` +
            `${result.active} active, ${result.retired} retired\n`,
        );
        break;
      }

      /**
       * A golfer's majors, career record, status and attributes.
       *
       * The golf counterpart of `tennis-careers`, and needed for the same
       * reason: golf has no clubs, so none of the pipeline's club-based
       * derivations produce anything for it. One infobox carries the majors,
       * the win counts by tour and the career span, so one command reads them
       * all rather than fetching the page three times.
       */
      case 'golf-careers': {
        const result = await ingestion.ingestGolfCareers(Number(args[0] ?? 200), args[1]);
        process.stdout.write(
          `${result.players} players, ${result.majors} majors, ` +
            `${result.active} active, ${result.retired} retired\n`,
        );
        break;
      }

      case 'cricket-stats': {
        const result = await ingestion.ingestCricketStats(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.blocks} stat blocks\n`);
        break;
      }

      /**
       * Football's three headline tiles: appearances, goals, trophies.
       *
       * Football only, matching the registry. Other sports count a career in
       * their own terms and get their own command when their data is done.
       */
      case 'career-totals': {
        const result = await ingestion.ingestFootballCareerTotals(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players examined, ${result.written} written\n`);
        break;
      }

      /**
       * Reads the headline numbers for the most notable footballers and prints
       * them, writing nothing.
       *
       * For checking the three tiles against the articles before a run, which
       * is how the zero-trophy players were found.
       */
      case 'scan-totals': {
        const rows = await ingestion.scanFootballCareerTotals(Number(args[0] ?? 100));

        const flagged = rows.filter((row) => row.warnings.length > 0);

        for (const row of rows) {
          process.stdout.write(
            `${row.name.slice(0, 26).padEnd(27)}` +
              `${String(row.games ?? '-').padStart(6)}` +
              `${String(row.goals ?? '-').padStart(6)}` +
              `${String(row.trophies ?? '-').padStart(6)}` +
              `${row.warnings.length > 0 ? `  ${row.warnings.join(', ')}` : ''}\n`,
          );
        }

        process.stdout.write(`\n${rows.length} scanned, ${flagged.length} flagged for review\n`);
        break;
      }

      /**
       * Football clubs' title counts, read from their honours tables.
       */
      case 'titles': {
        const result = await ingestion.ingestFootballTitles(Number(args[0] ?? 150));
        process.stdout.write(`${result.teams} teams examined, ${result.written} written\n`);
        break;
      }

      case 'careers': {
        const result = await ingestion.ingestFootballCareers(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.spells} club spells\n`);
        break;
      }

      /**
       * NFL teams' championship counts and Super Bowl-winning seasons, read
       * from `Infobox NFL team` rather than an honours table.
       */
      case 'nfl-titles': {
        const result = await ingestion.ingestNflTeamTitles(Number(args[0] ?? 40));
        process.stdout.write(`${result.teams} teams examined, ${result.written} written\n`);
        break;
      }

      /**
       * Career totals for the four position groups American football's
       * season table can be read for, each from its own column group rather
       * than an assumed position. See `fetchCareerColumnGroup` on
       * `WikipediaProvider` for the table-reading rules shared by all four.
       */
      case 'qb-passing': {
        const result = await ingestion.ingestQuarterbackCareerPassing(Number(args[0] ?? 60));
        process.stdout.write(
          `${result.players} quarterbacks examined, ${result.written} written\n`,
        );
        break;
      }

      case 'rb-rushing': {
        const result = await ingestion.ingestRunningBackCareerTotals(Number(args[0] ?? 60));
        process.stdout.write(
          `${result.players} running backs examined, ${result.written} written\n`,
        );
        break;
      }

      case 'receiver-stats': {
        const result = await ingestion.ingestReceiverCareerTotals(Number(args[0] ?? 60));
        process.stdout.write(`${result.players} receivers examined, ${result.written} written\n`);
        break;
      }

      case 'defender-stats': {
        const result = await ingestion.ingestDefenderCareerTotals(Number(args[0] ?? 60));
        process.stdout.write(`${result.players} defenders examined, ${result.written} written\n`);
        break;
      }

      /**
       * Gridiron players' club histories, from `pastteams` rather than
       * Wikidata's undated memberships. See `fetchGridironTeamSpells` and
       * `ingestGridironTeamHistory` for why.
       */
      case 'nfl-careers': {
        const result = await ingestion.ingestGridironTeamHistory(Number(args[0] ?? 150));
        process.stdout.write(
          `${result.players} players examined, ${result.written} spells written\n`,
        );
        break;
      }

      /**
       * Gridiron players' position and current team, from each player's own
       * infobox rather than Wikidata's unscoped `P413`. See
       * `fetchGridironPlayerAttributes` and `ingestGridironPlayerAttributes`
       * for why.
       */
      case 'nfl-positions': {
        const result = await ingestion.ingestGridironPlayerAttributes(Number(args[0] ?? 150));
        process.stdout.write(`${result.players} players examined, ${result.written} written\n`);
        break;
      }

      /**
       * MMA fighters' win/loss/draw records, from `Infobox martial artist`.
       * See `fetchMmaRecord` and `ingestMmaRecords` for why.
       */
      case 'mma-records': {
        const result = await ingestion.ingestMmaRecords(Number(args[0] ?? 150));
        process.stdout.write(`${result.players} fighters examined, ${result.written} written\n`);
        break;
      }

      /**
       * MMA fighters' title reigns. See `fetchMmaTitles` and
       * `ingestMmaTitles` for why.
       */
      case 'mma-titles': {
        const result = await ingestion.ingestMmaTitles(Number(args[0] ?? 150));
        process.stdout.write(`${result.players} fighters examined, ${result.written} written\n`);
        break;
      }

      /**
       * MMA fighters' UFC title-fight bouts, win or loss. See
       * `fetchMmaTitleBouts` and `ingestMmaTitleBouts` for why this is a
       * different count from `mma-titles`, which only sees reigns won.
       */
      case 'mma-title-bouts': {
        const result = await ingestion.ingestMmaTitleBouts(Number(args[0] ?? 150));
        process.stdout.write(`${result.players} fighters examined, ${result.written} written\n`);
        break;
      }

      /**
       * The UFC's current champion per weight class. See
       * `fetchMmaCurrentUfcTitles` and `ingestMmaCurrentChampions` for why
       * this needs its own pass rather than reusing `mma-titles`' reign data.
       */
      case 'mma-current-champions': {
        const result = await ingestion.ingestMmaCurrentChampions();
        process.stdout.write(
          `${result.players} former/current title holders checked, ${result.written} written\n`,
        );
        break;
      }

      /**
       * The full pipeline for one sport, in dependency order.
       *
       * Titles first, because nothing else can run without them, then the four
       * layers outward from the sport itself.
       */
      case 'all': {
        const [sport, limit] = args;
        const sportSlug = sport ?? 'football';
        const cap = Number(limit ?? 150);

        for (const entityType of ['sport', 'competition', 'team', 'person'] as const) {
          const mapped = await ingestion.mapTitles(
            entityType,
            entityType === 'sport' ? null : sportSlug,
            1_000,
          );
          const result = await ingestion.ingestFacts(
            entityType,
            entityType === 'sport' ? null : sportSlug,
            cap,
          );
          process.stdout.write(
            `  ${entityType.padEnd(12)} mapped ${String(mapped).padStart(4)}  ` +
              `${String(result.entities).padStart(4)} entities  ${result.facts} facts\n`,
          );
        }

        const crests = await ingestion.ingestTeamCrests(sportSlug, cap);
        process.stdout.write(
          `  crests       ${crests.written} teams updated from ${crests.resolved} files\n`,
        );

        const logos = await ingestion.ingestCompetitionLogos(sportSlug, cap);
        process.stdout.write(
          `  logos        ${logos.written} competitions updated from ${logos.resolved} files\n`,
        );

        const rankings = await ingestion.ingestTeamRankings(sportSlug, Math.min(cap, 60));
        process.stdout.write(
          `  rankings     ${rankings.teams} teams, ${rankings.rankings} tables\n`,
        );

        if (sportSlug === 'cricket') {
          const stats = await ingestion.ingestCricketStats(cap);
          process.stdout.write(`  stats        ${stats.players} players, ${stats.blocks} blocks\n`);
        }

        if (sportSlug === 'basketball') {
          const stats = await ingestion.ingestBasketballStats(cap);
          process.stdout.write(`  stats        ${stats.players} players, ${stats.blocks} blocks\n`);
        }

        if (sportSlug === 'football') {
          const careers = await ingestion.ingestFootballCareers(cap);
          process.stdout.write(
            `  careers      ${careers.players} players, ${careers.spells} spells\n`,
          );

          // Last, because the trophy count reads the honours the fact passes
          // above have just written.
          const totals = await ingestion.ingestFootballCareerTotals(cap);
          process.stdout.write(
            `  headline     ${totals.written}/${totals.players} players with career totals\n`,
          );
        }
        break;
      }

      default:
        throw new Error(`Unknown command "${command}"`);
    }

    process.stdout.write(`Done in ${((Date.now() - startedAt) / 1_000).toFixed(1)}s\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
