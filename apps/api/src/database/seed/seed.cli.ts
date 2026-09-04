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
  TENNIS_CONCEPTS,
  TENNIS_FACTS,
  TENNIS_FEATURED,
  TENNIS_FORMATS,
  TENNIS_GOVERNANCE,
  TENNIS_SECTIONS,
  TENNIS_SOURCES,
  TENNIS_TIMELINE,
} from './tennis-overview';
import {
  GOLF_CONCEPTS,
  GOLF_FACTS,
  GOLF_FEATURED,
  GOLF_FORMATS,
  GOLF_GOVERNANCE,
  GOLF_SECTIONS,
  GOLF_SOURCES,
  GOLF_TIMELINE,
} from './golf-overview';
import {
  AMERICAN_FOOTBALL_CONCEPTS,
  AMERICAN_FOOTBALL_FACTS,
  AMERICAN_FOOTBALL_FEATURED,
  AMERICAN_FOOTBALL_FORMATS,
  AMERICAN_FOOTBALL_GOVERNANCE,
  AMERICAN_FOOTBALL_SECTIONS,
  AMERICAN_FOOTBALL_SOURCES,
  AMERICAN_FOOTBALL_TIMELINE,
} from './american-football-overview';
import {
  MMA_CONCEPTS,
  MMA_FACTS,
  MMA_FEATURED,
  MMA_FORMATS,
  MMA_GOVERNANCE,
  MMA_SECTIONS,
  MMA_SOURCES,
  MMA_TIMELINE,
} from './mma-overview';
import {
  BOXING_CONCEPTS,
  BOXING_FACTS,
  BOXING_FEATURED,
  BOXING_FORMATS,
  BOXING_GOVERNANCE,
  BOXING_SECTIONS,
  BOXING_SOURCES,
  BOXING_TIMELINE,
} from './boxing-overview';
import {
  FORMULA_ONE_CONCEPTS,
  FORMULA_ONE_FACTS,
  FORMULA_ONE_FEATURED,
  FORMULA_ONE_FORMATS,
  FORMULA_ONE_GOVERNANCE,
  FORMULA_ONE_SECTIONS,
  FORMULA_ONE_SOURCES,
  FORMULA_ONE_TIMELINE,
} from './formula-one-overview';
import {
  FOOTBALL_EXPLAINER_CATEGORIES,
  FOOTBALL_EXPLAINER_TOPICS,
} from './football-explainer-taxonomy';
import { FOOTBALL_EXPLAINERS, FOOTBALL_EXPLAINER_SOURCES } from './football-explainers';
import { FOOTBALL_SEEDED_AWARDS } from './football-competition-awards';
import { WikipediaClient } from '../../integrations/providers/wikipedia/wikipedia.client';
import { CRICKET_COMPETITION_RANKING_SEEDS } from './cricket-competition-rankings';
import { TENNIS_COMPETITION_RANKING_SEEDS } from './tennis-competition-rankings';
import { GOLF_COMPETITION_RANKINGS } from './golf-competition-rankings';
import { AMERICAN_FOOTBALL_COMPETITION_RANKINGS } from './american-football-competition-rankings';
import {
  BASKETBALL_CURATED_COMPETITIONS,
  BASKETBALL_CURATED_SLUGS,
} from './basketball-competitions';
import { TENNIS_CURATED_COMPETITIONS, TENNIS_CURATED_SLUGS } from './tennis-competitions';
import { BOXING_CURATED_COMPETITIONS, BOXING_CURATED_SLUGS } from './boxing-competitions';
import { GOLF_CURATED_COMPETITIONS, GOLF_CURATED_SLUGS } from './golf-competitions';
import {
  AMERICAN_FOOTBALL_CURATED_COMPETITIONS,
  AMERICAN_FOOTBALL_CURATED_SLUGS,
} from './american-football-competitions';
import { MMA_CURATED_COMPETITIONS, MMA_CURATED_SLUGS } from './mma-competitions';
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
import { TENNIS_EXPLAINER_CATEGORIES, TENNIS_EXPLAINER_TOPICS } from './tennis-explainer-taxonomy';
import { TENNIS_EXPLAINERS, TENNIS_EXPLAINER_SOURCES } from './tennis-explainers';
import { TENNIS_SERVING_AND_COURT } from './tennis-serving-and-court';
import { TENNIS_SHOTS_AND_TACTICS } from './tennis-shots-and-tactics';
import { TENNIS_COMPETITION } from './tennis-competition';
import { TENNIS_STATS_AND_ADVANCED } from './tennis-stats-and-advanced';
import {
  FORMULA1_EXPLAINER_CATEGORIES,
  FORMULA1_EXPLAINER_TOPICS,
} from './formula1-explainer-taxonomy';
import { FORMULA1_EXPLAINERS, FORMULA1_EXPLAINER_SOURCES } from './formula1-explainers';
import { GOLF_EXPLAINER_CATEGORIES, GOLF_EXPLAINER_TOPICS } from './golf-explainer-taxonomy';
import { GOLF_EXPLAINERS, GOLF_EXPLAINER_SOURCES } from './golf-explainers';
import {
  AMERICAN_FOOTBALL_EXPLAINER_CATEGORIES,
  AMERICAN_FOOTBALL_EXPLAINER_TOPICS,
} from './american-football-explainer-taxonomy';
import {
  AMERICAN_FOOTBALL_EXPLAINERS,
  AMERICAN_FOOTBALL_EXPLAINER_SOURCES,
} from './american-football-explainers';
import { BOXING_EXPLAINER_CATEGORIES, BOXING_EXPLAINER_TOPICS } from './boxing-explainer-taxonomy';
import { BOXING_EXPLAINERS, BOXING_EXPLAINER_SOURCES } from './boxing-explainers';
import { MMA_EXPLAINER_CATEGORIES, MMA_EXPLAINER_TOPICS } from './mma-explainer-taxonomy';
import { MMA_EXPLAINERS, MMA_EXPLAINER_SOURCES } from './mma-explainers';
import { MMA_STRIKING_EXPLAINERS, MMA_STRIKING_SOURCES } from './mma-explainers-striking';
import {
  MMA_WRESTLING_CLINCH_EXPLAINERS,
  MMA_WRESTLING_CLINCH_SOURCES,
} from './mma-explainers-wrestling-clinch';
import { MMA_GROUND_EXPLAINERS, MMA_GROUND_SOURCES } from './mma-explainers-ground';
import {
  MMA_BJJ_GNP_CAGE_DEFENSE_EXPLAINERS,
  MMA_BJJ_GNP_CAGE_DEFENSE_SOURCES,
} from './mma-explainers-bjj-gnp-cage-defense';
import {
  MMA_STRATEGY_WEIGHT_EXPLAINERS,
  MMA_STRATEGY_WEIGHT_SOURCES,
} from './mma-explainers-strategy-weight';
import {
  MMA_PROMOTIONS_EVENTS_EXPLAINERS,
  MMA_PROMOTIONS_EVENTS_SOURCES,
} from './mma-explainers-promotions-events';
import {
  MMA_RECORDS_OFFICIATING_GLOSSARY_EXPLAINERS,
  MMA_RECORDS_OFFICIATING_GLOSSARY_SOURCES,
} from './mma-explainers-records-officiating-glossary';
import { GOLF_SCORING_AND_COURSE } from './golf-scoring-and-course';
import { GOLF_CLUBS_AND_SHOTS } from './golf-clubs-and-shots';
import { GOLF_HANDICAPS_AND_FORMATS } from './golf-handicaps-and-formats';
import { GOLF_RULES_AND_RELIEF } from './golf-rules-and-relief';
import { GOLF_STRATEGY_AND_STATS } from './golf-strategy-and-stats';
import { FORMULA1_WEEKEND } from './formula1-weekend';
import { FORMULA1_TYRES } from './formula1-tyres';
import { FORMULA1_STRATEGY } from './formula1-strategy';
import { FORMULA1_RACE } from './formula1-race';
import { FORMULA1_CHAMPIONSHIP } from './formula1-championship';
import { FORMULA1_CAR } from './formula1-car';
import { FORMULA1_DRIVING } from './formula1-driving';
import { FORMULA1_ANALYSIS } from './formula1-analysis';
import { BASKETBALL_LEAGUES } from './basketball-leagues';
import { seedExplainerLibrary } from './seed-explainers';
import {
  BASKETBALL_FINALS_MVP_SEEDS,
  BASKETBALL_LEAGUE_MVP_SEEDS,
  FINALS_MVP_TITLE,
  FRANCHISE_RENAMES,
  LEAGUE_MVP_TITLE,
  PLAYER_RENAMES,
} from './basketball-awards';
import { basketballHonourTier } from './basketball-honour-tiers';
import { BASKETBALL_FORMER_NAMES, BASKETBALL_NICKNAMES } from './basketball-nicknames';
import { cricketHonourTier } from './cricket-honour-tiers';
import { tennisHonourTier } from './tennis-honour-tiers';
import { golfHonourTier } from './golf-honour-tiers';
import { americanFootballHonourTier } from './american-football-honour-tiers';
import { combatHonourTier } from './combat-honour-tiers';
import { honourTier } from './football-honour-tiers';
import { STATISTIC_REGISTRY } from './statistic-registry';
import { TEAM_RANKING_SEEDS } from './team-rankings';
import { COMPETITION_RANKING_SEEDS, type CompetitionRankingSeed } from './competition-rankings';
import { NEWS_SOURCE_SEEDS } from './news-sources';
import { cleanUpBoxingPersons } from './boxing-cleanup';
import { BOXING_COMPETITION_ABOUT, BOXING_COMPETITION_RANKINGS } from './boxing-competition-detail';

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
      ['basketball', BASKETBALL_CURATED_COMPETITIONS, BASKETBALL_CURATED_SLUGS],
      ['tennis', TENNIS_CURATED_COMPETITIONS, TENNIS_CURATED_SLUGS],
      ['golf', GOLF_CURATED_COMPETITIONS, GOLF_CURATED_SLUGS],
      // American football is curated for the same reason golf is: ingestion's
      // catalogue held no Super Bowl and no conference championship games,
      // only the league, its two conferences and a hundred and sixty-odd
      // defunct or foreign leagues nobody was looking up.
      [
        'american-football',
        AMERICAN_FOOTBALL_CURATED_COMPETITIONS,
        AMERICAN_FOOTBALL_CURATED_SLUGS,
      ],
      ['boxing', BOXING_CURATED_COMPETITIONS, BOXING_CURATED_SLUGS],
      // MMA is curated for the same reason: ingestion's catalogue held eight
      // regional and defunct promotions and not the UFC.
      ['mma', MMA_CURATED_COMPETITIONS, MMA_CURATED_SLUGS],
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

    const nicknames = await seedBasketballNicknames(db);
    process.stdout.write(
      `Curated:  ${nicknames.set} nicknames corrected, ${nicknames.cleared} removed\n`,
    );

    const formerNames = await seedBasketballFormerNames(db);
    process.stdout.write(`Curated:  ${formerNames} former names added as aliases\n`);

    const seededAwards = await seedBasketballAwards(db);
    process.stdout.write(
      `Awards:   ${seededAwards.written} basketball awards seeded, ` +
        `${seededAwards.skipped} already held\n`,
    );

    // After career spans, which share the same `person_team` dates the award
    // attribution windows on.
    const basketballTables = await deriveBasketballTeamTables(db);
    process.stdout.write(`Derived:  ${basketballTables} basketball team tables\n`);

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

    // Before `derivePersonPriority`, which reads `entity_ranking` for its
    // `ranked` evidence: a leaderboard written after priority was derived
    // from it would not take effect until the next full run.
    const passingLeaders = await deriveGridironPassingLeaders(db);
    process.stdout.write(`Derived:  ${passingLeaders} NFL team passing-yards leaderboards\n`);

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

    const boxingAbout = await seedBoxingCompetitionAbout(db);
    process.stdout.write(
      `Content:  ${boxingAbout.written} boxing competition histories written, ` +
        `${boxingAbout.skipped} not in the database\n`,
    );

    const boxingCleanup = await cleanUpBoxingPersons(db);
    process.stdout.write(
      `Curated:  boxing — ${boxingCleanup.misclassifiedDeleted} misclassified people removed, ` +
        `${boxingCleanup.fillerDeleted} notability-floor filler rows removed, ` +
        `${boxingCleanup.boxersAdded} major boxers added, ` +
        `${boxingCleanup.titlesWritten} title reigns seeded\n`,
    );

    const golfRecords = await deriveGolfCompetitionRecords(db);
    process.stdout.write(`Derived:  ${golfRecords} golf competition records\n`);

    const mmaTables = await deriveMmaUfcTables(db);
    process.stdout.write(`Derived:  ${mmaTables} UFC leaderboards\n`);

    // Football, cricket, basketball, tennis, then Formula 1. Order is irrelevant to
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
      /*
       * Tennis, the first individual sport through this function.
       *
       * No `membership`: the ITF's membership is quoted inconsistently across
       * sources and no figure was stable enough to seed. No teams either, here
       * or in `featured`, because tennis has no clubs and its national-team
       * competitions are covered as prose and as competition cards instead.
       */
      [
        'tennis',
        {
          sources: TENNIS_SOURCES,
          timeline: TENNIS_TIMELINE,
          governance: TENNIS_GOVERNANCE,
          sections: TENNIS_SECTIONS,
          formats: TENNIS_FORMATS,
          concepts: TENNIS_CONCEPTS,
          facts: TENNIS_FACTS,
          featured: TENNIS_FEATURED,
        },
      ],
      /*
       * Golf, the third individual sport and the first with two peer governing
       * bodies rather than one.
       *
       * No `membership`: neither The R&A nor the USGA publishes a member count
       * that means the same thing as a federation's, and the two bodies' remits
       * are territorial rather than numerical.
       *
       * `featured` carries no `teams`. Golf is seeded with `hasTeams: false`,
       * and the Ryder Cup sides are not teams in the sense this schema means;
       * they are covered as prose and as competition cards instead.
       */
      [
        'golf',
        {
          sources: GOLF_SOURCES,
          timeline: GOLF_TIMELINE,
          governance: GOLF_GOVERNANCE,
          sections: GOLF_SECTIONS,
          formats: GOLF_FORMATS,
          concepts: GOLF_CONCEPTS,
          facts: GOLF_FACTS,
          featured: GOLF_FEATURED,
        },
      ],
      /*
       * American football, the fourth team sport. `formats` is a shallow
       * pathway of playing levels (high school, college, professional) rather
       * than cricket's or basketball's deep taxonomy of named match formats,
       * since the sport has no equivalent split. No `membership`: the NFL
       * does not publish a member count that means the same thing as a
       * federation's. `governance` stretches the schema's world/continental
       * vocabulary to describe the NFL and its two conferences, explained in
       * the seed file's own doc comment, since the sport has no governing
       * hierarchy in the FIFA or FIBA sense to root the tree at instead.
       */
      [
        'american-football',
        {
          sources: AMERICAN_FOOTBALL_SOURCES,
          timeline: AMERICAN_FOOTBALL_TIMELINE,
          governance: AMERICAN_FOOTBALL_GOVERNANCE,
          sections: AMERICAN_FOOTBALL_SECTIONS,
          formats: AMERICAN_FOOTBALL_FORMATS,
          concepts: AMERICAN_FOOTBALL_CONCEPTS,
          facts: AMERICAN_FOOTBALL_FACTS,
          featured: AMERICAN_FOOTBALL_FEATURED,
        },
      ],
      /*
       * MMA, the first combat sport. `governance` carries only IMMAF, the one
       * body that fits the schema's world/continental shape; the promotions,
       * UFC included, are not governing bodies and are covered as prose and
       * as `featured` competitions instead, explained in the seed file's own
       * doc comment. No `membership`: no promotion grades its roster into
       * membership tiers the way a federation grades member associations.
       */
      [
        'mma',
        {
          sources: MMA_SOURCES,
          timeline: MMA_TIMELINE,
          governance: MMA_GOVERNANCE,
          sections: MMA_SECTIONS,
          formats: MMA_FORMATS,
          concepts: MMA_CONCEPTS,
          facts: MMA_FACTS,
          featured: MMA_FEATURED,
        },
      ],
      /*
       * Boxing, the ninth sport through this function and the second combat
       * sport, inserted here right after MMA as its closest thematic
       * neighbour. `governance` is empty: the WBA, WBC, IBF and WBO are
       * sanctioning bodies rather than governing bodies, modelled instead as
       * `featured` competitions consistent with `boxing-competitions.ts`, and
       * Olympic/amateur boxing's governing arrangements have been genuinely
       * unsettled since AIBA/IBA lost IOC recognition, so no current
       * federation is asserted here either. See the seed file's own doc
       * comment for the full reasoning. No `membership`, for the same reason
       * as MMA's: no sanctioning body or promoter grades a roster of member
       * federations the way a sport's governing body does.
       */
      [
        'boxing',
        {
          sources: BOXING_SOURCES,
          timeline: BOXING_TIMELINE,
          governance: BOXING_GOVERNANCE,
          sections: BOXING_SECTIONS,
          formats: BOXING_FORMATS,
          concepts: BOXING_CONCEPTS,
          facts: BOXING_FACTS,
          featured: BOXING_FEATURED,
        },
      ],
      /*
       * Formula 1, the second individual sport and the first with two
       * championships decided by one set of results.
       *
       * No `membership`: the FIA grades its member clubs, but the figures are
       * for motoring bodies across every discipline it governs and quoting them
       * on a Formula 1 page would attach a number to the wrong thing.
       *
       * `featured` carries constructors under `teams` rather than clubs, and
       * every entry is historical. The current grid changes within a season and
       * is read from the Teams and Players tabs instead.
       */
      [
        'formula-1',
        {
          sources: FORMULA_ONE_SOURCES,
          timeline: FORMULA_ONE_TIMELINE,
          governance: FORMULA_ONE_GOVERNANCE,
          sections: FORMULA_ONE_SECTIONS,
          formats: FORMULA_ONE_FORMATS,
          concepts: FORMULA_ONE_CONCEPTS,
          facts: FORMULA_ONE_FACTS,
          featured: FORMULA_ONE_FEATURED,
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
    // Tennis, through the same function once more. Five content files rather
    // than one because the library covers twenty categories, and a split by
    // subject means an edit to the serving rules touches one file.
    const tennisLibrary = await seedExplainerLibrary(
      db,
      'tennis',
      TENNIS_EXPLAINER_CATEGORIES,
      TENNIS_EXPLAINER_TOPICS,
      [
        ...TENNIS_EXPLAINERS,
        ...TENNIS_SERVING_AND_COURT,
        ...TENNIS_SHOTS_AND_TACTICS,
        ...TENNIS_COMPETITION,
        ...TENNIS_STATS_AND_ADVANCED,
      ],
      TENNIS_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${tennisLibrary.categories} tennis categories, ` +
        `${tennisLibrary.explainers} concepts (${tennisLibrary.published} published), ` +
        `${tennisLibrary.sections} sections, ${tennisLibrary.aliases} aliases, ` +
        `${tennisLibrary.relations} relations\n`,
    );
    // Formula 1, through the same function a fifth time. The library's
    // divergence problem is across time rather than across competitions, which
    // is what the `regulation_era` section exists for; the seeding path is
    // unchanged.
    const formula1Library = await seedExplainerLibrary(
      db,
      'formula-1',
      FORMULA1_EXPLAINER_CATEGORIES,
      FORMULA1_EXPLAINER_TOPICS,
      [
        ...FORMULA1_EXPLAINERS,
        ...FORMULA1_WEEKEND,
        ...FORMULA1_TYRES,
        ...FORMULA1_STRATEGY,
        ...FORMULA1_RACE,
        ...FORMULA1_CHAMPIONSHIP,
        ...FORMULA1_CAR,
        ...FORMULA1_DRIVING,
        ...FORMULA1_ANALYSIS,
      ],
      FORMULA1_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${formula1Library.categories} Formula 1 categories, ` +
        `${formula1Library.explainers} concepts (${formula1Library.published} published), ` +
        `${formula1Library.sections} sections, ${formula1Library.aliases} aliases, ` +
        `${formula1Library.relations} relations\n`,
    );
    // Golf, through the same function a sixth time. Golf's divergence is across
    // formats rather than competitions or eras: stroke play and match play do
    // not merely score differently, they make different shots correct, which is
    // what `format_differences` carries here. The seeding path is unchanged.
    const golfLibrary = await seedExplainerLibrary(
      db,
      'golf',
      GOLF_EXPLAINER_CATEGORIES,
      GOLF_EXPLAINER_TOPICS,
      [
        ...GOLF_EXPLAINERS,
        ...GOLF_SCORING_AND_COURSE,
        ...GOLF_CLUBS_AND_SHOTS,
        ...GOLF_HANDICAPS_AND_FORMATS,
        ...GOLF_RULES_AND_RELIEF,
        ...GOLF_STRATEGY_AND_STATS,
      ],
      GOLF_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${golfLibrary.categories} golf categories, ` +
        `${golfLibrary.explainers} concepts (${golfLibrary.published} published), ` +
        `${golfLibrary.sections} sections, ${golfLibrary.aliases} aliases, ` +
        `${golfLibrary.relations} relations\n`,
    );
    // American football, through the same function a seventh time. Only the
    // Start Here spine, Downs & Yards in full, the core of Scoring, and one
    // curated concept each from six further categories are written; the rest
    // of the taxonomy is seeded as draft placeholders, exactly as golf's
    // below-the-fold categories are. The seeding path is unchanged.
    const americanFootballLibrary = await seedExplainerLibrary(
      db,
      'american-football',
      AMERICAN_FOOTBALL_EXPLAINER_CATEGORIES,
      AMERICAN_FOOTBALL_EXPLAINER_TOPICS,
      AMERICAN_FOOTBALL_EXPLAINERS,
      AMERICAN_FOOTBALL_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${americanFootballLibrary.categories} American football categories, ` +
        `${americanFootballLibrary.explainers} concepts (${americanFootballLibrary.published} published), ` +
        `${americanFootballLibrary.sections} sections, ${americanFootballLibrary.aliases} aliases, ` +
        `${americanFootballLibrary.relations} relations\n`,
    );

    // MMA, the first combat sport. All 31 categories from the brief are
    // seeded with full content, split across eight content files for
    // manageability: Phase 1 (Start Here, Ways to Win, Scoring) in
    // `mma-explainers.ts`, and the remaining 28 categories split by subject
    // across `mma-explainers-striking.ts` (striking basics and concepts),
    // `mma-explainers-wrestling-clinch.ts` (wrestling and clinch),
    // `mma-explainers-ground.ts` (ground positions and submissions, the
    // brief's "extremely visual" section, carrying `MatShape` diagrams),
    // `mma-explainers-bjj-gnp-cage-defense.ts` (BJJ in MMA, ground-and-pound,
    // cage wrestling, defense), `mma-explainers-strategy-weight.ts` (fight
    // strategy, style matchups, weight classes, weight cutting),
    // `mma-explainers-promotions-events.ts` (championships, rankings,
    // matchmaking, events, UFC, other promotions), and
    // `mma-explainers-records-officiating-glossary.ts` (fighter records,
    // analytics, officiating, fouls, corners, career path, terminology,
    // advanced concepts). `seedExplainerLibrary` merges taxonomy topics with
    // written content by slug, so passing only the written arrays (no
    // separate topic stubs) is sufficient once a category is fully written.
    const mmaLibrary = await seedExplainerLibrary(
      db,
      'mma',
      MMA_EXPLAINER_CATEGORIES,
      MMA_EXPLAINER_TOPICS,
      [
        ...MMA_EXPLAINERS,
        ...MMA_STRIKING_EXPLAINERS,
        ...MMA_WRESTLING_CLINCH_EXPLAINERS,
        ...MMA_GROUND_EXPLAINERS,
        ...MMA_BJJ_GNP_CAGE_DEFENSE_EXPLAINERS,
        ...MMA_STRATEGY_WEIGHT_EXPLAINERS,
        ...MMA_PROMOTIONS_EVENTS_EXPLAINERS,
        ...MMA_RECORDS_OFFICIATING_GLOSSARY_EXPLAINERS,
      ],
      [
        ...MMA_EXPLAINER_SOURCES,
        ...MMA_STRIKING_SOURCES,
        ...MMA_WRESTLING_CLINCH_SOURCES,
        ...MMA_GROUND_SOURCES,
        ...MMA_BJJ_GNP_CAGE_DEFENSE_SOURCES,
        ...MMA_STRATEGY_WEIGHT_SOURCES,
        ...MMA_PROMOTIONS_EVENTS_SOURCES,
        ...MMA_RECORDS_OFFICIATING_GLOSSARY_SOURCES,
      ],
    );
    process.stdout.write(
      `Explainers: ${mmaLibrary.categories} mma categories, ` +
        `${mmaLibrary.explainers} concepts (${mmaLibrary.published} published), ` +
        `${mmaLibrary.sections} sections, ${mmaLibrary.aliases} aliases, ` +
        `${mmaLibrary.relations} relations\n`,
    );

    // Boxing, the second combat sport, following MMA's own pattern. Phase 1
    // writes Category 1 (Start Here) and Category 34 (Terminology) in full;
    // every other category is a draft placeholder, exactly as golf's and
    // American football's below-the-fold categories were before their own
    // later phases. The seeding path is unchanged.
    const boxingLibrary = await seedExplainerLibrary(
      db,
      'boxing',
      BOXING_EXPLAINER_CATEGORIES,
      BOXING_EXPLAINER_TOPICS,
      BOXING_EXPLAINERS,
      BOXING_EXPLAINER_SOURCES,
    );
    process.stdout.write(
      `Explainers: ${boxingLibrary.categories} boxing categories, ` +
        `${boxingLibrary.explainers} concepts (${boxingLibrary.published} published), ` +
        `${boxingLibrary.sections} sections, ${boxingLibrary.aliases} aliases, ` +
        `${boxingLibrary.relations} relations\n`,
    );

    const newsSources = await seedNewsSources(db);
    process.stdout.write(
      `News:     ${newsSources.created} sources created, ${newsSources.updated} updated ` +
        '(all seeded inactive with placeholder feed URLs; see news-sources.ts)\n',
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
        (p.attributes->>'position' IS NOT NULL) AS positioned,
        -- Titles in a top-tier competition, which is the evidence a sport
        -- without clubs has that somebody competed in it seriously.
        --
        -- Tennis has no teams at all, so affiliated and ranked above can
        -- never fire for a tennis player and the 150-sitelink cap never
        -- applies to one. Every tennis player was therefore capped at 40 and
        -- scored 800 for it, whether they had 159 sitelinks or 40, and the
        -- order fell to the honour count. That count was almost entirely
        -- ESPY and Laureus awards, because no Grand Slam was recorded
        -- anywhere: the Players tab opened with Serena Williams on 16 awards
        -- and put Federer 36th, behind the King of Thailand and a former
        -- Czech president, both of whom played a bit of tennis.
        --
        -- Counted from tier-1 competitions rather than from honours generally,
        -- so it means "won one of this sport's biggest events" rather than
        -- "has a long awards cabinet". For tennis those are the four majors
        -- and the Olympic tournament.
        (SELECT count(*) FROM honour h
          JOIN competition c ON c.id = h.competition_id
          WHERE h.person_id = p.id AND h.kind = 'title' AND c.tier = 1) AS major_titles
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
        --
        -- Two caps, chosen by whether the person demonstrably played the sport.
        --
        -- One cap for everybody was the flaw. It exists to stop a polymath with
        -- a huge article count from opening a sport's list, and at 40 it does
        -- that. But it also flattened every genuine star against each other:
        -- 132 basketball players clear 40 links, so Kobe Bryant's 114 and
        -- Michael Jordan's 138 scored exactly what Andrew Bogut's 38 did, and
        -- the order then fell to the club count, which rewards a journeyman for
        -- having moved. Basketball's list opened with Pau Gasol, Dikembe Mutombo
        -- and Bogut while Stephen Curry sat 46th and Kobe 14th.
        --
        -- The two concerns are separable. The affiliated and ranked flags are
        -- already evidence that the person had a real career in this sport
        -- rather than a stray Wikidata statement, and neither Arthur Conan Doyle
        -- nor Charles III has either. So a proven player is capped at 150, high
        -- enough that no real ranking hits it, and everybody else stays at 40.
        --
        -- Measured on the live catalogue: cricket's top fifteen becomes
        -- Tendulkar, Kohli and Dhoni where it was a novelist, a king and a
        -- playwright, and those three fall to rank ~5,150. Basketball's becomes
        -- Jordan, LeBron, Kobe with Curry ninth.
        least(
          evidence.sitelinks,
          CASE
            WHEN evidence.affiliated OR evidence.ranked OR evidence.major_titles > 0 THEN 150
            ELSE 40
          END
        ) * 20
        + least(evidence.honours, 150) * 12
        -- Raised from 250, which was too small to matter once sitelinks reached
        -- three figures. Appearing in a team's records table is the strongest
        -- evidence available that somebody played the sport seriously rather
        -- than incidentally, and it is now weighted to say so.
        + CASE WHEN evidence.ranked THEN 900 ELSE 0 END
        -- Reduced from 25. The club count is weak evidence of standing and was
        -- strong enough to decide the order once sitelinks were capped: at 25 a
        -- point, six clubs paid 150, which is more than Kobe Bryant's entire
        -- honours lead over Bogut. It says a career was long and mobile, which
        -- is worth something and is not worth more than fame or trophies.
        + least(evidence.clubs, 6) * 8
        -- Weighted to clear the sitelink cap on its own: 40 links score 800, so
        -- an affiliated player with no other evidence still outranks a polymath
        -- with the maximum. Deliberately not larger, because it must not
        -- reorder genuine players among themselves.
        + CASE WHEN evidence.affiliated THEN 850 ELSE 0 END
        -- Weighted like the affiliated bonus, and for the same reason: it is
        -- proof of a real career in the sport, and it must clear the sitelink
        -- cap on its own so that a champion outranks a polymath with the max.
        --
        -- The per-title term is deliberately small beside it. What separates
        -- Federer from a one-slam winner is mostly fame, which sitelinks
        -- already measure now that the cap has lifted for both; a large
        -- per-title weight would instead sort the whole tab by slam count and
        -- bury a famous former No. 1 who never won a major.
        + CASE WHEN evidence.major_titles > 0 THEN 850 ELSE 0 END
        + least(evidence.major_titles, 25) * 30
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
    WHERE s.slug IN (
      'football',
      'cricket',
      'basketball',
      'tennis',
      'golf',
      'american-football',
      'mma',
      'boxing'
    )
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
    // Tennis was omitted for the same reason and produced a variant of the
    // same defect on the profile rather than the Teams tab: all of its honours
    // were unranked, so once the Grand Slams were ingested Federer's twenty
    // majors would have sorted level with his one ESPY award.
    tennis: tennisHonourTier,
    golf: golfHonourTier,
    'american-football': americanFootballHonourTier,
    // One list serves both combat sports: they share the sanctioning-body
    // structure the tiering depends on, and their vocabularies do not collide.
    mma: combatHonourTier,
    boxing: combatHonourTier,
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

/**
 * The most-titles record for each golf major, from its own roll of honour.
 *
 * Golf's competition pages had no records at all, and the sport's obvious one
 * is "who has won this the most times": six Masters for Jack Nicklaus, five
 * PGA Championships for Walter Hagen. That is a real record a reader arrives
 * looking for, and it is the one the majors are actually discussed in terms of.
 *
 * Derived from the champion tables rather than entered by hand, which is the
 * point. The same rows drive the roll of honour on the page, so the record and
 * the list it summarises cannot disagree: adding next year's champion updates
 * both. A hand-entered figure would be a second copy of the same fact, free to
 * drift.
 *
 * Ties are real and are kept. Five golfers have won The Open five times, and a
 * record naming one of them would be wrong about the other four, so the holder
 * is left unset where the top figure is shared and the note carries the names.
 * `record_person_id` is set only when exactly one player holds it.
 */
async function deriveGolfCompetitionRecords(db: Db): Promise<number> {
  // Cleared first rather than upserted.
  //
  // `competition_statistic_unique_idx` covers the nullable `season_id` and
  // `discipline_id` columns directly, and in Postgres two NULLs are not equal,
  // so an all-time record with both null never conflicts with itself: the
  // ON CONFLICT clause matched nothing and every run inserted a second row.
  // The Open Championship ended up holding both a stale "5 titles" and a
  // corrected "6 titles" record at once, which is worse than either alone.
  await db.execute(sql`
    DELETE FROM competition_statistic cs
    USING competition c, sport s
    WHERE cs.competition_id = c.id
      AND c.sport_id = s.id
      AND s.slug = 'golf'
      AND cs.stat_key = 'most_titles'
      AND cs.scope = 'all_time'
  `);

  const rows = await db.execute<{ count: string }>(sql`
    WITH champions AS (
      SELECT
        c.id AS competition_id,
        c.sport_id,
        entry->>'name' AS name,
        count(*) AS titles
      FROM entity_ranking r
      JOIN competition c ON c.id = r.entity_id
      JOIN sport s ON s.id = c.sport_id
      CROSS JOIN LATERAL jsonb_array_elements(r.entries) AS entry
      WHERE r.entity_type = 'competition'
        AND r.kind = 'champions_golf'
        AND s.slug = 'golf'
      GROUP BY c.id, c.sport_id, entry->>'name'
    ),
    best AS (
      SELECT competition_id, sport_id, max(titles) AS titles
      FROM champions
      GROUP BY competition_id, sport_id
    ),
    holders AS (
      SELECT
        b.competition_id,
        b.sport_id,
        b.titles,
        array_agg(ch.name ORDER BY ch.name) AS names
      FROM best b
      JOIN champions ch
        ON ch.competition_id = b.competition_id AND ch.titles = b.titles
      GROUP BY b.competition_id, b.sport_id, b.titles
    )
    INSERT INTO competition_statistic (
      competition_id, sport_id, scope, stat_key, value,
      record_person_id, note, context, computed_at
    )
    SELECT
      h.competition_id,
      h.sport_id,
      'all_time',
      'most_titles',
      h.titles,
      -- Only where one player holds it outright. A shared record with a single
      -- name attached would be wrong about everybody else who holds it.
      CASE WHEN array_length(h.names, 1) = 1 THEN (
        SELECT p.id FROM person p
        WHERE p.full_name = h.names[1] AND p.primary_sport_id = h.sport_id
        LIMIT 1
      ) END,
      array_to_string(h.names, ', '),
      '{}'::jsonb,
      now()
    FROM holders h
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * Each NFL team's career passing-yards leaderboard, from the quarterback
 * career totals `wiki qb-passing` already wrote to `person_statistic`.
 *
 * Replaces the three `most_appearances` team rankings a stale partial run of
 * the generic football rankings command had left behind. Those were wrong on
 * two counts at once: the `kind` claimed "most appearances" while the actual
 * values were passing yardage (Minnesota's table topped with Fran Tarkenton
 * at "33,098 appearances"), and only 3 of the sport's 32 teams had a table at
 * all, because the command that wrote them reads a records article shaped
 * for football (soccer) rather than gridiron. `derivePersonPriority`'s
 * `ranked` bonus reads any row in `entity_ranking`, so those three sparse,
 * mislabelled tables were deciding a large chunk of the Players tab's order
 * on essentially arbitrary grounds: Brett Favre, Kurt Warner and Sam Bradford
 * scored a flat +900 for happening to appear in one of the three, and Tom
 * Brady, with far more real career yardage and fame, scored nothing.
 *
 * `person_team` supplies which team each quarterback's spell belongs to,
 * so a QB who played for several franchises appears on each one's table
 * with the one career total, not a fabricated per-team split the source
 * data does not carry.
 */
async function deriveGridironPassingLeaders(db: Db): Promise<number> {
  await db.execute(sql`
    DELETE FROM entity_ranking r
    USING team t, sport s
    WHERE r.entity_id = t.id
      AND r.entity_type = 'team'
      AND t.sport_id = s.id
      AND s.slug = 'american-football'
      AND r.kind IN ('most_appearances', 'most_passing_yards')
  `);

  const rows = await db.execute<{ count: string }>(sql`
    WITH leaders AS (
      SELECT
        pt.team_id,
        p.id AS person_id,
        p.full_name,
        em.external_id AS wikipedia_title,
        (ps.stats->>'passing_yards')::numeric AS yards,
        row_number() OVER (
          PARTITION BY pt.team_id ORDER BY (ps.stats->>'passing_yards')::numeric DESC
        ) AS rank
      FROM person_team pt
      JOIN person p ON p.id = pt.person_id
      JOIN person_statistic ps ON ps.person_id = p.id AND ps.scope = 'career'
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.entity_type = 'person' AND em.provider = 'wikipedia'
      JOIN team t ON t.id = pt.team_id
      JOIN sport s ON s.id = t.sport_id AND s.slug = 'american-football'
      WHERE ps.stats ? 'passing_yards'
      GROUP BY pt.team_id, p.id, p.full_name, em.external_id, ps.stats
    ),
    top_ten AS (
      SELECT team_id, jsonb_agg(
        jsonb_build_object(
          'rank', rank, 'name', full_name, 'link', wikipedia_title,
          'value', yards, 'detail', NULL
        ) ORDER BY rank
      ) AS entries
      FROM leaders
      WHERE rank <= 10
      GROUP BY team_id
    )
    INSERT INTO entity_ranking (
      entity_type, entity_id, kind, label, entries, confidence, note, source_title
    )
    SELECT
      'team', team_id, 'most_passing_yards', 'Most career passing yards',
      entries, 'high',
      'Career regular-season passing yards while with this team is not separated from a player''s career total elsewhere, so this ranks whole careers, not single-team spans.',
      'Wikipedia player career statistics'
    FROM top_ten
    RETURNING 1 AS count
  `);

  return rows.length;
}

/**
 * The UFC's own leaderboards: most bouts, most title bouts, most wins and
 * most title wins, each a top-15 table on the competition page.
 *
 * Unlike `deriveGolfCompetitionRecords`, which writes a single record holder
 * per stat to `competition_statistic`, these are genuine ranked tables and go
 * to `entity_ranking` instead, the same mechanism `deriveGridironPassingLeaders`
 * uses for a team's career leaders. `ProfileAssembler.forEntity` already reads
 * `entity_ranking` for `entityType: 'competition'` and the competition page
 * already renders whatever it returns through `RankingPanel`, so this needed
 * no new API or frontend work, only the rows themselves.
 *
 * Fight totals (`most_bouts`, `most_wins`) are read from a fighter's
 * career-level `person_statistic` row, written by `wiki mma-records`. This is
 * a career total across every promotion a fighter has fought in, not a
 * UFC-only figure, and is accepted as a reasonable proxy rather than exact
 * because this sport's curated competition list is UFC-only: there is no
 * competitor promotion in the database for a UFC fighter's other bouts to be
 * confused with, and for the fighters who actually lead these tables the
 * confusion this could cause (fighting in another promotion before or after
 * a UFC run) undercounts their true UFC total rather than overstating it.
 *
 * Title figures (`most_title_bouts`, `most_title_wins`) are exact: they come
 * from `person_statistic` rows `wiki mma-title-bouts` writes scoped to the
 * UFC specifically (`competition_id` set, `scope='competition'`), and from
 * `honour` rows `wiki mma-titles` writes with `competition_id` resolved to
 * the UFC, so nothing outside the promotion can appear in either table.
 */
async function deriveMmaUfcTables(db: Db): Promise<number> {
  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = 'mma' LIMIT 1`,
  );
  if (!sportRow) return 0;

  const [ufc] = await db.execute<{ id: string }>(sql`
    SELECT id FROM competition
    WHERE sport_id = ${sportRow.id} AND slug = 'ultimate-fighting-championship'
    LIMIT 1
  `);
  if (!ufc) return 0;

  await db.execute(sql`
    DELETE FROM entity_ranking
    WHERE entity_type = 'competition'
      AND entity_id = ${ufc.id}
      AND kind IN ('most_bouts', 'most_title_bouts', 'most_wins', 'most_title_wins')
  `);

  let written = 0;

  const bouts = await db.execute<{ count: string }>(sql`
    WITH totals AS (
      SELECT
        p.full_name,
        em.external_id AS wikipedia_title,
        (coalesce(ps.wins, 0) + coalesce(ps.losses, 0) + coalesce(ps.draws, 0)
          + coalesce((ps.stats->>'no_contests')::int, 0)) AS bouts
      FROM person_statistic ps
      JOIN person p ON p.id = ps.person_id
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.entity_type = 'person' AND em.provider = 'wikipedia'
      WHERE ps.sport_id = ${sportRow.id} AND ps.scope = 'career'
    ),
    ranked AS (
      SELECT *, row_number() OVER (ORDER BY bouts DESC) AS rank
      FROM totals
      WHERE bouts > 0
    )
    SELECT jsonb_agg(
      jsonb_build_object('rank', rank, 'name', full_name, 'link', wikipedia_title, 'value', bouts, 'detail', NULL)
      ORDER BY rank
    ) AS entries
    FROM ranked
    WHERE rank <= 15
  `);

  const wins = await db.execute<{ count: string }>(sql`
    WITH totals AS (
      SELECT p.full_name, em.external_id AS wikipedia_title, coalesce(ps.wins, 0) AS wins
      FROM person_statistic ps
      JOIN person p ON p.id = ps.person_id
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.entity_type = 'person' AND em.provider = 'wikipedia'
      WHERE ps.sport_id = ${sportRow.id} AND ps.scope = 'career'
    ),
    ranked AS (
      SELECT *, row_number() OVER (ORDER BY wins DESC) AS rank
      FROM totals
      WHERE wins > 0
    )
    SELECT jsonb_agg(
      jsonb_build_object('rank', rank, 'name', full_name, 'link', wikipedia_title, 'value', wins, 'detail', NULL)
      ORDER BY rank
    ) AS entries
    FROM ranked
    WHERE rank <= 15
  `);

  const titleBouts = await db.execute<{ count: string }>(sql`
    WITH totals AS (
      SELECT
        p.full_name,
        em.external_id AS wikipedia_title,
        (coalesce(ps.wins, 0) + coalesce(ps.losses, 0)) AS title_bouts
      FROM person_statistic ps
      JOIN person p ON p.id = ps.person_id
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.entity_type = 'person' AND em.provider = 'wikipedia'
      WHERE ps.sport_id = ${sportRow.id} AND ps.scope = 'competition' AND ps.competition_id = ${ufc.id}
    ),
    ranked AS (
      SELECT *, row_number() OVER (ORDER BY title_bouts DESC) AS rank
      FROM totals
      WHERE title_bouts > 0
    )
    SELECT jsonb_agg(
      jsonb_build_object('rank', rank, 'name', full_name, 'link', wikipedia_title, 'value', title_bouts, 'detail', NULL)
      ORDER BY rank
    ) AS entries
    FROM ranked
    WHERE rank <= 15
  `);

  const titleWins = await db.execute<{ count: string }>(sql`
    WITH totals AS (
      SELECT p.full_name, em.external_id AS wikipedia_title, count(*) AS title_wins
      FROM honour h
      JOIN person p ON p.id = h.person_id
      JOIN external_mapping em
        ON em.entity_id = p.id AND em.entity_type = 'person' AND em.provider = 'wikipedia'
      WHERE h.sport_id = ${sportRow.id} AND h.competition_id = ${ufc.id} AND h.kind = 'title'
      GROUP BY p.full_name, em.external_id
    ),
    ranked AS (
      SELECT *, row_number() OVER (ORDER BY title_wins DESC) AS rank
      FROM totals
    )
    SELECT jsonb_agg(
      jsonb_build_object('rank', rank, 'name', full_name, 'link', wikipedia_title, 'value', title_wins, 'detail', NULL)
      ORDER BY rank
    ) AS entries
    FROM ranked
    WHERE rank <= 15
  `);

  const tables: {
    kind: string;
    label: string;
    note: string;
    entries: unknown;
  }[] = [
    {
      kind: 'most_bouts',
      label: 'Most career bouts',
      note: 'Career total across every promotion a fighter has fought in, not UFC bouts alone.',
      entries: (bouts[0] as unknown as { entries: unknown } | undefined)?.entries,
    },
    {
      kind: 'most_wins',
      label: 'Most career wins',
      note: 'Career total across every promotion a fighter has fought in, not UFC wins alone.',
      entries: (wins[0] as unknown as { entries: unknown } | undefined)?.entries,
    },
    {
      kind: 'most_title_bouts',
      label: 'Most UFC title bouts',
      note: 'Bouts fought with a UFC title on the line, won or lost.',
      entries: (titleBouts[0] as unknown as { entries: unknown } | undefined)?.entries,
    },
    {
      kind: 'most_title_wins',
      label: 'Most UFC title wins',
      note: 'Title reigns won, from each fighter’s stated championship history.',
      entries: (titleWins[0] as unknown as { entries: unknown } | undefined)?.entries,
    },
  ];

  for (const table of tables) {
    if (!table.entries) continue;
    await db.execute(sql`
      INSERT INTO entity_ranking (
        entity_type, entity_id, kind, label, entries, confidence, note, source_title
      ) VALUES (
        'competition', ${ufc.id}, ${table.kind}, ${table.label},
        ${JSON.stringify(table.entries)}::jsonb, 'high', ${table.note},
        'Wikipedia fighter records and championship histories'
      )
    `);
    written += 1;
  }

  return written;
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
 * Applies the curated nicknames, overriding whatever the ingest chose.
 *
 * Runs on every seed rather than once, because a re-ingest overwrites
 * `attributes.nickname` from Wikidata and would otherwise reinstate the values
 * this list exists to correct. See `basketball-nicknames.ts` for why the
 * ingested value cannot be trusted on the best-known players.
 *
 * A slug mapped to null has its nickname removed rather than replaced.
 */
async function seedBasketballNicknames(db: Db): Promise<{ set: number; cleared: number }> {
  let set = 0;
  let cleared = 0;

  for (const [slug, nickname] of Object.entries(BASKETBALL_NICKNAMES)) {
    const rows =
      nickname === null
        ? await db.execute<{ id: string }>(sql`
            UPDATE person SET attributes = attributes - 'nickname', updated_at = now()
            WHERE slug = ${slug} AND attributes ? 'nickname'
            RETURNING id
          `)
        : await db.execute<{ id: string }>(sql`
            UPDATE person
            SET attributes = attributes || jsonb_build_object('nickname', ${nickname}::text),
                updated_at = now()
            WHERE slug = ${slug}
              AND attributes ->> 'nickname' IS DISTINCT FROM ${nickname}
            RETURNING id
          `);

    if (rows.length === 0) continue;
    if (nickname === null) cleared += 1;
    else set += 1;
  }

  return { set, cleared };
}

/**
 * Adds former competing names as aliases.
 *
 * Runs on every seed rather than once, because a re-ingest rewrites the person
 * row from Wikidata and would drop them. Merged into whatever aliases the row
 * already carries rather than replacing them.
 */
async function seedBasketballFormerNames(db: Db): Promise<number> {
  let updated = 0;

  // Franchises, from the same map the award seeding resolves teams through.
  // Inverted here: that map answers "what is this old name now", and an alias
  // answers "what else was this team called".
  const byModern = new Map<string, string[]>();
  for (const [historical, modern] of Object.entries(FRANCHISE_RENAMES)) {
    byModern.set(modern, [...(byModern.get(modern) ?? []), historical]);
  }

  for (const [modern, historical] of byModern) {
    const rows = await db.execute<{ id: string }>(sql`
      UPDATE team t
      SET aliases = (
            SELECT array_agg(DISTINCT value)
            FROM unnest(coalesce(t.aliases, '{}'::text[]) || ${sql.raw(pgTextArray(historical))}) AS value
          ),
          updated_at = now()
      FROM sport s
      WHERE s.id = t.sport_id AND s.slug = 'basketball' AND t.name = ${modern}
        AND NOT (coalesce(t.aliases, '{}'::text[]) @> ${sql.raw(pgTextArray(historical))})
      RETURNING t.id
    `);
    if (rows.length > 0) updated += 1;
  }

  for (const [slug, names] of Object.entries(BASKETBALL_FORMER_NAMES)) {
    const rows = await db.execute<{ id: string }>(sql`
      UPDATE person
      SET aliases = (
            SELECT array_agg(DISTINCT value)
            FROM unnest(coalesce(aliases, '{}'::text[]) || ${sql.raw(pgTextArray(names))}) AS value
          ),
          updated_at = now()
      WHERE slug = ${slug}
        AND NOT (coalesce(aliases, '{}'::text[]) @> ${sql.raw(pgTextArray(names))})
      RETURNING id
    `);
    if (rows.length > 0) updated += 1;
  }

  return updated;
}

/**
 * Seeds the NBA award winners Wikidata does not carry.
 *
 * Runs before `deriveBasketballTeamTables`, which reads `honour` to build the
 * per-team MVP tables, so a seeded award appears on the team page in the same
 * run.
 *
 * Resolution is by display name against basketball people we already hold, and
 * every one of the fourteen rows resolved when the list was compiled. A name
 * that stops resolving is reported rather than inserted with a null person: an
 * honour attached to nobody would count towards nothing and show nowhere, which
 * is a silent failure.
 */
async function seedBasketballAwards(db: Db): Promise<{ written: number; skipped: number }> {
  const [sportRow] = await db.execute<{ id: string }>(
    sql`SELECT id FROM sport WHERE slug = 'basketball' LIMIT 1`,
  );
  if (!sportRow) return { written: 0, skipped: 0 };

  let written = 0;
  let skipped = 0;

  for (const [title, seeds] of [
    [FINALS_MVP_TITLE, BASKETBALL_FINALS_MVP_SEEDS],
    [LEAGUE_MVP_TITLE, BASKETBALL_LEAGUE_MVP_SEEDS],
  ] as const) {
    for (const seed of seeds) {
      // Kareem Abdul-Jabbar won the 1971 awards as Lew Alcindor, which is the
      // name the article records.
      const playerName = PLAYER_RENAMES[seed.player] ?? seed.player;
      const [person] = await db.execute<{ id: string }>(sql`
        SELECT p.id FROM person p
        WHERE p.primary_sport_id = ${sportRow.id}
          AND (p.display_name = ${playerName} OR ${playerName} = ANY(p.aliases))
        LIMIT 1
      `);

      if (!person) {
        process.stdout.write(`  award: no person row for "${playerName}" (${seed.year})\n`);
        skipped += 1;
        continue;
      }

      // The team is resolved and stored on the honour itself.
      //
      // `deriveBasketballTeamTables` normally recovers the team by matching the
      // award year against the player's spell, which needs a dated membership.
      // Three of these winners have none: Cedric Maxwell, Dennis Johnson and
      // Bob McAdoo all carry undated NBA memberships, so Maxwell's 1981 Finals
      // MVP was seeded correctly and still did not reach Boston's page. Since
      // the curated row already names the team, recording it here removes the
      // guesswork rather than loosening the date rule for every award.
      // Historical franchise names are mapped before lookup: the 1975 MVP was
      // won with the Buffalo Braves, which we hold as the Los Angeles Clippers.
      const teamName = FRANCHISE_RENAMES[seed.team] ?? seed.team;
      const [teamRow] = await db.execute<{ id: string }>(sql`
        SELECT t.id FROM team t
        WHERE t.sport_id = ${sportRow.id}
          AND (t.name = ${teamName} OR ${teamName} = ANY(t.aliases))
        LIMIT 1
      `);

      if (!teamRow) {
        // Reported rather than silent. Without a team the award falls back to
        // date matching, which is the ambiguity this list exists to remove.
        process.stdout.write(`  award: no team row for "${teamName}" (${seed.year})\n`);
      }

      // Idempotent on the natural key, so this can run beside a full ingest.
      // `prestige` is left null deliberately: `deriveHonourPrestige` runs later
      // in the same seed and tiers every honour from its title, so setting it
      // here would be overwritten by the same value.
      const inserted = await db.execute<{ id: string }>(sql`
        INSERT INTO honour (sport_id, person_id, team_id, kind, title, year, source)
        SELECT ${sportRow.id}, ${person.id}, ${teamRow?.id ?? null}, 'award',
               ${title}, ${seed.year}, 'curated'
        WHERE NOT EXISTS (
          SELECT 1 FROM honour h
          WHERE h.person_id = ${person.id} AND h.title = ${title} AND h.year = ${seed.year}
        )
        RETURNING id
      `);

      if (inserted.length > 0) {
        written += 1;
        continue;
      }

      skipped += 1;

      // The award was already ingested from Wikidata, which does not carry the
      // team. Backfilling it here is what removes the transfer-year ambiguity
      // for the 111 awards that did arrive: without this, Kawhi Leonard's 2019
      // Finals MVP still appears on both Toronto and the Clippers.
      if (teamRow) {
        await db.execute(sql`
          UPDATE honour SET team_id = ${teamRow.id}, updated_at = now()
          WHERE person_id = ${person.id} AND title = ${title} AND year = ${seed.year}
            AND team_id IS DISTINCT FROM ${teamRow.id}
        `);
      }
    }
  }

  return { written, skipped };
}

/**
 * Builds the per-team basketball tables: award rolls and per-game leaders.
 *
 * Five tables per team, all derived rather than hand-entered, because the
 * source rows already exist and a curated list of 30 franchises would go stale
 * the moment an MVP is awarded.
 *
 * ## The award tables
 *
 * `honour` records who won an award and in which year, but not which team they
 * were playing for, so the team is recovered from `person_team`. That join has
 * to be windowed by date or it fans out across a player's whole career: a plain
 * join put Shai Gilgeous-Alexander's 2026 MVP on the Clippers and the Kentucky
 * Wildcats as well as the Thunder, and Julius Erving's on UMass. Restricting it
 * to the spell that contains the award year fixes every case checked by hand:
 * Jokic to Denver, Curry to Golden State, Harden to Houston, LeBron's 2012 and
 * 2013 to Miami.
 *
 * Honours with no year cannot be placed in a spell and are dropped rather than
 * guessed at, which is why these tables are shorter than the raw honour counts.
 *
 * ## What this no longer does
 *
 * It used to also build points, rebounds and assists tables from per-game
 * averages, because nothing in the data attributed a career total to a team.
 * That ranked by the wrong thing: the average spanned a player's whole career,
 * so Isaiah Thomas topped the Lakers' scoring on 17 games there. Those three
 * tables now come from `wiki basketball-leaders`, which reads real per-team
 * totals off each franchise's all-time roster article, and this pass builds only
 * the award rolls.
 */
async function deriveBasketballTeamTables(db: Db): Promise<number> {
  // Rebuilt from scratch each run rather than upserted. These are derived
  // tables, so a stale row is a wrong row, and the alternative is reconciling
  // two kinds per team by hand.
  //
  // Scoped to the two kinds this pass owns: the all-time tables are written by
  // the "basketball-leaders" wiki pass from a different source, and clearing
  // them here would delete them on every seed.
  await db.execute(sql`
    DELETE FROM entity_ranking
    WHERE entity_type = 'team'
      AND kind IN ('basketball_league_mvp', 'basketball_finals_mvp')
  `);

  const awards: [string, string, string][] = [
    ['basketball_league_mvp', 'League MVP', 'NBA Most Valuable Player Award'],
    ['basketball_finals_mvp', 'Finals MVP', 'Bill Russell NBA Finals Most Valuable Player Award'],
  ];

  let written = 0;

  for (const [kind, label, title] of awards) {
    const rows = await db.execute<{ count: string }>(sql`
      WITH won AS (
        SELECT
          -- The honour's own team wins where it has one. Curated rows record it
          -- directly, which is the only way three winners reach their team at
          -- all: Cedric Maxwell, Dennis Johnson and Bob McAdoo carry undated NBA
          -- memberships, so the date match below cannot place them.
          coalesce(h.team_id, pt.team_id) AS team_id,
          p.display_name AS name,
          p.slug AS player_slug,
          h.year
        FROM honour h
        JOIN person p ON p.id = h.person_id
        JOIN sport s ON s.id = h.sport_id
        -- LEFT, so an honour that names its own team does not require a
        -- membership row to survive the join.
        LEFT JOIN person_team pt
          ON pt.person_id = h.person_id
          AND h.team_id IS NULL
          AND pt.start_date IS NOT NULL
          AND extract(year from pt.start_date) <= h.year
          AND (pt.end_date IS NULL OR extract(year from pt.end_date) >= h.year)
          AND EXISTS (
            SELECT 1 FROM team t WHERE t.id = pt.team_id AND t.sport_id = s.id
          )
        WHERE s.slug = 'basketball'
          AND h.title = ${title}
          -- No year means the award cannot be placed in a spell, and placing it
          -- in every spell is what produced the fan-out this guards against.
          AND h.year IS NOT NULL
          AND coalesce(h.team_id, pt.team_id) IS NOT NULL
        -- One row per player per year per team: a player with two spells at the
        -- same club would otherwise be counted twice for one award.
        GROUP BY coalesce(h.team_id, pt.team_id), p.display_name, p.slug, h.year
      ),
      ranked AS (
        SELECT
          team_id, name, player_slug, year,
          row_number() OVER (PARTITION BY team_id ORDER BY year DESC) AS rank
        FROM won
      )
      INSERT INTO entity_ranking (entity_type, entity_id, kind, label, entries, confidence, note)
      SELECT
        'team', team_id, ${kind}, ${label},
        jsonb_agg(
          jsonb_build_object(
            'rank', rank, 'name', name, 'value', year,
            'detail', NULL, 'playerSlug', player_slug
          ) ORDER BY rank
        ),
        'high',
        'Awarded while at this team, matched on the years of the player''s spell.'
      FROM ranked
      GROUP BY team_id
      RETURNING 1 AS count
    `);
    written += rows.length;
  }

  return written;
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
    ['tennis', TENNIS_COMPETITION_RANKING_SEEDS],
    ['golf', GOLF_COMPETITION_RANKINGS],
    ['american-football', AMERICAN_FOOTBALL_COMPETITION_RANKINGS],
    ['boxing', BOXING_COMPETITION_RANKINGS],
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
 * Writes the `about` prose for the six curated boxing competitions.
 *
 * A plain column update rather than an upsert into a content table: `about`
 * is a single free-text column on `competition` itself (see
 * `entity.schema.ts`), not a row in `entity_section`, so there is no natural
 * key to conflict on. Idempotent by construction: writing the same string
 * twice changes nothing.
 */
async function seedBoxingCompetitionAbout(db: Db): Promise<{ written: number; skipped: number }> {
  let written = 0;
  let skipped = 0;

  for (const [slug, about] of Object.entries(BOXING_COMPETITION_ABOUT)) {
    const [competition] = await db.execute<{ id: string }>(sql`
      SELECT competition.id
      FROM competition
      INNER JOIN sport ON sport.id = competition.sport_id
      WHERE competition.slug = ${slug} AND sport.slug = 'boxing'
      LIMIT 1
    `);
    if (!competition) {
      process.stdout.write(`  skipped boxing competition "${slug}": not in the database\n`);
      skipped += 1;
      continue;
    }

    await db.execute(sql`
      UPDATE competition SET about = ${about}, updated_at = now() WHERE id = ${competition.id}
    `);
    written += 1;
  }

  return { written, skipped };
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

/**
 * Upserts the News Engine's source catalogue from `news-sources.ts`.
 *
 * Upserted on `slug` so re-running after editing a row's trust score or fetch
 * interval updates it in place rather than creating a duplicate. Every seeded
 * row is inactive with a placeholder feed URL; see the warning at the top of
 * `news-sources.ts` for what must happen before one is switched on.
 */
async function seedNewsSources(db: Db): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const source of NEWS_SOURCE_SEEDS) {
    const [sportRow] = source.defaultSportSlug
      ? await db.execute<{ id: string }>(
          sql`SELECT id FROM sport WHERE slug = ${source.defaultSportSlug} LIMIT 1`,
        )
      : [];

    const [existing] = await db.execute<{ id: string }>(
      sql`SELECT id FROM news_sources WHERE slug = ${source.slug} LIMIT 1`,
    );

    await db.execute(
      sql`INSERT INTO news_sources (
            name, slug, type, feed_url, website_url, default_sport_id, priority,
            trust_score, fetch_interval_seconds, is_active, display_headline_allowed,
            display_summary_allowed, display_image_allowed, commercial_usage_status,
            terms_url, health_status
          )
          VALUES (
            ${source.name}, ${source.slug}, ${source.type}, ${source.feedUrl},
            ${source.websiteUrl}, ${sportRow?.id ?? null}, ${source.priority},
            ${source.trustScore}, ${source.fetchIntervalSeconds}, ${source.isActive},
            ${source.displayHeadlineAllowed}, ${source.displaySummaryAllowed},
            ${source.displayImageAllowed}, ${source.commercialUsageStatus},
            ${source.termsUrl}, ${source.healthStatus}
          )
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            feed_url = EXCLUDED.feed_url,
            website_url = EXCLUDED.website_url,
            default_sport_id = EXCLUDED.default_sport_id,
            priority = EXCLUDED.priority,
            trust_score = EXCLUDED.trust_score,
            fetch_interval_seconds = EXCLUDED.fetch_interval_seconds,
            commercial_usage_status = EXCLUDED.commercial_usage_status,
            terms_url = EXCLUDED.terms_url,
            updated_at = now()`,
    );

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}
