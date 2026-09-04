/**
 * American football overview content.
 *
 * The seventh sport through the machinery built for football, cricket,
 * basketball, tennis, golf and Formula 1, and the second team sport with a
 * genuinely tiered league structure (after basketball's looser federation
 * model). The seed shapes are imported rather than redefined, and the page
 * renders them with the same sport-agnostic components.
 *
 * ## Governance: the NFL is a league, not a federation
 *
 * `GoverningBodySeed` was designed for a body that writes rules and recognises
 * members (FIFA, FIBA, the ICC, the R&A/USGA). The NFL does not fit that
 * model cleanly: it is a commercial competition whose 32 clubs are also its
 * own members, and its on-field rules are set by its Competition Committee
 * rather than by an outside standards body in the way IFAB sits above
 * football or the R&A above golf.
 *
 * Even so, the brief asks for the NFL/AFC/NFC/division structure to be
 * modelled, and it is a real hierarchy that readers expect to see, so it is
 * seeded into `governingBody` anyway: the NFL at `world` level (there being no
 * higher body in the schema's two-level vocabulary), and the AFC and NFC at
 * `continental` level beneath it, each carrying `region` as "American
 * Football Conference" / "National Football Conference" rather than a
 * geography, since the two conferences are not geographic regions. This is
 * the same move golf made with the R&A and USGA: reusing the schema's levels
 * for a relationship the schema wasn't built to describe, and saying so here
 * rather than pretending the fit is exact.
 *
 * The eight divisions (AFC/NFC East, North, South, West) are **not** seeded
 * as a third `governingBody` tier. `GovernanceHierarchy`, the component that
 * renders this table, shows only two levels: the world body's own card, and a
 * flat grid of its direct children. A division seeded as a grandchild would
 * write cleanly to the database (the repository builds a genuine recursive
 * tree) but would never appear in the UI, which is worse than not seeding it
 * at all: a silent gap nobody would notice. Divisions are instead covered as
 * prose, in the `nfl-structure` section and in the current-teams listing
 * below, where they are visible.
 *
 * The 32 clubs are **not** in `governingBody` either. A club competes; a
 * governing body does not, and the table's own doc comment makes that
 * distinction load-bearing. The clubs appear once, as `FeaturedEntitySeed`
 * rows resolved to real `team` entities where the database holds them, which
 * at seed time it did for all 32 current franchises.
 *
 * ## What is deliberately absent, and why
 *
 * Following golf's precedent for durable-vs-live content:
 *
 *   - **No current MVP, no current standings, no current single-season
 *     leaders, no current Super Bowl champion.** All of it changes at least
 *     once a season, some of it weekly. The `modern` section describes the
 *     present eras in terms that stay true (rule changes, analytics,
 *     international games) and the Players and Teams tabs carry whoever is
 *     actually leading right now.
 *   - **No record numbers or record holders**, for the same reason golf left
 *     out career win totals for active players: a name attached to "most
 *     career passing yards" is one good season away from being wrong, and an
 *     Overview has no mechanism to refresh it. Records appear only as
 *     categories (`AMERICAN_FOOTBALL_CONCEPTS`, category `records`), pointing
 *     at Explainers and at the Players/Teams data rather than stating a
 *     number.
 *   - **No detailed mechanics**: downs and line-to-gain rules beyond the
 *     basic shape, the salary cap, the passer rating formula, RPOs,
 *     penalties, and the compensatory-pick formula. All of it is Explainer
 *     material, and `explainerSlug` is set optimistically on the relevant
 *     concepts even though none of those explainers exists yet, following the
 *     pattern the API already handles: a slug that resolves to nothing simply
 *     renders unlinked.
 *
 * ## On sourcing
 *
 * Dates were checked rather than recalled, and several are worth flagging
 * explicitly:
 *
 *   - **The 1869 Rutgers–Princeton game** is universally cited as the first
 *     intercollegiate football game, but by the rules of the day it was far
 *     closer to soccer than to what became American football; it is recorded
 *     here as the start of intercollegiate football broadly, not as the
 *     invention of the gridiron game, and is marked `approximate` for that
 *     reason.
 *   - **Walter Camp's rule changes** (the line of scrimmage, the snap, and
 *     downs) were introduced piecemeal through the 1880s rather than on one
 *     date. The timeline gives 1880 for the scrimmage/snap system and 1882
 *     for the first down-and-distance rule specifically, rather than
 *     compressing the decade into a single year.
 *   - **The forward pass** was legalized for the 1906 season, part of Theodore
 *     Roosevelt-era reforms following a wave of deaths and serious injuries in
 *     the sport; this is well documented and not marked uncertain.
 *   - **The American Professional Football Association**, founded in 1920,
 *     renamed itself the National Football League in 1922. Both dates are
 *     given, each described as what it actually was, the same treatment
 *     basketball gives the BAA/NBA founding dates.
 *   - **The first AFL–NFL World Championship Game**, played in January 1967,
 *     was not called "the Super Bowl" in its own broadcast or programme; that
 *     name came into common use over the following two seasons and was
 *     retroactively applied, with Super Bowl III (January 1969) usually cited
 *     as the point the branding was first used on the game itself. It is
 *     recorded here as the first title game, with the naming note attached
 *     rather than asserted as settled from game one.
 *   - **The AFL–NFL merger** was agreed in principle in 1966 and formally
 *     completed for the 1970 season, when the merged league adopted its
 *     current two-conference structure. Both dates matter and are kept
 *     distinct.
 *
 * Claims that could not be verified with confidence are omitted rather than
 * hedged: no attempt is made here to name a single "inventor" of American
 * football (unlike basketball's Naismith, its rules accreted from rugby and
 * association football over decades through multiple contributors), and no
 * global participation figure is given, because sources for it vary by a
 * large margin and none shows its working.
 *
 * ## Modelling notes specific to this sport
 *
 * `AMERICAN_FOOTBALL_FORMATS` is deliberately thin. Unlike cricket or
 * basketball, the sport does not have a meaningful format taxonomy in the
 * `SportFormat` sense: there is no equivalent of Test-vs-first-class or
 * 5-a-side-vs-3x3. What exists instead is a pathway of playing levels (high
 * school, college, professional) with different rules at each, and that is
 * modelled here as a shallow, single-level taxonomy rather than forced into a
 * deep tree it does not have.
 *
 * `AMERICAN_FOOTBALL_MEMBERSHIP` is omitted entirely. The NFL does not grade
 * its 32 members into classes the way the ICC grades Full and Associate
 * Members, so there is nothing for the `MembershipTiers` component to render.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const AMERICAN_FOOTBALL_SOURCES: SourceSeed[] = [
  {
    key: 'wp-american-football',
    provider: 'wikipedia',
    title: 'American football',
    url: 'https://en.wikipedia.org/wiki/American_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of American football',
    url: 'https://en.wikipedia.org/wiki/History_of_American_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rutgers-princeton',
    provider: 'wikipedia',
    title: '1869 Rutgers vs. Princeton football game',
    url: 'https://en.wikipedia.org/wiki/1869_Rutgers_vs._Princeton_football_game',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-walter-camp',
    provider: 'wikipedia',
    title: 'Walter Camp',
    url: 'https://en.wikipedia.org/wiki/Walter_Camp',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-forward-pass',
    provider: 'wikipedia',
    title: 'Forward pass',
    url: 'https://en.wikipedia.org/wiki/Forward_pass',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl',
    provider: 'wikipedia',
    title: 'National Football League',
    url: 'https://en.wikipedia.org/wiki/National_Football_League',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-afl',
    provider: 'wikipedia',
    title: 'American Football League',
    url: 'https://en.wikipedia.org/wiki/American_Football_League',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-super-bowl',
    provider: 'wikipedia',
    title: 'Super Bowl',
    url: 'https://en.wikipedia.org/wiki/Super_Bowl',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-super-bowl-i',
    provider: 'wikipedia',
    title: 'Super Bowl I',
    url: 'https://en.wikipedia.org/wiki/Super_Bowl_I',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-afl-nfl-merger',
    provider: 'wikipedia',
    title: 'AFL–NFL merger',
    url: 'https://en.wikipedia.org/wiki/AFL%E2%80%93NFL_merger',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl-playoffs',
    provider: 'wikipedia',
    title: 'NFL playoffs',
    url: 'https://en.wikipedia.org/wiki/NFL_playoffs',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-college-football',
    provider: 'wikipedia',
    title: 'College football',
    url: 'https://en.wikipedia.org/wiki/College_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-cfp',
    provider: 'wikipedia',
    title: 'College Football Playoff',
    url: 'https://en.wikipedia.org/wiki/College_Football_Playoff',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl-draft',
    provider: 'wikipedia',
    title: 'NFL draft',
    url: 'https://en.wikipedia.org/wiki/NFL_draft',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-free-agency',
    provider: 'wikipedia',
    title: 'Free agency (National Football League)',
    url: 'https://en.wikipedia.org/wiki/Free_agency_(National_Football_League)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-positions',
    provider: 'wikipedia',
    title: 'American football positions',
    url: 'https://en.wikipedia.org/wiki/American_football_positions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-field',
    provider: 'wikipedia',
    title: 'American football field',
    url: 'https://en.wikipedia.org/wiki/American_football_field',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-down',
    provider: 'wikipedia',
    title: 'Down (gridiron football)',
    url: 'https://en.wikipedia.org/wiki/Down_(gridiron_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-scoring',
    provider: 'wikipedia',
    title: 'American football scoring',
    url: 'https://en.wikipedia.org/wiki/American_football_scoring',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl-mvp',
    provider: 'wikipedia',
    title: 'NFL Most Valuable Player Award',
    url: 'https://en.wikipedia.org/wiki/NFL_Most_Valuable_Player_Award',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-all-pro',
    provider: 'wikipedia',
    title: 'All-Pro',
    url: 'https://en.wikipedia.org/wiki/All-Pro',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pro-bowl',
    provider: 'wikipedia',
    title: 'Pro Bowl',
    url: 'https://en.wikipedia.org/wiki/Pro_Bowl',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-hof',
    provider: 'wikipedia',
    title: 'Pro Football Hall of Fame',
    url: 'https://en.wikipedia.org/wiki/Pro_Football_Hall_of_Fame',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-cfl',
    provider: 'wikipedia',
    title: 'Canadian Football League',
    url: 'https://en.wikipedia.org/wiki/Canadian_Football_League',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-comparison',
    provider: 'wikipedia',
    title: 'Comparison of American and Canadian football',
    url: 'https://en.wikipedia.org/wiki/Comparison_of_American_and_Canadian_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl-international',
    provider: 'wikipedia',
    title: 'NFL International Series',
    url: 'https://en.wikipedia.org/wiki/NFL_International_Series',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-american-football',
    provider: 'wikidata',
    title: 'American football (Q41323)',
    url: 'https://www.wikidata.org/wiki/Q41323',
    externalId: 'Q41323',
    license: 'CC0',
  },
  {
    key: 'wd-nfl',
    provider: 'wikidata',
    title: 'National Football League (Q1215884)',
    url: 'https://www.wikidata.org/wiki/Q1215884',
    externalId: 'Q1215884',
    license: 'CC0',
  },
];

/**
 * Quick facts.
 *
 * Split into `identity` and `gameplay`, the same two categories golf and
 * basketball use, which is what makes the Overview page render a hero strip
 * and a separate at-a-glance grid rather than one undifferentiated block.
 */
export const AMERICAN_FOOTBALL_FACTS: FactSeed[] = [
  {
    key: 'sport-type',
    label: 'Sport type',
    value: 'Invasion team sport played on a marked field',
    category: 'identity',
    sourceKey: 'wp-american-football',
    order: 10,
  },
  {
    key: 'players-on-field',
    label: 'Players on field',
    value: '11 per team',
    category: 'identity',
    sourceKey: 'wp-american-football',
    order: 20,
  },
  {
    key: 'main-phases',
    label: 'Main phases',
    value: 'Offense, Defense, Special Teams',
    category: 'identity',
    sourceKey: 'wp-positions',
    order: 30,
  },
  {
    key: 'field-length',
    label: 'Field length',
    value: '100 yards between goal lines, plus a 10-yard end zone at each end',
    category: 'identity',
    sourceKey: 'wp-field',
    order: 40,
  },
  {
    key: 'main-league',
    label: 'Main professional league',
    value: 'NFL',
    category: 'identity',
    sourceKey: 'wp-nfl',
    order: 50,
  },
  {
    key: 'major-championship',
    label: 'Major championship',
    value: 'Super Bowl',
    category: 'identity',
    sourceKey: 'wp-super-bowl',
    order: 60,
  },
  {
    key: 'season-window',
    label: 'Typical NFL season',
    value: 'September to February',
    category: 'identity',
    sourceKey: 'wp-nfl',
    order: 70,
  },

  {
    key: 'objective',
    label: 'Objective',
    value: "Advance the ball into the opponent's end zone, or kick it through the goalposts",
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 110,
  },
  {
    key: 'game-length',
    label: 'Game length',
    value: 'Four quarters',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 120,
  },
  {
    key: 'downs',
    label: 'Downs',
    value: '4 attempts to advance 10 yards',
    category: 'gameplay',
    sourceKey: 'wp-down',
    order: 130,
  },
  {
    key: 'scoring-methods',
    label: 'Main scoring methods',
    value: 'Touchdown, Field Goal, Extra Point, Two-Point Conversion, Safety',
    category: 'gameplay',
    sourceKey: 'wp-scoring',
    order: 140,
  },
  {
    key: 'nfl-teams',
    label: 'NFL teams',
    value: '32, in two conferences of four divisions each',
    category: 'gameplay',
    sourceKey: 'wp-nfl',
    order: 150,
  },
  {
    key: 'championship-game',
    label: 'Championship',
    value: 'Super Bowl: AFC champion versus NFC champion',
    category: 'gameplay',
    sourceKey: 'wp-super-bowl',
    order: 160,
  },
];

/**
 * The timeline.
 *
 * Fifteen entries, each marking a change in what the sport was rather than a
 * notable result, following the standard this directory has kept for every
 * sport so far. `certainty` is used where the record genuinely is uncertain:
 * the 1869 game's status as an ancestor of the modern sport, and the point at
 * which "Super Bowl" became the game's own name rather than a name applied to
 * it after the fact.
 */
export const AMERICAN_FOOTBALL_TIMELINE: TimelineSeed[] = [
  {
    year: 1820,
    endYear: 1860,
    title: 'Early kicking and mob football games',
    shortDescription:
      'American colleges and towns played informal, rugby- and soccer-like mob football games through the early and mid nineteenth century, with rules that varied from campus to campus and often permitted or tolerated considerable violence. These games are predecessors rather than a direct line to the modern sport.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-history',
    order: 10,
  },
  {
    year: 1869,
    title: 'Rutgers versus Princeton',
    shortDescription:
      'Rutgers and Princeton played a match widely cited as the first intercollegiate football game, in New Brunswick, New Jersey. Played under rules closer to association football than to what the sport became, with 25 players a side and no forward pass or scrimmage system, it is best understood as the start of organized intercollegiate football rather than the invention of the gridiron game.',
    category: 'origins',
    certainty: 'approximate',
    isMajorMilestone: true,
    sourceKey: 'wp-rutgers-princeton',
    order: 20,
  },
  {
    year: 1876,
    title: 'The Intercollegiate Football Association forms',
    shortDescription:
      'Representatives of Harvard, Yale, Princeton and Columbia met to agree a common code, adopting rules closer to rugby football than to soccer, including running with the ball. It is the point at which American football began to diverge from both of its parent codes as a distinct game.',
    category: 'codification',
    sourceKey: 'wp-history',
    order: 30,
  },
  {
    year: 1880,
    title: 'Walter Camp introduces the line of scrimmage',
    shortDescription:
      'Walter Camp, a Yale player and later coach, proposed replacing rugby’s contested scrum with a line of scrimmage and a snap that gave one team clear possession to start each play. It is the single change most responsible for turning American football into a game of discrete, organized plays rather than continuous rugby-style contest for the ball, and it earned Camp the title "Father of American Football".',
    category: 'codification',
    isMajorMilestone: true,
    sourceKey: 'wp-walter-camp',
    order: 40,
  },
  {
    year: 1882,
    title: 'Downs and distance',
    shortDescription:
      "Camp's rule requiring a team to advance the ball a set distance within a set number of downs or surrender possession was adopted, first as five yards in three downs. The distance and down count have both changed since (ten yards in four downs is the modern standard), but the underlying mechanism, use-it-or-lose-it possession, has not.",
    category: 'codification',
    sourceKey: 'wp-down',
    order: 50,
  },
  {
    year: 1906,
    title: 'The forward pass is legalized',
    shortDescription:
      "Following a wave of deaths and serious injuries in college football and pressure from President Theodore Roosevelt for reform, the forward pass was legalized for the 1906 season. It did not become central to the sport immediately, but it is the rule that eventually separated American football's aerial game from rugby football's exclusively lateral and backward passing.",
    category: 'rules',
    isMajorMilestone: true,
    sourceKey: 'wp-forward-pass',
    order: 60,
  },
  {
    year: 1920,
    title: 'The American Professional Football Association is founded',
    shortDescription:
      'Representatives of several regional professional teams met in Canton, Ohio, and formed the American Professional Football Association, the direct ancestor of the NFL. Jim Thorpe served as its first president.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-nfl',
    order: 70,
  },
  {
    year: 1922,
    title: 'Renamed the National Football League',
    shortDescription:
      'The APFA renamed itself the National Football League. Both 1920 and 1922 are cited as the league’s founding for that reason: 1920 is when the organization began, 1922 is when it took the name it still carries.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-nfl',
    order: 80,
  },
  {
    year: 1933,
    endYear: 1958,
    title: 'The NFL grows into a national league',
    shortDescription:
      'The league expanded and stabilized through the 1930s to 1950s, introducing a championship game structure, growing its franchises beyond their original regional clusters, and beginning to draw a national broadcast audience by the late 1950s.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-nfl',
    order: 90,
  },
  {
    year: 1960,
    title: 'The American Football League begins play',
    shortDescription:
      'A rival professional league launched with eight teams, competing directly with the NFL for players and television revenue. Several AFL franchises, including the Chiefs, Bills, Jets, Chargers and Broncos, remain NFL teams today.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-afl',
    order: 100,
  },
  {
    year: 1967,
    title: 'The first AFL–NFL World Championship Game',
    shortDescription:
      'The champions of the NFL and the AFL met for the first time, with Green Bay beating Kansas City. The game was not marketed as "the Super Bowl" at the time; that name came into common use over the following two seasons and is usually said to have first appeared on the game itself for the third edition in January 1969. The first two games were retroactively renamed Super Bowl I and II.',
    category: 'competition',
    certainty: 'approximate',
    isMajorMilestone: true,
    sourceKey: 'wp-super-bowl-i',
    order: 110,
  },
  {
    year: 1970,
    title: 'The AFL–NFL merger is completed',
    shortDescription:
      'Agreed in principle in 1966, the merger of the two leagues took full effect for the 1970 season, with the combined league reorganized into the American and National Football Conferences that still exist today, and the former AFL teams forming the core of the AFC.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-afl-nfl-merger',
    order: 120,
  },
  {
    year: 1970,
    endYear: 1999,
    title: 'The NFL becomes the dominant American sport',
    shortDescription:
      'Television revenue, Monday Night Football, and the Super Bowl’s growth into the most-watched annual broadcast event in the United States moved the NFL from one of several major sports to the country’s most-watched, a position it has held since.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-nfl',
    order: 130,
  },
  {
    year: 2000,
    endYear: 2026,
    title: 'Analytics, replay and rule changes reshape the modern game',
    shortDescription:
      'Instant replay review, advanced statistical analysis of play-calling, and rule changes aimed at player safety and increased scoring all became central to how the sport is coached and officiated over this period. The passing game in particular grew substantially more prominent relative to the running game than in earlier eras.',
    category: 'evolution',
    certainty: 'approximate',
    sourceKey: 'wp-american-football',
    order: 140,
  },
  {
    year: 2007,
    endYear: 2026,
    title: 'International games and global expansion',
    shortDescription:
      "The NFL began playing regular-season games outside the United States, starting in London in 2007 and later expanding to other UK cities, Germany, Mexico, Brazil and Spain, as part of a deliberate effort to grow the sport's international audience.",
    category: 'global',
    certainty: 'approximate',
    isMajorMilestone: true,
    sourceKey: 'wp-nfl-international',
    order: 150,
  },
];

/**
 * Governance.
 *
 * See the file-level doc comment for why the NFL sits at `world` level with
 * the AFC and NFC beneath it at `continental`, despite neither pair being a
 * governing-body relationship in the sense the schema was built for, and why
 * the eight divisions are not seeded as a third tier.
 */
export const AMERICAN_FOOTBALL_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'nfl',
    shortName: 'NFL',
    name: 'National Football League',
    level: 'world',
    foundedYear: 1920,
    memberCount: 32,
    headquarters: 'New York City, United States',
    websiteUrl: 'https://www.nfl.com',
    externalId: 'Q1215884',
    order: 10,
  },
  {
    slug: 'afc',
    shortName: 'AFC',
    name: 'American Football Conference',
    level: 'continental',
    parentSlug: 'nfl',
    region: 'American Football Conference: East, North, South and West divisions',
    memberCount: 16,
    order: 20,
  },
  {
    slug: 'nfc',
    shortName: 'NFC',
    name: 'National Football Conference',
    level: 'continental',
    parentSlug: 'nfl',
    region: 'National Football Conference: East, North, South and West divisions',
    memberCount: 16,
    order: 30,
  },
];

/**
 * Formats.
 *
 * Thin by design; see the file-level doc comment. This is a pathway of
 * playing levels rather than a taxonomy of match types, so `matchClass` marks
 * the level and most of the cricket-specific numeric fields go unused.
 */
export const AMERICAN_FOOTBALL_FORMATS: FormatSeed[] = [
  {
    key: 'high-school',
    label: 'High school football',
    matchClass: 'amateur',
    isInternational: false,
    description:
      'Played under state association rules that vary in detail (game length, clock rules, playoff structure) from state to state. The most common entry point into the sport in the United States.',
    conditionsAuthority: 'state association',
    sourceKey: 'wp-american-football',
    order: 10,
  },
  {
    key: 'college',
    label: 'College football',
    matchClass: 'amateur',
    isInternational: false,
    description:
      'Played under NCAA rules (or, for a minority of programs, NAIA rules), organized into divisions and conferences rather than a single national league, and the main development pathway into the NFL.',
    conditionsAuthority: 'ncaa',
    sourceKey: 'wp-college-football',
    order: 20,
  },
  {
    key: 'professional',
    label: 'Professional football',
    matchClass: 'professional',
    isInternational: false,
    description:
      'The NFL is the dominant professional league. Smaller professional and developmental leagues have existed alongside it at various times, none matching its scale or longevity.',
    conditionsAuthority: 'league',
    sourceKey: 'wp-nfl',
    order: 30,
  },
];

/**
 * The vocabulary.
 *
 * One or two sentences each, the same register golf and basketball use.
 * `explainerSlug` is set optimistically throughout: none of these Explainers
 * exists yet, and the API drops a link to a slug that does not resolve rather
 * than rendering a broken one, so naming the destination now is safe.
 */
export const AMERICAN_FOOTBALL_CONCEPTS: ConceptSeed[] = [
  {
    key: 'down',
    term: 'Down',
    summary:
      'One play from scrimmage. An offense gets four downs to advance the ball 10 yards or forfeit possession.',
    category: 'gameplay',
    explainerSlug: 'downs-and-distance',
    sourceKey: 'wp-down',
    order: 10,
  },
  {
    key: 'first-down',
    term: 'First down',
    summary:
      'A new set of four downs, earned by advancing the ball 10 yards from where the previous set began.',
    category: 'gameplay',
    explainerSlug: 'downs-and-distance',
    sourceKey: 'wp-down',
    order: 20,
  },
  {
    key: 'snap',
    term: 'Snap',
    summary:
      'The action that starts a play: the center passes the ball backward, usually to the quarterback, from the line of scrimmage.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 30,
  },
  {
    key: 'line-of-scrimmage',
    term: 'Line of scrimmage',
    summary:
      "An imaginary line across the field at the ball's position, which both teams line up behind before each play.",
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 40,
  },
  {
    key: 'drive',
    term: 'Drive',
    summary:
      "A team's sequence of downs while it holds possession, ending in a score, a punt, a turnover, or the end of a half.",
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 50,
  },
  {
    key: 'possession',
    term: 'Possession',
    summary:
      'Control of the ball. Unlike in continuously flowing sports, possession in football changes hands only at defined moments: a punt, a turnover, a score, or the end of a half.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 60,
  },
  {
    key: 'turnover',
    term: 'Turnover',
    summary:
      'A change of possession caused by the offense losing the ball: an interception or a fumble recovered by the defense.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 70,
  },
  {
    key: 'touchdown',
    term: 'Touchdown',
    summary:
      "Worth 6 points, scored by advancing the ball into the opponent's end zone, whether by carrying, catching, or recovering it there.",
    category: 'scoring',
    explainerSlug: 'how-scoring-works',
    sourceKey: 'wp-scoring',
    order: 80,
  },
  {
    key: 'field-goal',
    term: 'Field goal',
    summary:
      "Worth 3 points, scored by kicking the ball through the opponent's goalposts, usually attempted on fourth down when a touchdown looks unlikely.",
    category: 'scoring',
    explainerSlug: 'how-scoring-works',
    sourceKey: 'wp-scoring',
    order: 90,
  },
  {
    key: 'quarterback',
    term: 'Quarterback',
    summary:
      'The offensive player who usually takes the snap and directs the play: handing off, passing, or running with the ball.',
    category: 'role',
    explainerSlug: 'quarterback-explained',
    sourceKey: 'wp-positions',
    order: 100,
  },
  {
    key: 'receiver',
    term: 'Receiver',
    summary: 'An offensive player whose main role is catching passes.',
    category: 'role',
    explainerSlug: 'american-football-positions-explained',
    sourceKey: 'wp-positions',
    order: 110,
  },
  {
    key: 'running-back',
    term: 'Running back',
    summary:
      'An offensive player who lines up behind the quarterback and specializes in running with the ball.',
    category: 'role',
    explainerSlug: 'american-football-positions-explained',
    sourceKey: 'wp-positions',
    order: 120,
  },
  {
    key: 'sack',
    term: 'Sack',
    summary:
      'A defensive tackle of the quarterback behind the line of scrimmage before a pass is thrown.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 130,
  },
  {
    key: 'interception',
    term: 'Interception',
    summary:
      'A pass caught by a defensive player instead of the intended receiver, turning possession over immediately.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 140,
  },
  {
    key: 'fumble',
    term: 'Fumble',
    summary:
      'A loss of control of the ball by the player carrying it, which either team may then recover to gain or keep possession.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 150,
  },
  {
    key: 'punt',
    term: 'Punt',
    summary:
      'A kick, usually on fourth down, that surrenders possession to the opponent while pushing them further from the scoring end of the field.',
    category: 'gameplay',
    sourceKey: 'wp-american-football',
    order: 160,
  },
  {
    key: 'red-zone',
    term: 'Red zone',
    summary:
      "The area of the field from the opponent's 20-yard line to their goal line, where scoring becomes the immediate expectation.",
    category: 'gameplay',
    sourceKey: 'wp-field',
    order: 170,
  },
  {
    key: 'end-zone',
    term: 'End zone',
    summary:
      'The 10-yard-deep scoring area at each end of the field; reaching it with the ball is a touchdown.',
    category: 'area',
    sourceKey: 'wp-field',
    order: 180,
  },
  {
    key: 'blitz',
    term: 'Blitz',
    summary:
      'A defensive tactic that sends extra pass rushers at the quarterback beyond the usual defensive line.',
    category: 'tactics',
    explainerSlug: 'blitz-explained',
    sourceKey: 'wp-american-football',
    order: 190,
  },
  {
    key: 'penalty',
    term: 'Penalty',
    summary:
      'A rule infraction that costs the offending team yardage, a down, or both. Football has a large number of specific penalties, each with its own yardage.',
    category: 'gameplay',
    explainerSlug: 'penalties',
    sourceKey: 'wp-american-football',
    order: 200,
  },
];

/**
 * Authored sections.
 *
 * Written for SportBrainHQ from verified facts, in the same plain register the
 * other sports in this directory use. Detailed mechanics (down-and-distance
 * arithmetic beyond the basic shape, the salary cap, passer rating, RPOs, the
 * full penalty list, compensatory draft picks) are named but not taught: that
 * is deliberately the Explainers' job.
 */
export const AMERICAN_FOOTBALL_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is American football?',
    order: 10,
    body: `American football is a team sport played between two sides of eleven, on a rectangular field with a scoring zone at each end. The object is to advance an oval ball into the opponent's end zone, primarily by running with it or throwing it forward to a teammate, or to kick it through the opponent's goalposts.

What makes the game distinctive is its structure. Play is not continuous: it happens in a sequence of discrete plays, each starting from a fixed line of scrimmage and ending when the ball carrier is tackled, goes out of bounds, or scores. Between plays, both teams reset, substitute players freely, and the offense calls its next play. That stop-start rhythm is what makes American football look so different from the continuously flowing team sports it distantly descends from.

The team on offense has four attempts, called **downs**, to advance the ball ten yards. Succeeding earns a new set of downs; failing surrenders the ball to the opponent. That single rule, four downs to gain ten yards, is the mechanism the whole sport is built around, and nearly everything else, formations, play-calling, strategy, follows from it.

American football is largely a sport of the United States, where it is the most-watched spectator sport, with a professional season built around the **NFL** and an amateur pathway running through high school and college football. It has a growing international following, and a related but distinct code, Canadian football, is played professionally in Canada.`,
  },
  {
    kind: 'glance',
    heading: 'American football at a glance',
    order: 20,
    body: `**Teams.** Eleven players a side on the field at once, drawn from much larger rosters: NFL teams carry 53 players and substitute constantly between plays.

**Objective.** Score more points than the opponent by advancing the ball into their end zone or kicking it through their goalposts.

**Game length.** Four quarters, with a break at halftime.

**Possession.** Held by one team at a time, and changed only at defined moments: a punt, a turnover, a score, or the end of a half. This is unlike sports where the ball changes hands continuously during play.

**Downs.** The offense has four attempts to advance the ball ten yards. Succeeding resets the count; failing gives the ball to the opponent.

**Scoring.** Touchdowns, field goals, extra points, two-point conversions and safeties, worth different amounts of points and covered in more detail below.

**The NFL.** Thirty-two teams, split into two conferences of four divisions each.

**Championship.** The Super Bowl, contested between the champions of the NFL's two conferences.`,
  },
  {
    kind: 'field',
    heading: 'The field',
    order: 30,
    body: `A regulation field runs 120 yards long and 53⅓ yards wide. The **playing field** between the two **goal lines** is 100 yards, with a 10-yard **end zone** beyond each goal line, which is where the field's full length of 120 yards comes from.

**Sidelines** and **end lines** mark the field's outer boundary; going out of bounds stops play where the ball carrier left the field. A **50-yard line** sits at the field's midpoint, with **yard markers** every 10 yards on either side counting down toward each end zone. **Hash marks** running the length of the field mark where the ball is placed to start a play when the previous one ended near a sideline, keeping the field's width usable. **Goalposts** stand at the back of each end zone, used for field goals and extra points.

The **red zone**, the area from the opponent's 20-yard line to their goal line, is where possessions are expected to turn into points, and it gets disproportionate attention in coverage and analysis for that reason.

This is a brief description rather than a full account of field markings and positioning rules, which belong in an Explainer.`,
  },
  {
    kind: 'basics',
    heading: 'How a game works',
    order: 40,
    body: `Possession alternates between the two teams over the course of a game, governed by the down system. The team with the ball, the **offense**, has four downs to advance it ten yards from the **line of scrimmage**, the point on the field where the current play begins. Advancing the required distance earns a new set of four downs; failing to do so within four attempts surrenders the ball to the opponent, usually by choice: a team facing a difficult fourth down typically punts the ball away or attempts a field goal rather than risk losing possession in a bad field position.

Each play starts with a **snap**, the center passing the ball backward, usually to the quarterback, and ends when the ball carrier is tackled, steps out of bounds, scores, or the play is otherwise ruled dead. The quarterback may hand the ball off to a running back, throw it forward to a receiver (a forward pass is legal only from behind the line of scrimmage, and only one per play), run with it themselves, or execute a play designed around any combination of those options.

Between plays, both teams huddle or communicate their next call, substitute players as needed, and reset at the line of scrimmage. That reset is what gives American football its stop-start character and makes it, uniquely among major team sports, a game built around discrete, individually planned plays rather than continuous flow.`,
  },
  {
    kind: 'units',
    heading: 'Offense, defense and special teams',
    order: 50,
    body: `A team fields three distinct units, each with its own personnel and its own job, and substitutes freely between them as the situation demands.

**Offense** aims to advance the ball and score. Its key positions include the **quarterback (QB)**, who directs the play; **running backs (RB)**, who carry the ball and block; **wide receivers (WR)** and **tight ends (TE)**, who catch passes; and the offensive line, **offensive tackles (OT)**, **offensive guards (OG)** and the **center (C)**, who block for the passer and the ball carrier and rarely touch the ball themselves.

**Defense** aims to stop the offense and force a turnover or a punt. Its key positions include **defensive tackles (DT)** and **defensive ends** or **edge rushers**, who occupy the offensive line and pressure the passer; **linebackers (LB)**, who defend against both the run and the pass from just behind the line; and **cornerbacks (CB)** and **safeties (S)**, who cover receivers and defend the deeper parts of the field.

**Special teams** handle kicks: the **kicker**, who attempts field goals and extra points and kicks off; the **punter**, who kicks the ball away on fourth down to change field position; the **long snapper**, a specialist who snaps the ball on kicking plays; **kick and punt returners**, who try to advance the ball after receiving a kick; and the **coverage units**, whose job is to prevent exactly that.`,
  },
  {
    kind: 'scoring',
    heading: 'Scoring',
    order: 60,
    body: `**Touchdown, 6 points.** Scored by advancing the ball into the opponent's end zone, whether by running it in, catching a pass there, or recovering a loose ball there. The most valuable and most common way to score.

**Extra point, usually 1 point.** A short kick attempted after a touchdown. Nearly always successful at the professional level, which is why it is treated as a near-automatic addition rather than a genuine scoring play in its own right.

**Two-point conversion, 2 points.** An alternative to the extra point, attempted from close range as a single offensive play rather than a kick. Chosen far less often than the extra point, typically when the score situation calls for it.

**Field goal, 3 points.** A kick through the opponent's goalposts, attempted from anywhere on the field but realistically limited by the kicker's range, most often used on fourth down when a touchdown looks unlikely.

**Safety, 2 points.** Scored by the defense when it tackles an offensive ball carrier in their own end zone, or when the offense commits certain fouls there. Rare, and it also gives the scoring team possession afterward via a free kick.

This is a brief outline. The rules covering blocked kicks, onside kicks, and the exact circumstances that produce each type of score are Explainer material.`,
  },
  {
    kind: 'nfl-structure',
    heading: 'The NFL',
    order: 70,
    body: `The NFL is organized into two conferences, the **American Football Conference (AFC)** and the **National Football Conference (NFC)**, each containing four divisions of four teams: **East, North, South and West**. This is a competition structure rather than a governing hierarchy in the sense that FIFA sits above football or FIBA above basketball: the NFL is itself the competition its 32 member clubs play in, not a separate body regulating an independent league.

**AFC East:** Buffalo Bills, Miami Dolphins, New England Patriots, New York Jets.
**AFC North:** Baltimore Ravens, Cincinnati Bengals, Cleveland Browns, Pittsburgh Steelers.
**AFC South:** Houston Texans, Indianapolis Colts, Jacksonville Jaguars, Tennessee Titans.
**AFC West:** Denver Broncos, Kansas City Chiefs, Las Vegas Raiders, Los Angeles Chargers.

**NFC East:** Dallas Cowboys, New York Giants, Philadelphia Eagles, Washington Commanders.
**NFC North:** Chicago Bears, Detroit Lions, Green Bay Packers, Minnesota Vikings.
**NFC South:** Atlanta Falcons, Carolina Panthers, New Orleans Saints, Tampa Bay Buccaneers.
**NFC West:** Arizona Cardinals, Los Angeles Rams, San Francisco 49ers, Seattle Seahawks.

Division and conference groupings reflect scheduling and playoff qualification rather than geography alone; several "divisions" contain teams that are not close neighbours, and realignments have happened before.`,
  },
  {
    kind: 'season',
    heading: 'The NFL season cycle',
    order: 80,
    body: `An NFL year runs on a recurring annual cycle rather than a single continuous season. Broadly, in order: an **offseason** of roster building and coaching changes; the **scouting combine**, where draft-eligible prospects are tested and evaluated; **free agency**, when teams sign players whose contracts have expired; the **draft**, when teams select new players from the college ranks; **training camp**, where rosters are built and trimmed to their final size; the **preseason**, a handful of exhibition games; the **regular season**, running from September to early January; the **playoffs**, a knockout tournament among the top teams from each conference; and the **Super Bowl**, the season's championship game.

The exact number of games, the calendar dates, and the format of each stage have all changed over the league's history and continue to be adjusted, so this page describes the shape of the cycle rather than its current specifics.`,
  },
  {
    kind: 'standings',
    heading: 'Reading the standings',
    order: 90,
    body: `Teams are ranked within their division and conference using a small set of terms that appear on every standings table: **W** (wins), **L** (losses) and **T** (ties, which are rare and settled by an overtime period that can still end level). **PCT** is winning percentage, the usual basis for ranking. **PF** and **PA** are points scored for and against, and **DIFF** is the difference between them, often used as a tiebreaker or a rough measure of a team's underlying strength.

This section names the vocabulary rather than the current numbers behind it, which change every week of the season and belong on the Teams tab.`,
  },
  {
    kind: 'playoffs',
    heading: 'The playoffs and the Super Bowl',
    order: 100,
    body: `Seven teams from each conference qualify for the playoffs: the four division winners and three additional wild-card teams with the next-best records. The top seed in each conference earns a bye through the first round.

The bracket runs through three rounds within each conference, the **Wild Card round**, the **Divisional round** and the **Conference Championship**, before the two conference champions meet in the **Super Bowl**. Every round is single-elimination.

The **Super Bowl** is the NFL's championship game, played between the AFC champion and the NFC champion at a neutral, pre-selected site rather than at either finalist's home stadium, which is unusual among major sports and part of what has made it as much a standalone national event as a sports fixture. Its current champion, most valuable player, and historical records are covered on the Super Bowl competition page and the Teams and Players tabs rather than here, since they change every year.`,
  },
  {
    kind: 'college',
    heading: 'College football',
    order: 110,
    body: `College football is a large, largely separate ecosystem from the NFL, organized under the **NCAA** (with a smaller number of programs under the NAIA) into divisions and dozens of conferences rather than one national league. Major conferences have historically anchored the sport's biggest programs, though conference membership has been unusually unstable in recent years as realignment driven by television revenue continues to reshape which schools play in which conference; any specific list of conference membership risks going stale quickly for that reason.

The sport culminates in **bowl games**, a long tradition of postseason exhibition and championship matchups, and in the **College Football Playoff**, a knockout tournament among the season's top-ranked teams that determines the national champion.

College football is also the sport's principal development pathway: the typical route into professional football runs from **high school**, through **college**, to the **NFL Draft** and the NFL itself, though it is not the only route, and a growing number of players have taken alternative paths through developmental leagues.`,
  },
  {
    kind: 'draft',
    heading: 'The NFL Draft',
    order: 120,
    body: `The draft is the NFL's primary mechanism for adding new players, held annually and open mainly to college players who have exhausted their eligibility or otherwise declared. Teams select players in turn across several rounds, with the draft order generally running in reverse order of the previous season's standings, so that weaker teams pick earlier.

Draft picks can be traded between teams, independently of the players eventually selected with them, which makes draft-day trading a significant part of team-building strategy in its own right. The detailed mechanics, including compensatory picks awarded for player losses in free agency, are Explainer material rather than an Overview topic.`,
  },
  {
    kind: 'movement',
    heading: 'Free agency and trades',
    order: 130,
    body: `Players move between NFL teams chiefly through **free agency** (signing with a new team once their contract expires), **trades** (teams exchanging players, draft picks, or both), the **draft**, and occasionally **waivers**, a mechanism for teams to claim players released by another club.

All of this operates within a **salary cap**, a league-wide limit on what a team may spend on player contracts each year, and teams may apply a **franchise tag** to retain a single impending free agent for one season at a set price rather than let them reach the open market. Both concepts are real constraints on how rosters are built, and both are covered properly in the Explainers rather than here.`,
  },
  {
    kind: 'awards',
    heading: 'Major awards',
    order: 140,
    body: `Football's major individual honors are given at the end of each season and recognize different things, which is worth being precise about.

The **NFL Most Valuable Player (MVP)** and the **Offensive** and **Defensive Player of the Year** awards recognize a single standout season, voted on by media panels. The **Offensive** and **Defensive Rookie of the Year** awards do the same for first-year players, and the **Comeback Player of the Year** recognizes a player's return to form after injury or a difficult season. The **Coach of the Year** award recognizes coaching rather than playing performance. The **Super Bowl MVP** is awarded for a single game rather than a season, to the standout player of the championship itself.

**All-Pro** and **Pro Bowl** are not the same kind of honor as the ones above. All-Pro is an end-of-season honor team, voted by media, naming the best players at each position across the whole league for that year; making it is a significant career marker. The Pro Bowl is an annual all-star exhibition game, and selection to it, while an honor, is a lower bar than All-Pro and reflects a wider, fan- and player-influenced vote rather than a strict assessment of who had the best season.`,
  },
  {
    kind: 'records',
    heading: 'Records',
    order: 150,
    body: `American football keeps extensive statistical records across career and single-season categories: passing, rushing and receiving yards and touchdowns; sacks and interceptions on defense; and team records for wins, championships and winning streaks, along with a further set of postseason and Super Bowl-specific records.

None of the actual record figures or record-holders are listed on this page. Career and single-season records are the numbers most likely to be broken within a season, and a name printed here as a record-holder can be wrong within a single Sunday. The categories exist so a reader knows what kind of record to look for; the current holders and figures live on the relevant Player and Team pages, and the history behind notable records is Explainer material.`,
  },
  {
    kind: 'comparison',
    heading: 'American football and other football codes',
    order: 160,
    body: `Several sports share the name "football" or a common ancestry, and the terminology is a frequent source of confusion.

**American football**, played chiefly in the United States under NFL and NCAA rules, and **Canadian football**, played professionally in Canada under CFL rules, are closely related codes with a shared ancestry and broadly similar equipment, but differing rules: a larger field, three downs instead of four, twelve players a side, and other differences covered properly elsewhere. **Association football**, usually just called football or soccer outside North America, is a different sport entirely, played with the feet and without the down-and-distance system. **Rugby union** and **rugby league** are the two codes American football itself descended from in the nineteenth century, and both remain live sports today, each with rules of its own that have diverged further from American football's since the split.

This section exists purely to keep the names straight, not to compare the sports in depth.`,
  },
  {
    kind: 'global',
    heading: 'American football around the world',
    order: 170,
    body: `The United States is by a wide margin the sport's largest market, both for participation and for the NFL's audience. **Canada** has its own major professional culture around Canadian football and the CFL, a distinct code rather than a variant of the American game.

Interest in the NFL specifically has grown outside North America, with **Mexico** an especially large and longstanding following, and **Germany** and the **United Kingdom** now significant international markets, both regularly hosting **NFL International Series** games as part of the league's deliberate effort to build audiences abroad. Participation and fan interest exist in many other regions as well, at a smaller scale.

This is a description of where the sport has a presence, not a ranking of markets by size, since reliable comparative figures are not available across all of them.`,
  },
];

/**
 * Featured entities: teams and legends.
 *
 * All 32 current NFL franchises are resolved to real `team` rows by slug
 * rather than written as flat text, per the brief. Slugs below were checked
 * against the database at authoring time and all 32 resolved cleanly; the
 * `slug` field stays optimistic in the usual pattern in case ingestion
 * changes a slug later; the card still renders from `name` if a lookup ever
 * fails to resolve.
 *
 * The `icons` list is franchises with outsized historical significance
 * (Packers, Steelers, Cowboys, 49ers, Patriots, Chiefs, Giants, Raiders,
 * Bears) plus position-by-position legends, deliberately titled and blurbed
 * to avoid "greatest ever" framing, following golf's and basketball's
 * precedent: career-defining facts, dated, not superlatives. No active or
 * recently active player appears here; the brief is explicit that modern
 * stars belong entirely to the live Players tab, and this page does not
 * simulate that data.
 */
export const AMERICAN_FOOTBALL_FEATURED: FeaturedEntitySeed[] = [
  // ── Legendary franchises, chronological rather than ranked ──────────────
  {
    section: 'teams',
    entityType: 'team',
    slug: 'green-bay-packers',
    name: 'Green Bay Packers',
    meta: 'NFL, founded 1919',
    blurb:
      'The most successful franchise of the pre-Super Bowl era under Vince Lombardi, winning five NFL championships in seven years in the 1960s, including the first two Super Bowls.',
    order: 10,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'chicago-bears',
    name: 'Chicago Bears',
    meta: 'NFL, founded 1919',
    blurb:
      'One of the league’s two oldest continuously operating franchises, with a long championship history stretching from the 1920s through the dominant 1985 team.',
    order: 20,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'new-york-giants',
    name: 'New York Giants',
    meta: 'NFL, founded 1925',
    blurb:
      'A charter member of the modern NFL era with four Super Bowl titles, including two upset wins over previously unbeaten New England Patriots teams.',
    order: 30,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'pittsburgh-steelers',
    name: 'Pittsburgh Steelers',
    meta: 'NFL, founded 1933',
    blurb:
      'Built the "Steel Curtain" defense of the 1970s and won four Super Bowls in six seasons, a run matched by few teams since.',
    order: 40,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'las-vegas-raiders',
    name: 'Las Vegas Raiders',
    meta: 'NFL, founded 1960 (as Oakland Raiders)',
    blurb:
      'An original AFL franchise known for a defiant, hard-edged identity under longtime owner Al Davis, with three Super Bowl titles across three different home cities.',
    order: 50,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'dallas-cowboys',
    name: 'Dallas Cowboys',
    meta: 'NFL, founded 1960',
    blurb:
      'Branded "America’s Team" in the 1970s, with five Super Bowl titles including three in four seasons in the early 1990s.',
    order: 60,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'san-francisco-49ers',
    name: 'San Francisco 49ers',
    meta: 'NFL, founded 1946',
    blurb:
      'Defined the West Coast offense era of the 1980s and 1990s under Bill Walsh and Joe Montana, winning five Super Bowls.',
    order: 70,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'new-england-patriots',
    name: 'New England Patriots',
    meta: 'NFL, founded 1960',
    blurb:
      'Won six Super Bowls between 2001 and 2018 under head coach Bill Belichick and quarterback Tom Brady, the most successful sustained run in the Super Bowl era.',
    order: 80,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'kansas-city-chiefs',
    name: 'Kansas City Chiefs',
    meta: 'NFL, founded 1960',
    blurb:
      'An original AFL franchise and Super Bowl IV winner that returned to sustained championship contention in the late 2010s and 2020s.',
    order: 90,
  },

  // ── Legends by position, chronological rather than ranked ───────────────
  {
    section: 'icons',
    entityType: 'person',
    slug: 'johnny-unitas',
    name: 'Johnny Unitas',
    meta: 'QB, Baltimore Colts · 1956–1973',
    blurb:
      'Set the template for the modern quarterback position and led the Colts to victory in the 1958 NFL Championship Game, often called the game that made professional football popular nationally.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jim-brown',
    name: 'Jim Brown',
    meta: 'RB, Cleveland Browns · 1957–1965',
    blurb:
      'Retired at the peak of his career after nine seasons, having led the NFL in rushing yards in eight of them.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'joe-montana',
    name: 'Joe Montana',
    meta: 'QB, San Francisco 49ers, Kansas City Chiefs · 1979–1994',
    blurb:
      'Won four Super Bowls with the 49ers without ever throwing a postseason interception in any of them, and won three Super Bowl MVP awards.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'walter-payton',
    name: 'Walter Payton',
    meta: 'RB, Chicago Bears · 1975–1987',
    blurb:
      'Known as "Sweetness," combined durability and all-around skill across thirteen seasons and gives his name to the NFL’s annual award for community service and excellence.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lawrence-taylor',
    name: 'Lawrence Taylor',
    meta: 'LB, New York Giants · 1981–1993',
    blurb:
      'Redefined the outside linebacker position as a dedicated pass rusher, and is the only defensive player to win the NFL Most Valuable Player award outright in the Super Bowl era.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jerry-rice',
    name: 'Jerry Rice',
    meta: 'WR, San Francisco 49ers, Oakland Raiders · 1985–2004',
    blurb:
      'Played twenty seasons and set career receiving records that stood for decades, on the strength of a rare combination of longevity and route-running precision.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'barry-sanders',
    name: 'Barry Sanders',
    meta: 'RB, Detroit Lions · 1989–1998',
    blurb:
      'Retired unexpectedly at the height of his powers, having rushed for over 1,000 yards in every one of his ten NFL seasons.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'reggie-white',
    name: 'Reggie White',
    meta: 'DE, Philadelphia Eagles, Green Bay Packers · 1985–2000',
    blurb:
      'Known as the "Minister of Defense," combined size and speed as a pass rusher across fifteen seasons and won a Super Bowl with the Packers.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'emmitt-smith',
    name: 'Emmitt Smith',
    meta: 'RB, Dallas Cowboys, Arizona Cardinals · 1990–2004',
    blurb:
      'Won three Super Bowls with the Cowboys in the 1990s and retired as the NFL’s career rushing leader.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'deion-sanders',
    name: 'Deion Sanders',
    meta: 'CB, multiple teams · 1989–2005',
    blurb:
      'Widely regarded as one of the most complete cover cornerbacks the position has produced, and one of a small number of players to also play Major League Baseball.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'ray-lewis',
    name: 'Ray Lewis',
    meta: 'LB, Baltimore Ravens · 1996–2012',
    blurb:
      'The defensive anchor of two Super Bowl-winning Baltimore Ravens defenses across a seventeen-season career, and Super Bowl XXXV MVP.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'randy-moss',
    name: 'Randy Moss',
    meta: 'WR, multiple teams · 1998–2012',
    blurb:
      'Set the single-season touchdown reception record with New England in 2007, on a combination of size, speed and jumping ability that redefined what a deep receiving threat looked like.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'adam-vinatieri',
    name: 'Adam Vinatieri',
    meta: 'K, New England Patriots, Indianapolis Colts · 1996–2019',
    blurb:
      'Kicked series-deciding field goals in two of New England’s early Super Bowl wins and played into his mid-forties, longer than almost any player at any position.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'anthony-munoz',
    name: 'Anthony Muñoz',
    meta: 'OT, Cincinnati Bengals · 1980–1992',
    blurb:
      'Widely regarded as one of the finest offensive tackles to play the position, selected to eleven Pro Bowls across thirteen seasons.',
    order: 140,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'tom-brady',
    name: 'Tom Brady',
    meta: 'QB, New England Patriots, Tampa Bay Buccaneers · 2000–2022',
    blurb:
      'Won seven Super Bowls across twenty-three seasons, more than any other player, with two different franchises.',
    order: 150,
  },

  // ── Major competitions ────────────────────────────────────────────────
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'Super Bowl',
    meta: 'NFL championship game · since 1967',
    blurb:
      'The NFL’s championship game between the AFC and NFC champions, and the most-watched annual broadcast event in the United States.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'College Football Playoff',
    meta: 'College, United States',
    blurb:
      'A knockout tournament among the season’s top-ranked college teams that determines the national champion.',
    order: 20,
  },
];
