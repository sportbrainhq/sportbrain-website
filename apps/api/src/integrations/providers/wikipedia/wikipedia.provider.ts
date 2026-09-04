import { Injectable } from '@nestjs/common';
import { WikipediaClient } from './wikipedia.client';
import {
  TENNIS_OTHER_TITLE_FIELDS,
  TENNIS_SLAM_FIELDS,
} from '../../../database/seed/tennis-competitions';
import { GOLF_MAJOR_FIELDS, GOLF_WIN_COUNT_FIELDS } from '../../../database/seed/golf-competitions';
import {
  findTableByHeading,
  parseDefinitionLists,
  parseInfobox,
  parseNumber,
  parseAllTimeRoster,
  parseChampionColumn,
  parseNbaChampions,
  parseNbaLeaderList,
  parseNbaSeasonList,
  parseTournamentFinal,
  type CareerHighlight,
  parseCareerHighlights,
  parseTables,
  type Infobox,
  type ParsedList,
  type ParsedTable,
} from './wikipedia.parser';

/**
 * Drops a parenthetical from a table cell.
 *
 * Records tables routinely carry two numbers in one cell: "450 (438)" is 450
 * goals in 438 appearances, "963 (161)" is 963 appearances of which 161 were
 * as a substitute. Only the leading figure is the ranked value.
 */
function stripParenthetical(value: string): string {
  const withoutBrackets = value.replace(/\s*\([^)]*\)/g, '').trim();

  // Sort-key padding, removed before the number is read. Manchester United's
  // tables pad both sides so the column sorts numerically in the browser:
  // Giggs's league total is "0 74" and Charlton's overall is "758 00". Reading
  // this naively went wrong twice over. Collapsing the whitespace turned
  // "963 (161)" into 963161, crediting the club's record appearance holder with
  // 75,800 games; taking the last token instead then read Charlton's "758 00"
  // as 00 and dropped him to zero.
  //
  // The real figure is the longest run of digits, since padding is by
  // definition shorter than the number it aligns.
  const parts = withoutBrackets.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return withoutBrackets;

  return parts.reduce((longest, part) => (part.length > longest.length ? part : longest));
}

/** A fact ready to write to `entity_fact`. */
export interface WikiFact {
  key: string;
  label: string;
  value: string;
  category: string;
  order: number;
}

/** A leaderboard row ready to write to `entity_ranking`. */
export interface WikiRankingEntry {
  rank: number;
  name: string;
  value: number | string | null;
  detail: string | null;
  /** Canonical Wikipedia title, so the row can be linked to an entity we hold. */
  link?: string;
}

export interface WikiRanking {
  kind: string;
  label: string;
  entries: WikiRankingEntry[];
  confidence: 'high' | 'partial' | 'indicative';
  note: string | null;
  /**
   * The article the rows were read from.
   *
   * Carried on the ranking rather than assumed by the caller, because a team's
   * two leaderboards can now come from two different articles: a records page
   * for one and the team's own page for the other. Storing the wrong title
   * would defeat the check this column exists for.
   */
  sourceTitle?: string;
}

/**
 * The three international formats, and where each keeps its records.
 *
 * Article titles are candidates rather than a single guess, because the naming
 * is not uniform: most follow "List of {Team} Test cricket records", but the
 * team word varies ("England cricket team" against "Australia national cricket
 * team") and some redirect. Each is tried in turn and the first that yields
 * tables wins.
 *
 * Deliberately international-only. A first-class or List A record is not a Test
 * or ODI record, and inventing a domestic equivalent of this list would be the
 * `Test = first-class` error in another form.
 */
const CRICKET_FORMATS_FOR_RANKINGS: readonly {
  key: string;
  articleTitles: (teamName: string) => string[];
}[] = [
  {
    key: 'test',
    articleTitles: (team) => cricketRecordArticleTitles(team, 'Test'),
  },
  {
    key: 'odi',
    articleTitles: (team) => cricketRecordArticleTitles(team, 'One Day International'),
  },
  {
    key: 't20i',
    articleTitles: (team) => cricketRecordArticleTitles(team, 'Twenty20 International'),
  },
];

/** Display names, so a stored kind of `t20i_most_runs` renders as prose. */
const CRICKET_FORMAT_LABELS: Record<string, string> = {
  test: 'Test',
  odi: 'ODI',
  t20i: 'T20I',
};

/**
 * Adjectival forms that a records-article caption uses for a team.
 *
 * Only the ones a rule cannot derive. "Australia" to "Australian" falls out of
 * appending -n, but "England" to "English" and "Netherlands" to "Dutch" do not,
 * and a missed form means a real table is rejected as somebody else's.
 */
const CRICKET_TEAM_ADJECTIVES: Record<string, string[]> = {
  england: ['english'],
  scotland: ['scottish', 'scots'],
  ireland: ['irish'],
  netherlands: ['dutch'],
  pakistan: ['pakistani'],
  'sri lanka': ['sri lankan'],
  'west indies': ['west indian', 'windies', 'caribbean'],
  india: ['indian'],
  australia: ['australian'],
  'new zealand': ['new zealander', 'kiwi'],
  'south africa': ['south african'],
  bangladesh: ['bangladeshi'],
  zimbabwe: ['zimbabwean'],
  afghanistan: ['afghan'],
  nepal: ['nepali', 'nepalese'],
};

/** Candidate records-article titles for one team and format. */
function cricketRecordArticleTitles(teamName: string, format: string): string[] {
  // "India national cricket team" -> "India"; "England cricket team" ->
  // "England". The records articles are titled by country, not by entity name.
  const country = teamName
    .replace(/\b(men's|women's|national|cricket|team)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!country) return [];

  return [`List of ${country} ${format} cricket records`, `List of ${country} ${format} records`];
}

/**
 * Which career leaderboard a table is, if it is one at all.
 *
 * Both signals are needed, and neither is sufficient alone. That was learned
 * from the two layouts:
 *
 *   - A **team article** files these tables under a section headed merely
 *     "Tests" and captions them "Last updated: 5 December 2024". No text near
 *     the table says what it ranks, so the only usable signal is the ranked
 *     column: a run-scorers table has a Runs column, a bowlers table has
 *     Wickets.
 *   - A **records article** has thirty tables with a Player column, most of
 *     which are decoys sharing those very columns. "Most sixes" and "Most
 *     ducks" both carry Runs; "Most career catches", "Most consecutive career
 *     matches" and "Most matches as captain" all carry Matches. Choosing on
 *     columns there published a wicketkeeping dismissals table as Australia's
 *     most-capped list, ranked 7.
 *
 * So an explicit heading decides outright, and the columns are consulted only
 * where no heading names a metric. Everything naming something other than the
 * three career leaderboards is rejected first, which is what keeps the innings,
 * series, partnership and captaincy tables out.
 */
function cricketMetricFrom(
  context: string,
  headers: string[] = [],
): { key: string; label: string; valueHeaders: string[] } | null {
  const text = context.toLowerCase();

  const MATCHES = {
    key: 'most_matches',
    label: 'Most matches',
    valueHeaders: ['matches', 'tests', 'odis', 't20is', 'caps', 'games', 'played'],
  };
  const RUNS = { key: 'most_runs', label: 'Most runs', valueHeaders: ['runs'] };
  const WICKETS = { key: 'most_wickets', label: 'Most wickets', valueHeaders: ['wickets', 'wkts'] };

  // Rejected outright: per-innings, per-series and per-match records,
  // partnership and captaincy tables, and the many "most X" curiosities that
  // share their columns with the career leaderboards.
  if (
    /\bin an? (innings|series|match|over|tournament|world cup|bilateral)\b/.test(text) ||
    /\b(partnership|captain|umpired|conceded|consecutive|fewest|lowest|highest|margin|chase)\b/.test(
      text,
    ) ||
    /\b(against each|each batting|by wicket|position|opposition|venue)\b/.test(text) ||
    /\b(dismissals?|catches|stumpings|sixes|fours|ducks|centuries|hauls)\b/.test(text) ||
    /half-centuries|\b(average|economy|strike rate|man of the|awards?)\b/.test(text)
  ) {
    return null;
  }

  // An explicit heading wins. "Most career wickets" is unambiguous and must not
  // be second-guessed by a column scan.
  if (/\bmost (career )?wickets?\b/.test(text)) return WICKETS;
  if (/\bmost (career )?runs?\b/.test(text)) return RUNS;
  if (/\bmost (career )?(matches|appearances|caps)\b|\bmost capped\b/.test(text)) return MATCHES;

  // No heading named a metric, so this is the inline layout. Read the ranked
  // column, which is the one immediately after Rank.
  //
  // Wickets and Runs are tested before Matches because every one of these
  // tables also carries a Matches column, and testing Matches first would
  // label all six of India's tables "Most matches".
  const columns = headers.map((header) => header.toLowerCase().trim());
  const ranked = columns[1] ?? '';
  const isRanked = (...names: string[]) =>
    names.some((name) => ranked === name || ranked.startsWith(name));

  if (isRanked('wickets', 'wkts')) return WICKETS;
  if (isRanked('runs')) return RUNS;
  if (isRanked('matches', 'tests', 'odis', 't20is', 'caps', 'games', 'played')) return MATCHES;

  return null;
}

/**
 * Which format a table's surrounding text names, if any.
 *
 * The spellings are the ones the articles actually use, which were read off the
 * parsed pages rather than assumed. A team article files these tables under
 * section headings "Tests", "One-Day Internationals" and "Twenty20
 * Internationals"; a records article names the format in its title. Both reach
 * this function as part of the same joined context string.
 *
 * Ordered longest-first. "Twenty20 Internationals" contains neither "ODI" nor
 * "Test", but checking Test first would misfile nothing while checking a bare
 * "international" first would misfile everything, so the specific patterns run
 * before the general ones.
 */
function cricketFormatFrom(context: string): string | null {
  const text = context.toLowerCase();
  if (/t20i|twenty20 international|t20 international|twenty-20 international/.test(text)) {
    return 't20i';
  }
  if (/\bodis?\b|one[- ]day international/.test(text)) return 'odi';
  if (/\btests?\b|test cricket|test match/.test(text)) return 'test';
  return null;
}

/**
 * A person's statistics for one discipline, keyed to the registry.
 *
 * Values are numbers or strings, because a few statistics are irreducibly two
 * numbers: a best bowling return of "7/43" and an unbeaten highest score of
 * "248*" both lose their meaning when forced into one figure. The registry
 * declares those keys as `text` and the page prints them verbatim.
 */
/**
 * One title a tennis player won, as read from their infobox.
 *
 * `discipline` separates singles from doubles because tennis counts them
 * separately and always has: "23 majors" means 23 singles majors, and a
 * profile that silently added a player's doubles titles to that number would
 * be stating something the sport does not recognise. Serena Williams has 23
 * singles majors and 14 in doubles, and both belong on her page as their own
 * figures.
 */
export interface TennisTitle {
  /** The curated competition slug, for resolving the honour to a competition. */
  slug: string;
  name: string;
  year: number;
  discipline: 'singles' | 'doubles';
}

/** A tennis player's career, as stated by `Infobox tennis biography`. */
export interface TennisCareer {
  turnedPro: number | null;
  retiredYear: number | null;
  /** Whether the infobox carries a `retired` field at all, which is the status signal. */
  hasRetiredField: boolean;
  /** "Right-handed (one-handed backhand)". */
  plays: string | null;
  singlesTitles: number | null;
  doublesTitles: number | null;
  highestSinglesRanking: number | null;
  highestDoublesRanking: number | null;
  titles: TennisTitle[];
}

/** One major championship won, as stated by `Infobox golfer`. */
export interface GolfMajorWin {
  /** The curated competition slug, or null for a discontinued major. */
  slug: string | null;
  name: string;
  year: number;
  tour: 'mens' | 'womens';
}

/** A golfer's career, as stated by `Infobox golfer`. */
export interface GolfCareer {
  turnedPro: number | null;
  /** The year the article states they retired, where it states one at all. */
  retiredYear: number | null;
  /** The most recent year any major was won. The activity signal, see below. */
  lastMajorYear: number | null;
  /** "PGA Tour", "LPGA Tour (joined 1994)". Free text, as written. */
  tour: string | null;
  college: string | null;
  /** Win counts by tour, keyed by `GOLF_WIN_COUNT_FIELDS.key`. */
  winCounts: Record<string, number>;
  /** The year they entered the World Golf Hall of Fame, if they have. */
  hallOfFameYear: number | null;
  majors: GolfMajorWin[];
}

/**
 * The playing positions this catalogue actually uses, lower-cased.
 *
 * Taken from the position values already on record across the
 * american-football person table, rather than every position name Wikipedia
 * might write, because the point is recognising a genuine playing position
 * and rejecting everything else (a coaching or front-office title, an
 * unrelated sport's fielding position), not building an exhaustive gridiron
 * position glossary.
 */
const GRIDIRON_PLAYING_POSITIONS = new Set([
  'quarterback',
  'running back',
  'halfback',
  'fullback',
  'wide receiver',
  'tight end',
  'offensive tackle',
  'offensive lineman',
  'tackle',
  'guard',
  'center',
  'defensive end',
  'defensive tackle',
  'nose tackle',
  'edge rusher',
  'linebacker',
  'inside linebacker',
  'outside linebacker',
  'cornerback',
  'safety',
  'free safety',
  'strong safety',
  'defensive back',
  'nickel back',
  'placekicker',
  'kicker',
  'punter',
  'long snapper',
  'return specialist',
  'kick returner',
  'punt returner',
  'end',
]);

/**
 * An NFL team's championship record, read from `Infobox NFL team`.
 *
 * Every count is null rather than 0 when the field is absent, the same
 * distinction `WikiHonourCount` draws: a team article this reader cannot parse
 * must not look identical to a team that has genuinely won nothing.
 */
export interface NflTeamTitles {
  superBowlTitles: number | null;
  conferenceTitles: number | null;
  divisionTitles: number | null;
  leagueTitles: number | null;
  playoffAppearances: number | null;
  /** The seasons `sb_champs` credits as Super Bowl wins. */
  superBowlYears: number[];
}

/** One club spell read from a gridiron player's `pastteams` infobox field. */
export interface GridironTeamSpell {
  /** The team name as linked, e.g. "Kansas City Chiefs". */
  teamName: string;
  startYear: number | null;
  /** Null when the spell is still open ("present") or the end year is unstated. */
  endYear: number | null;
  current: boolean;
}

/** A quarterback's career regular-season passing totals. */
export interface QuarterbackCareerPassing {
  yards: number | null;
  touchdowns: number | null;
  interceptions: number | null;
  completions: number | null;
  attempts: number | null;
}

export interface WikiStatBlock {
  discipline: string | null;
  stats: Record<string, number | string>;
  appearances: number | null;
}

/**
 * A footballer's career appearances and goals.
 *
 * Either is null when the article does not state it, which is different from
 * zero and must stay distinguishable: a page renders a dash for the first and a
 * real "0" for the second. Trophies, the third headline tile, are counted from
 * our own honours table rather than fetched.
 */
/**
 * A count of the team trophies an article credits a player with.
 *
 * `groups` is kept alongside the total as a sanity check: a page whose Honours
 * section parsed into zero groups has a shape this reader does not understand,
 * which is different from a player who has genuinely won nothing.
 */
export interface WikiHonourCount {
  won: number | null;
  groups: number;
}

/**
 * Honours groups that are not team trophies won as a player.
 *
 * Two kinds are excluded. "Records" matters most among the first: it holds
 * lines like "Second-most appearances in the UEFA Champions League: 177", whose
 * number is an appearance count and would otherwise be added to a trophy total.
 *
 * "Manager" is the second kind, and a subtler error. Zidane's article lists his
 * playing honours and his managerial ones under sibling headings, so counting
 * both credited a player's tile with trophies he won from the touchline.
 */
/**
 * Honours groups that are not titles anybody counts.
 *
 * Regional and friendly competitions: Real Madrid lists 27 of them, none of
 * which appear in any published tally of the club's honours.
 */
const EXCLUDED_TITLE_TYPES = /^(regional|friendly|friendlies|other|minor|youth|reserve|women)/i;

/**
 * Competitions that are invitational or regional whatever group they sit under.
 *
 * The group label is not always there to be excluded. Celta Vigo lists its
 * pre-season trophies as plain honours lines \u2014 "Trofeo Cidade de Vigo Winners
 * (21)", "Trofeo Memorial Quinocho Winners (21)" \u2014 which took the club to 83
 * titles, more than Bayern. A summer friendly is not a title.
 */
const EXCLUDED_COMPETITIONS =
  /\b(trofeo|troph[e\u00e9]e|memorial|cidade|ciudad|copa galicia|championship \(|regional|amistoso|pre-?season|testimonial|charity|cup winners \(shared\))\b/i;

const EXCLUDED_HONOUR_GROUPS =
  /^(individual|records?|orders?|decorations?|awards?|other|see also|notes?|references?|state honours|honours and awards|personal|manager|managerial|as a manager|head coach|coach)\b/i;

/**
 * Groups to skip when listing a player's honours, as opposed to counting them.
 *
 * Much narrower than `EXCLUDED_HONOUR_GROUPS`, and deliberately so. That
 * pattern exists to count team trophies, where "Individual" and "Awards" are
 * correctly excluded because a Ballon d'Or is not a trophy the team won. Reusing
 * it here dropped exactly the honours worth listing: Ronaldo's five Ballons d'Or
 * sit under an "Individual" label and none of them was read.
 *
 * What still has to go is anything won in another role, or not won at all.
 */

/**
 * Where a honours line stops recording wins.
 *
 * Articles append the times a player did not win to the same line as the times
 * they did, and the transition is a word rather than any markup: "Ballon d'Or
 * Winner: 1963, nominated: 1956, 1957, 1958, ...". Splitting on runner-up
 * clauses alone left the nine nominations in place, and Lev Yashin's profile
 * claimed ten Ballons d'Or against the one he won.
 *
 * Nominations and shortlists are the common case and matter most, because they
 * attach to exactly the awards a reader recognises.
 */
const NOT_A_WIN =
  /\b(runners?-up|runner up|third place|finalist|nominated|nominee|nominations?|shortlist(?:ed)?|longlist(?:ed)?)\b/i;

const EXCLUDED_HONOUR_LIST_GROUPS =
  /^(manager|managerial|as a manager|head coach|coach|assistant|youth|reserves?|see also|notes?|references?)\b/i;

/**
 * A count of the titles a club's article credits it with.
 *
 * `competitions` is the number of table rows counted, kept as a sanity check: a
 * club page whose honours table this reader does not recognise yields zero of
 * them, which is different from a club that has won nothing.
 */
export interface WikiTitleCount {
  titles: number | null;
  competitions: number;
}

export interface WikiCareerTotals {
  games: number | null;
  goals: number | null;
}

/**
 * Wikipedia as a sports-data provider.
 *
 * Where Wikidata gives identifiers and clean licensing, Wikipedia gives the
 * numbers. The gap is not marginal: Wikidata holds no cricket batting averages,
 * one of Curry's four championships, and a Barcelona goalscoring list topped by
 * somebody who never played for the club. Wikipedia holds all three correctly.
 *
 * This adapter extracts **facts**, never prose. See the note on
 * `WikipediaClient` for why that line matters.
 */
@Injectable()
export class WikipediaProvider {
  readonly key = 'wikipedia';

  constructor(private readonly client: WikipediaClient) {}

  // ---------------------------------------------------------------------------
  // Layer 1: sports
  // ---------------------------------------------------------------------------

  /**
   * Structural facts about a sport: governing body, formats, first codification.
   *
   * The article's own prose is deliberately not taken. History and rules are
   * written by us, with Wikipedia cited, so that share-alike never attaches to
   * the editorial layer.
   */
  async fetchSportFacts(title: string): Promise<WikiFact[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const box = parseInfobox(wikitext);
    if (!box) return [];

    const map: [string, string, string, number][] = [
      ['union', 'Governing body', 'governance', 10],
      ['governing body', 'Governing body', 'governance', 10],
      ['first', 'First played', 'origin', 20],
      ['firstplayed', 'First played', 'origin', 20],
      ['registered', 'Registered players', 'reach', 30],
      ['clubs', 'Clubs', 'reach', 40],
      ['contact', 'Contact sport', 'gameplay', 50],
      ['team', 'Team members', 'gameplay', 60],
      ['mgender', 'Mixed gender', 'gameplay', 70],
      ['category', 'Category', 'gameplay', 80],
      ['equipment', 'Equipment', 'gameplay', 90],
      ['venue', 'Venue', 'gameplay', 100],
      ['olympic', 'Olympic', 'reach', 110],
      ['paralympic', 'Paralympic', 'reach', 120],
      ['world championships', 'World championships', 'reach', 130],
    ];

    return this.factsFrom(box, map);
  }

  // ---------------------------------------------------------------------------
  // Layer 2: competitions
  // ---------------------------------------------------------------------------

  /**
   * A competition's infobox facts, plus its record holders.
   *
   * This is the layer where Wikipedia is at its strongest, because tournament
   * infoboxes are written to a consistent template and carry exactly the
   * headline records a competition page wants.
   */
  async fetchCompetitionFacts(title: string): Promise<WikiFact[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const box = parseInfobox(wikitext);
    if (!box) return [];

    const map: [string, string, string, number][] = [
      ['administrator', 'Administrator', 'governance', 10],
      ['organiser', 'Organiser', 'governance', 10],
      ['founded', 'Founded', 'origin', 20],
      ['first', 'First edition', 'origin', 20],
      ['inaugural', 'First edition', 'origin', 20],
      ['last', 'Latest edition', 'origin', 25],
      ['next', 'Next edition', 'origin', 27],
      ['cricket format', 'Format', 'format', 30],
      ['tournament format', 'Tournament format', 'format', 32],
      ['format', 'Format', 'format', 30],
      ['participants', 'Teams', 'format', 40],
      ['teams', 'Teams', 'format', 40],
      ['number of teams', 'Teams', 'format', 40],
      ['country', 'Country', 'format', 45],
      ['countries', 'Countries', 'format', 45],
      ['continent', 'Region', 'format', 46],
      ['champions', 'Current champions', 'honours', 50],
      ['champion', 'Current champions', 'honours', 50],
      ['current champions', 'Current champions', 'honours', 50],
      ['most successful', 'Most successful', 'honours', 60],
      ['most successful club', 'Most successful', 'honours', 60],
      ['most successful team', 'Most successful', 'honours', 60],
      ['most runs', 'Most runs', 'records', 70],
      ['most wickets', 'Most wickets', 'records', 80],
      ['most goals', 'Most goals', 'records', 70],
      ['top goalscorer', 'Top scorer', 'records', 70],
      ['tv', 'Broadcasters', 'commercial', 90],
      ['broadcasters', 'Broadcasters', 'commercial', 90],
      ['broadcaster', 'Broadcasters', 'commercial', 90],
      ['website', 'Website', 'commercial', 100],

      // Leagues rather than tournaments: the NBA names its commissioner, its
      // team count and its most successful franchise under different keys from
      // the cup competitions the map was built for.
      ['commissioner', 'Commissioner', 'governance', 12],
      ['ceo', 'Chief executive', 'governance', 13],
      ['president', 'President', 'governance', 14],
      ['teams', 'Teams', 'format', 40],
      ['countries', 'Countries', 'format', 45],
      ['continent', 'Region', 'format', 46],
      ['headquarters', 'Headquarters', 'governance', 15],
      ['most_titles', 'Most titles', 'honours', 60],
      ['champion', 'Current champions', 'honours', 50],
      ['upcoming_season', 'Current season', 'format', 48],
    ];

    return this.factsFrom(box, map);
  }

  // ---------------------------------------------------------------------------
  // Layer 3: teams
  // ---------------------------------------------------------------------------

  /**
   * The crest filename from a team's infobox, as a `File:` title.
   *
   * Verified against the live API for the clubs whose crests were missing, and
   * every one resolves from the infobox when no other route does:
   *
   * | Article                       | Field   | Value                                  |
   * |-------------------------------|---------|----------------------------------------|
   * | Real Madrid CF                | `image` | `Real Madrid CF.svg`                   |
   * | Arsenal F.C.                  | `image` | `Arsenal FC.svg`                       |
   * | Manchester City F.C.          | `image` | `Manchester City FC badge.svg`         |
   * | Manchester United F.C.        | `image` | `Manchester United FC crest.svg`       |
   * | France national football team | `image` | `File:France national football team seal.svg` |
   *
   * Note the last row: some articles include the `File:` prefix and some do not,
   * so it is stripped and re-added rather than assumed either way.
   *
   * `logo` and `crest` are checked as well as `image` because the football club
   * and national team infoboxes do not agree on the field name, and reading only
   * `image` misses a share of them.
   *
   * **Photographs are rejected, but the test depends on the field.** An infobox
   * `image` is not guaranteed to be a crest: Wikidata's equivalent field gave a
   * training-ground JPG for Barcelona and a squad photo for France. For `image`
   * the extension is therefore the signal, since crests are drawn as SVG almost
   * without exception while photographs are JPEG, and PNG is allowed because a
   * minority of genuine crests are only available as PNG.
   *
   * `logo`, `crest` and `badge` are different, and treating them like `image`
   * was losing real badges. A field *named* logo does not hold a squad photo:
   * whoever filled it in was naming the badge. 43 of basketball's 82 logo-less
   * teams carried one there as a JPG, and the filenames say plainly what they
   * are ("Kenya Basketball Federation.jpg", "Libyan Basketball Federation.jpg",
   * "Cyprus bball.jpg"). National federations outside the major leagues
   * routinely upload their badge as a JPG, so rejecting the extension in these
   * fields rejected the only image those teams have.
   *
   * So: `image` accepts SVG and PNG only; `logo`, `crest` and `badge` accept JPG
   * as well. The Barcelona and France cases are unaffected, both being `image`.
   */
  /**
   * A basketball team's all-time leaders in points, rebounds and assists.
   *
   * Read from "{Team} all-time roster", which is the only source we have that
   * attributes career totals to a **team** rather than to a whole career. That
   * distinction is the whole point: the first version of these tables could
   * only rank by career per-game average, so Isaiah Thomas topped the Lakers'
   * scoring on 17 games there because his average came from his Boston peak.
   *
   * Coverage is checked rather than assumed. The title is built from the team
   * name and the page simply may not exist, in which case this returns an empty
   * array and the team renders no tables instead of wrong ones.
   *
   * A player with two spells appears in more than one section of the article, so
   * rows are merged by taking the **largest** total per player rather than
   * summing them: the sections are alphabetical rather than chronological, and
   * on the pages checked a returning player's row already carries his combined
   * total, so summing double-counts.
   */
  async fetchBasketballTeamLeaders(teamName: string): Promise<WikiRanking[]> {
    // Candidates rather than one guess: Dallas files its page as "…all-time
    // roster and statistics leaders", so a single title left the franchise with
    // no tables at all while its data was sitting there under a longer name.
    const candidates = [
      `${teamName} all-time roster`,
      `${teamName} all-time roster and statistics leaders`,
    ];

    let html: string | null = null;
    let sourceTitle = candidates[0]!;
    for (const candidate of candidates) {
      const fetched = await this.client.fetchHtml(candidate);
      if (!fetched) continue;
      const probe = parseAllTimeRoster(fetched);
      if (probe.length > 0) {
        html = fetched;
        sourceTitle = candidate;
        break;
      }
    }
    if (!html) return [];

    const rows = parseAllTimeRoster(html);
    if (rows.length === 0) return [];

    // Merged per metric rather than per row, because the layouts disagree about
    // what a row is. The wide roster gives one row carrying all three totals;
    // the statistics-leaders layout gives a separate row per metric, so Dwyane
    // Wade arrives three times with points, rebounds and assists in turn.
    // Keeping the largest value per metric handles both, and also handles a
    // player with two spells, whose row on these pages already carries his
    // combined total, so summing would double-count.
    const best = new Map<string, (typeof rows)[number]>();
    for (const row of rows) {
      const key = row.link ?? row.name;
      const existing = best.get(key);
      if (!existing) {
        best.set(key, { ...row });
        continue;
      }
      existing.points = Math.max(existing.points ?? 0, row.points ?? 0) || null;
      existing.rebounds = Math.max(existing.rebounds ?? 0, row.rebounds ?? 0) || null;
      existing.assists = Math.max(existing.assists ?? 0, row.assists ?? 0) || null;
      existing.games = Math.max(existing.games ?? 0, row.games ?? 0) || null;
      if (!existing.link && row.link) existing.link = row.link;
    }

    const merged = [...best.values()];

    const tables: [string, string, 'points' | 'rebounds' | 'assists'][] = [
      ['basketball_all_time_points', 'All-time points', 'points'],
      ['basketball_all_time_rebounds', 'All-time rebounds', 'rebounds'],
      ['basketball_all_time_assists', 'All-time assists', 'assists'],
    ];

    return tables.flatMap(([kind, label, metric]) => {
      const ranked = merged
        .filter((row) => (row[metric] ?? 0) > 0)
        .sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))
        .slice(0, 5);

      if (ranked.length === 0) return [];

      return [
        {
          kind,
          label,
          confidence: 'high' as const,
          // Regular season only, which the article's own columns are. Saying so
          // matters for basketball, where playoff totals are quoted separately
          // and a reader comparing with a career figure elsewhere would
          // otherwise see a discrepancy and assume this table is wrong.
          note: 'Regular-season totals for this team only.',
          sourceTitle,
          entries: ranked.map((row, index) => ({
            rank: index + 1,
            name: row.name,
            value: row[metric],
            detail: row.games ? `${row.games.toLocaleString('en-GB')} games` : null,
            link: row.link ?? undefined,
          })),
        },
      ];
    });
  }

  /**
   * A player's career highlights, as basketball itself summarises them.
   *
   * Reads the `highlights` infobox field, which states counts rather than dated
   * rows: "22× NBA All-Star", "4× NBA champion". Our honours list is built from
   * Wikidata's `P166` and cannot produce that shape, holds no All-Star
   * selections at all, and mixes in unrelated awards, so LeBron James's page
   * carried nineteen ESPY and BET lines and a Golden Raspberry while never
   * mentioning his All-Star selections.
   *
   * Capped at twelve. The field runs to thirty-four lines for Michael Jordan
   * and the tail is college and high-school honours, which is exactly the
   * sprawl this replaces. The article orders roughly by prestige with
   * championships first, so a prefix is the most significant twelve.
   */
  async fetchCareerHighlights(title: string): Promise<CareerHighlight[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];
    return parseCareerHighlights(wikitext).slice(0, 12);
  }

  /** The lead paragraphs of an article, for an entity's `about` text. */
  async fetchSummary(title: string): Promise<string | null> {
    return this.client.fetchSummary(title);
  }

  /**
   * The NBA's roll of honour and its record tables.
   *
   * Ten tables, each from the league's own list article, because that is where
   * this data lives in a form worth reading: the roll of champions, five award
   * rolls and four career leader boards.
   *
   * Read here rather than derived from the honours we hold, for two reasons.
   * The awards are incomplete in Wikidata, which is what the curated MVP list
   * exists to patch, and three of these have no representation at all: there is
   * no scoring-champion honour, and no steals figure anywhere in the catalogue.
   * The career boards are also per-league totals, which the per-team roster
   * pages cannot give: those hold a player's total *for that club*, so summing
   * them would undercount anyone who moved.
   *
   * A source that fails to parse yields no table rather than a wrong one, and
   * the caller reports which.
   */
  async fetchNbaCompetitionTables(): Promise<WikiRanking[]> {
    const seasonLists: [string, string, string][] = [
      ['award:most-valuable-player', 'League MVP', 'NBA Most Valuable Player Award'],
      ['award:finals-most-valuable-player', 'Finals MVP', 'NBA Finals Most Valuable Player Award'],
      [
        'award:scoring-champion',
        'Scoring title',
        'List of National Basketball Association season scoring leaders',
      ],
      [
        'award:defensive-player-of-the-year',
        'Defensive Player of the Year',
        'NBA Defensive Player of the Year Award',
      ],
      ['award:rookie-of-the-year', 'Rookie of the Year', 'NBA Rookie of the Year Award'],
    ];

    const leaderLists: [string, string, string, string][] = [
      [
        'all_time_points',
        'All-time points',
        'List of National Basketball Association career scoring leaders',
        'total points',
      ],
      [
        'all_time_assists',
        'All-time assists',
        'List of National Basketball Association career assists leaders',
        'total assists',
      ],
      [
        'all_time_rebounds',
        'All-time rebounds',
        'List of National Basketball Association career rebounding leaders',
        'total rebounds',
      ],
      [
        'all_time_steals',
        'All-time steals',
        'List of National Basketball Association career steals leaders',
        'total steals',
      ],
    ];

    const tables: WikiRanking[] = [];

    const champions = await this.readTable('List of NBA champions', (html) =>
      parseNbaChampions(html, 200),
    );
    if (champions.length > 0) {
      tables.push(
        this.toRanking('roll_of_honour', 'Champions', 'List of NBA champions', champions, true),
      );
    }

    for (const [kind, label, title] of seasonLists) {
      const rows = await this.readTable(title, (html) => parseNbaSeasonList(html, 200));
      if (rows.length > 0) tables.push(this.toRanking(kind, label, title, rows, false));
    }

    for (const [kind, label, title, header] of leaderLists) {
      // Ten, as the page asks for. These lists run to fifty and the tail is not
      // what a reader opens a league page to see.
      const rows = await this.readTable(title, (html) => parseNbaLeaderList(html, header, 10));
      if (rows.length > 0) tables.push(this.toRanking(kind, label, title, rows, false));
    }

    return tables;
  }

  /**
   * The other basketball competitions' tables, in the same shapes as the NBA's.
   *
   * Coverage is uneven by design, because the sources are. The NBA publishes a
   * list article per award and per career record; the rest publish what they
   * publish, and a competition gets the tables its own articles support rather
   * than a uniform set padded with empties:
   *
   *   - **WNBA** mirrors the NBA most closely, having champions, both MVPs, a
   *     scoring title and career leader boards.
   *   - **EuroLeague** has champions and two MVP awards, and no career boards:
   *     the competition keeps no all-time totals in a form Wikipedia tabulates.
   *   - **NCAA** has champions alone. Its individual awards are national player
   *     awards rather than tournament ones, and its record books are per-school.
   *   - **FIBA World Cup** and the **Olympics** have winners alone, which is
   *     what a quadrennial national-team tournament has: no season awards, and
   *     no career totals, since players appear a handful of times.
   *
   * Three champion shapes are needed, which is why this cannot reuse the NBA
   * path. The NCAA, WNBA and EuroLeague name the winner in its own column; FIBA
   * and the Olympics bury it in a `Final` cell alongside the score and venue.
   */
  async fetchBasketballCompetitionTables(slug: string): Promise<WikiRanking[]> {
    const seasonLists: Record<string, [string, string, string, string?][]> = {
      wnba: [
        ['award:most-valuable-player', 'League MVP', 'WNBA Most Valuable Player Award'],
        [
          'award:finals-most-valuable-player',
          'Finals MVP',
          'WNBA Finals Most Valuable Player Award',
        ],
        ['award:scoring-champion', 'Scoring title', 'List of WNBA season scoring leaders'],
        [
          'award:defensive-player-of-the-year',
          'Defensive Player of the Year',
          'WNBA Defensive Player of the Year Award',
        ],
        ['award:rookie-of-the-year', 'Rookie of the Year', 'WNBA Rookie of the Year Award'],
      ],
      euroleague: [
        ['award:most-valuable-player', 'League MVP', 'EuroLeague MVP'],
        [
          'award:finals-most-valuable-player',
          'Final Four MVP',
          'EuroLeague Final Four MVP',
          // The column is titled after the award rather than "Player".
          'final four mvp',
        ],
      ],
    };

    const leaderLists: Record<string, [string, string, string, string][]> = {
      wnba: [
        [
          'all_time_points',
          'All-time points',
          'List of WNBA career scoring leaders',
          'total points',
        ],
        [
          'all_time_assists',
          'All-time assists',
          'List of WNBA career assists leaders',
          'total assists',
        ],
        [
          'all_time_rebounds',
          'All-time rebounds',
          'List of WNBA career rebounding leaders',
          'total rebounds',
        ],
        [
          'all_time_steals',
          'All-time steals',
          'List of WNBA career steals leaders',
          'total steals',
        ],
      ],
    };

    // Which article names the champions, and how it names them.
    const champions: Record<string, { title: string; column?: string }> = {
      wnba: { title: 'List of WNBA champions', column: 'champions' },
      euroleague: { title: 'EuroLeague Championship Game', column: 'champion' },
      'ncaa-division-i': {
        title: "List of NCAA Division I men's basketball champions",
        column: 'champion',
      },
      'fiba-basketball-world-cup': { title: 'FIBA Basketball World Cup' },
      'olympic-basketball': { title: 'Basketball at the Summer Olympics' },
    };

    const tables: WikiRanking[] = [];

    const source = champions[slug];
    if (source) {
      const rows = await this.readTable(source.title, (html) =>
        source.column
          ? parseChampionColumn(html, source.column, 200)
          : parseTournamentFinal(html, 200),
      );
      if (rows.length > 0) {
        tables.push(this.toRanking('roll_of_honour', 'Champions', source.title, rows, true));
      }
    }

    for (const [kind, label, title, winnerHeader] of seasonLists[slug] ?? []) {
      const rows = await this.readTable(title, (html) =>
        parseNbaSeasonList(html, 200, winnerHeader),
      );
      if (rows.length > 0) tables.push(this.toRanking(kind, label, title, rows, false));
    }

    for (const [kind, label, title, header] of leaderLists[slug] ?? []) {
      const rows = await this.readTable(title, (html) => parseNbaLeaderList(html, header, 10));
      if (rows.length > 0) tables.push(this.toRanking(kind, label, title, rows, false));
    }

    return tables;
  }

  /** Fetches one article and applies a parser, yielding nothing on failure. */
  private async readTable<T>(title: string, parse: (html: string) => T[]): Promise<T[]> {
    const html = await this.client.fetchHtml(title);
    return html ? parse(html) : [];
  }

  /**
   * Wraps parsed rows as a ranking.
   *
   * `isTeam` decides which slug the assembler will resolve the link against. A
   * roll of honour names clubs and an award roll names players, and resolving a
   * club against the person catalogue finds nothing.
   */
  private toRanking(
    kind: string,
    label: string,
    sourceTitle: string,
    rows: { name: string; link: string | null; value: string; detail: string | null }[],
    isTeam: boolean,
  ): WikiRanking {
    return {
      kind,
      label,
      confidence: 'high',
      note: null,
      sourceTitle,
      entries: rows.map((row, index) => ({
        rank: index + 1,
        name: row.name,
        // Kept as text. These are formatted totals ("43,440") and years, and
        // parsing them to numbers only to format them again loses the
        // thousands separators the source already applies.
        value: row.value,
        detail: row.detail,
        link: row.link ?? undefined,
        ...(isTeam ? { isTeam: true } : {}),
      })),
    };
  }

  /** Raw wikitext for a page, for callers that parse it themselves. */
  async fetchWikitextFor(title: string): Promise<string | null> {
    return this.client.fetchWikitext(title);
  }

  /** Rendered thumbnail URLs for `File:` titles, batched. */
  async resolveThumbnails(
    fileTitles: readonly string[],
    width: number,
  ): Promise<Map<string, string>> {
    return this.client.fetchThumbnails(fileTitles, width);
  }

  crestFileFrom(wikitext: string): string | null {
    const box = parseInfobox(wikitext);
    if (!box) return null;

    // `image` may hold a photograph, so it is restricted to vector and PNG.
    // A field named for the badge is taken at its word and may be a JPG.
    const extensionsFor = (field: string): string =>
      field === 'image' ? 'svg|png' : 'svg|png|jpe?g';

    // A minority of articles embed a full image link rather than a bare
    // filename: `| image = [[File:Tottenham Hotspur.svg|frameless|upright=0.5]]`.
    // `cleanWikitext` reduces a link to its display label, which for an image is
    // the parameter list, so by the time the field is read the filename is gone.
    // It is recovered from the raw wikitext instead.
    for (const field of ['image', 'logo', 'crest', 'badge']) {
      const linked = wikitext.match(
        new RegExp(`\\|\\s*${field}\\s*=\\s*\\[\\[\\s*(?:File|Image):([^|\\]]+)`, 'i'),
      );
      const file = linked?.[1]?.trim();
      if (file && new RegExp(`\\.(?:${extensionsFor(field)})$`, 'i').test(file)) {
        return `File:${decodeFilename(file)}`;
      }
    }

    for (const field of ['image', 'logo', 'crest', 'badge']) {
      const raw = box[field]?.trim();
      if (!raw) continue;

      // The value arrives in two shapes. Usually it is a bare filename, but a
      // minority of articles embed a full image link, `[[File:X.svg|frameless
      // |upright=0.5]]`, whose display parameters are not part of the name.
      // `cleanWikitext` has already reduced that to its parameters alone, so
      // the link is recovered from the raw wikitext rather than from the field.
      const value = raw
        .replace(/^\[\[/, '')
        .replace(/\]\]$/, '')
        .replace(/^(?:File|Image):/i, '')
        .split('|')[0]
        ?.trim();

      if (!value) continue;

      // The filename is taken from within the value rather than by testing its
      // end, because competition infoboxes append rendering options to it
      // through the pipe escape: `FIFA World Cup wordmark (2023).svg{{!}}
      // class=skin-invert`. `{{!}}` is a template standing in for a literal
      // pipe, so `parseInfobox` does not split on it and `cleanWikitext`
      // reduces it to a space, leaving `... .svg class=skin-invert` in the
      // field. Anchoring on the extension kept the World Cup and the Copa
      // America without a logo while the leagues had one.
      //
      // The extension still rejects a photograph in `image`, so an infobox whose
      // image is a squad photo or a trophy shot yields nothing there, which is
      // the intended outcome. In `logo`, `crest` and `badge` a JPG is accepted:
      // see the note above on federation badges.
      const name = value
        .match(new RegExp(`^(.*?\\.(?:${extensionsFor(field)}))(?:\\s|$)`, 'i'))?.[1]
        ?.trim();

      if (!name) continue;

      return `File:${decodeFilename(name)}`;
    }

    return null;
  }

  /** A club's infobox facts: ground, capacity, manager, league. */
  async fetchTeamFacts(title: string): Promise<WikiFact[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const box = parseInfobox(wikitext);
    if (!box) return [];

    const map: [string, string, string, number][] = [
      ['fullname', 'Full name', 'identity', 10],
      ['nickname', 'Nickname', 'identity', 20],
      ['short name', 'Short name', 'identity', 25],
      ['founded', 'Founded', 'identity', 30],
      ['ground', 'Ground', 'venue', 40],
      ['stadium', 'Ground', 'venue', 40],
      ['capacity', 'Capacity', 'venue', 50],
      ['owner', 'Owner', 'people', 60],
      ['owntitle', 'Ownership', 'people', 61],
      ['chairman', 'Chairman', 'people', 62],
      ['chrtitle', 'Chair title', 'people', 63],
      ['manager', 'Manager', 'people', 64],
      ['mgrtitle', 'Manager title', 'people', 65],
      ['coach', 'Coach', 'people', 64],
      ['captain', 'Captain', 'people', 66],
      ['league', 'League', 'competition', 70],
      ['current', 'Current season', 'competition', 75],
      ['website', 'Website', 'commercial', 80],
      ['colours', 'Colours', 'identity', 26],

      // National sides use a different template from clubs, and omitting these
      // left Brazil with a coach and a captain where its infobox also carries
      // "Most caps: Cafu (142)" and "Top scorer: Neymar". The records are the
      // reason to visit the page.
      ['association', 'Association', 'governance', 12],
      ['confederation', 'Confederation', 'governance', 14],
      ['fifa trigramme', 'FIFA code', 'identity', 15],
      ['most caps', 'Most caps', 'records', 90],
      ['top scorer', 'Top scorer', 'records', 92],
      ['most runs', 'Most runs', 'records', 90],
      ['most wickets', 'Most wickets', 'records', 92],
      ['home stadium', 'Home stadium', 'venue', 40],
      ['first game', 'First match', 'history', 100],
      ['largest win', 'Largest win', 'history', 102],
      ['largest loss', 'Largest defeat', 'history', 104],
      ['world cup apps', 'World Cup appearances', 'history', 110],
      ['world cup first', 'First World Cup', 'history', 112],
      ['world cup best', 'Best World Cup', 'history', 114],
      ['regional name', 'Regional tournament', 'history', 120],
      ['regional cup apps', 'Regional appearances', 'history', 122],
      ['regional cup best', 'Best regional finish', 'history', 124],

      // Cricket uses its own template with none of the field names above.
      // Without these a national side returned a nickname and a coach, while
      // its infobox carried the Test, ODI and T20I records, the World Cup
      // history and the ICC standing.
      ['icc_status', 'ICC status', 'governance', 16],
      ['icc_region', 'ICC region', 'governance', 18],
      ['icc_member_year', 'ICC member since', 'governance', 19],
      ['coach', 'Coach', 'people', 64],
      ['test_captain', 'Test captain', 'people', 67],
      ['od_captain', 'ODI captain', 'people', 68],
      ['t20i_captain', 'T20I captain', 'people', 69],
      ['test_rank', 'Test ranking', 'records', 70],
      ['odi_rank', 'ODI ranking', 'records', 72],
      ['t20i_rank', 'T20I ranking', 'records', 74],
      ['test_record', 'Test record', 'records', 80],
      ['odi_record', 'ODI record', 'records', 82],
      ['t20i_record', 'T20I record', 'records', 84],
      ['first_test', 'First Test', 'history', 100],
      ['first_odi', 'First ODI', 'history', 102],
      ['first_t20i', 'First T20I', 'history', 104],
      ['wc_apps', 'World Cup appearances', 'history', 110],
      ['wc_best', 'Best World Cup', 'history', 112],
      ['wt20_apps', 'T20 World Cup appearances', 'history', 114],
      ['wt20_best', 'Best T20 World Cup', 'history', 116],
      ['wtc_apps', 'World Test Championship apps', 'history', 118],
      ['wtc_best', 'Best World Test Championship', 'history', 119],

      // Franchise sides: an IPL club records its titles as numbered pairs.
      ['city', 'City', 'identity', 27],
      ['title1', 'Competition', 'honours', 50],
      ['title1wins', 'Titles won', 'honours', 51],
      ['title2', 'Second competition', 'honours', 52],
      ['title2wins', 'Second competition titles', 'honours', 53],

      // Basketball franchises are organised by conference and division rather
      // than by league alone, and record their titles under `league_champs`.
      ['conference', 'Conference', 'competition', 71],
      ['division', 'Division', 'competition', 72],
      ['arena', 'Arena', 'venue', 40],
      ['location', 'Location', 'identity', 28],
      ['colors', 'Colours', 'identity', 26],
      ['league_champs', 'Championships', 'honours', 50],
      // `conf_champs` and `div_champs` are deliberately not mapped, for the
      // same reason: a conference or division title is a lesser honour with
      // far more instances than a championship, so the fact rendered as a
      // wall of years that dwarfed the championships above it. The Lakers
      // listed 36 division titles across eight lines, against 18
      // championships. American football's version of the same field is
      // worse still, since `conf_champs` there is what this shared reader
      // used to surface before the NFL's Super Bowl/conference/league title
      // counts got a proper structured honour table
      // (`ingestNflTeamTitles`/`fetchNflTeamTitles`): the generic prose fact
      // and the structured honour chips both rendered under a heading called
      // "Honours" on the same team page, saying the same thing twice in two
      // different shapes. The data stays in Wikipedia; it is simply not a
      // fact worth a panel on a team page for any sport this reader serves.
      ['gm', 'General manager', 'people', 67],
      ['ceo', 'Chief executive', 'people', 68],
      ['president', 'President', 'people', 69],
      ['affiliation', 'Affiliate', 'competition', 76],
      // `sponsor` is deliberately not mapped either. It was the only fact in the
      // `commercial` category, so a team with one rendered a whole "Club"
      // section containing a single shirt-sponsor name, and for the NBA sides
      // the infobox value is often a partial or stale brand ("Albert" on the
      // Lakers). A one-row section of low-confidence trivia is worse than none.
    ];

    return this.factsFrom(box, map);
  }

  /**
   * A club's record tables: most appearances and top scorers.
   *
   * Found by header rather than by position, and skipped rather than guessed at
   * when nothing matches. Coverage is therefore partial by design: about half of
   * the clubs tried have a records article in a shape this recognises, and the
   * rest simply render without these tables.
   */
  /**
   * A cricket side's per-format leaderboards: matches, runs and wickets.
   *
   * Cricket needs its own method rather than a widened `fetchTeamRankings`,
   * because the shape of the answer is different. Football has two leaderboards
   * per team; a cricket side has up to nine, because a career record only means
   * something inside one format. Test, ODI and T20I records are not comparable
   * and must never be merged into a single "most runs" table: that is the same
   * mistake as adding a batting average across formats, and the discipline
   * model exists precisely to prevent it.
   *
   * ## Two layouts, because Wikipedia has two
   *
   * Coverage was measured across the twelve Full Members before this was
   * written, and there is no single source that serves them all:
   *
   *   - **Inline.** India, Bangladesh, Zimbabwe, Afghanistan and Ireland carry
   *     the tables on the team's own article, captioned "Most Test runs for
   *     India".
   *   - **Per-format records articles.** Australia, England, South Africa and
   *     Sri Lanka carry them in "List of {Team} {Format} cricket records",
   *     under "Most career runs" / "Most career wickets" / "Most career
   *     matches".
   *
   * Both are read. Sides with neither, which at the time of writing includes
   * Pakistan, New Zealand and the West Indies, get no tables rather than
   * tables borrowed from somewhere that happened to parse.
   *
   * ## Why the caption is checked
   *
   * A per-format records article opens each section with prose about the
   * *world* record, so "Most career runs" on Australia's page is introduced by
   * a paragraph about Tendulkar. The table beneath it is Australia's, and says
   * so: "Most career Test runs by Australian batsmen". Anchoring on that
   * caption is what stops this repeating the contamination that once filed
   * Real Madrid's footballers under three other clubs, and it is the reason
   * `ownsTable` rejects rather than guesses.
   */
  async fetchCricketTeamRankings(teamName: string, teamTitle: string): Promise<WikiRanking[]> {
    const rankings: WikiRanking[] = [];

    // The team's own article first: where the inline tables exist they are the
    // most current, being maintained alongside the rest of the article.
    const inline = await this.cricketRankingsFromArticle(teamTitle, teamName, null);
    rankings.push(...inline);

    // Then one records article per format, for the formats still missing. A
    // side with inline Test tables and no inline T20I tables is common, so the
    // gap is filled per format rather than per team.
    for (const format of CRICKET_FORMATS_FOR_RANKINGS) {
      const have = rankings.some((ranking) => ranking.kind.startsWith(`${format.key}_`));
      if (have) continue;

      for (const candidate of format.articleTitles(teamName)) {
        const found = await this.cricketRankingsFromArticle(candidate, teamName, format.key);
        if (found.length > 0) {
          rankings.push(...found);
          break;
        }
      }
    }

    return rankings;
  }

  /**
   * A domestic or franchise side's leaderboards: most runs and most wickets.
   *
   * Deliberately not format-split, and that is the point rather than a
   * shortcut. An IPL side plays Twenty20 and nothing else, so "most runs for
   * Mumbai Indians" is unambiguous and needs no format qualifier. Labelling it
   * `t20i_most_runs` would be worse than wrong: a T20I is an international
   * match, and the IPL is not international cricket. These get their own
   * `club_` kinds so the two can never be conflated or summed.
   *
   * Matches are not collected here. The franchise tables carry a Matches column
   * but rank on runs or wickets, and there is no separate most-appearances
   * table on these articles to read, so publishing one would mean re-ranking a
   * column the source never ranked.
   */
  async fetchCricketClubRankings(teamName: string, teamTitle: string): Promise<WikiRanking[]> {
    // The team's own article first, then its records article.
    //
    // Both are needed. Mumbai Indians and Royal Challengers Bengaluru carry the
    // leaderboards inline; Chennai Super Kings, Delhi Capitals, Punjab Kings
    // and several others keep only a "Statistics" heading and push the tables
    // to "List of {Team} records", so reading the team article alone left six
    // IPL sides with nothing.
    for (const title of [teamTitle, `List of ${teamName} records`]) {
      const found = await this.clubRankingsFromArticle(teamName, title);
      if (found.length > 0) return found;
    }

    return [];
  }

  /** Both club leaderboards as read from one article. */
  private async clubRankingsFromArticle(
    teamName: string,
    teamTitle: string,
  ): Promise<WikiRanking[]> {
    const html = await this.client.fetchHtml(teamTitle);
    if (!html) return [];

    const rankings: WikiRanking[] = [];

    for (const table of parseTables(html)) {
      const hasPlayer = table.headers.some((header) => /player|name/i.test(header));
      if (!hasPlayer) continue;

      const context = [table.caption, table.heading, ...table.headingPath]
        .filter((part): part is string => !!part)
        .join(' | ');

      // Heading-led only. These articles carry season-by-season and
      // playing-record tables whose columns look identical to the
      // leaderboards, and only the heading separates them.
      // "career" is optional in the middle, which is not a detail. A team
      // article heads these "Most runs"; a franchise records article heads them
      // "Most career wickets", and matching only the former left every side
      // whose tables live in a records article with runs and no wickets:
      // Chennai Super Kings, Delhi Capitals, Punjab Kings and eight others.
      const metric = /\bmost (?:career )?wickets\b/i.test(context)
        ? { key: 'club_most_wickets', label: 'Most wickets', valueHeaders: ['wickets', 'wkts'] }
        : /\bmost (?:career )?runs\b/i.test(context)
          ? { key: 'club_most_runs', label: 'Most runs', valueHeaders: ['runs'] }
          : null;
      if (!metric) continue;

      // Reject the per-season, per-match and per-series variants. A franchise
      // records article carries "Most runs in a season", "Most runs conceded in
      // a match" and "Most wickets in a series" alongside the career tables,
      // and all three share the career tables' columns.
      if (
        /\bin an? (innings|season|match|over|series|tournament)\b/i.test(context) ||
        /\b(partnership|highest|best|conceded|fewest|lowest|captain)\b/i.test(context) ||
        // A franchise records article files wicket-keeping and hauls under
        // headings containing "wickets": "Most four-wickets (& over) hauls"
        // and "Most career dismissals" both matched before this.
        /\b(hauls?|dismissals?|catches|stumpings|four-wickets|five-wickets)\b/i.test(context)
      ) {
        continue;
      }

      if (rankings.some((existing) => existing.kind === metric.key)) continue;

      const entries = this.rowsToEntries(table, metric.valueHeaders).map((entry) => ({
        ...entry,
        name: entry.name
          .replace(/[♠†‡*]/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      }));
      if (entries.length < 3) continue;

      rankings.push({
        kind: metric.key,
        label: metric.label,
        entries,
        confidence: 'partial',
        note: `${metric.label} for ${teamName} in this competition. Franchise and domestic records are separate from international records and are not comparable with them.`,
        sourceTitle: teamTitle,
      });
    }

    return rankings;
  }

  /**
   * Reads whatever cricket leaderboards one article holds.
   *
   * `onlyFormat` is set when reading a per-format records article, whose
   * headings say "Most career runs" without naming the format: the format comes
   * from which article it is. Null when reading a team article, where each
   * table names its own format ("Most ODI wickets for India") and the heading
   * is the only thing that can tell them apart.
   */
  private async cricketRankingsFromArticle(
    title: string,
    teamName: string,
    onlyFormat: string | null,
  ): Promise<WikiRanking[]> {
    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    const tables = parseTables(html);
    const rankings: WikiRanking[] = [];

    for (const table of tables) {
      const context = [table.caption, table.heading, ...table.headingPath]
        .filter((part): part is string => !!part)
        .join(' | ');

      // A leaderboard names people. Requiring a player column first is what
      // keeps head-to-head tables (whose columns are opponents and results) and
      // partnership tables out of the set cheaply.
      const hasPlayer = table.headers.some((header) => /player|name|batsman|bowler/i.test(header));
      if (!hasPlayer) continue;

      const metric = cricketMetricFrom(context, table.headers);
      if (!metric) continue;

      const format = onlyFormat ?? cricketFormatFrom(context);
      if (!format) continue;
      if (onlyFormat && cricketFormatFrom(context) && cricketFormatFrom(context) !== onlyFormat) {
        // A records article for one format occasionally links a table for
        // another. Trust the table's own words over the article's title.
        continue;
      }

      // The ownership check, run against the article title as well as the
      // table's own context.
      //
      // A records article discusses world records beside the team's own, so
      // something has to establish whose table this is. Two things were tried.
      // The table's caption states it outright ("Most career Test runs by
      // Australian batsmen"), but `parseTables` fills `caption` with the
      // "Last updated" line that sits in the same cell, so the qualification
      // never reaches this code. The article title does reach it, and "List of
      // Australia Test cricket records" identifies the owner just as firmly.
      //
      // Checked only for records articles. A table on a team's own page needs
      // no qualification, and demanding one rejected all six of India's
      // tables, whose entire context is "Statistics | Tests".
      if (onlyFormat !== null && !this.ownsCricketTable(`${title} ${context}`, teamName)) {
        continue;
      }

      const kind = `${format}_${metric.key}`;
      if (rankings.some((existing) => existing.kind === kind)) continue;

      const entries = this.rowsToEntries(table, metric.valueHeaders).map((entry) => ({
        ...entry,
        // These tables flag the world record holder with a spade and current
        // players with a dagger, both inside the name cell, so a row arrives as
        // "Muttiah Muralitharan ♠". Stripped here rather than in the shared
        // parser: the symbols carry meaning worth keeping for football's
        // tables, and only cricket puts them in the name.
        name: entry.name
          .replace(/[♠†‡*]/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      }));
      // Two rows is a pair of record holders, not a leaderboard.
      if (entries.length < 3) continue;

      rankings.push({
        kind,
        label: `${CRICKET_FORMAT_LABELS[format] ?? format} – ${metric.label}`,
        entries,
        // `partial` rather than `high` throughout. These tables carry their own
        // "Last updated" line and are frequently months behind, and an active
        // player's total is stale the moment it is read.
        confidence: 'partial',
        note: `${metric.label} in ${CRICKET_FORMAT_LABELS[format] ?? format} for ${teamName}. Career records are per format and are not comparable across formats.`,
        sourceTitle: title,
      });
    }

    return rankings;
  }

  /**
   * Whether a table's own text says it belongs to this team.
   *
   * Matched on the country or team word rather than the full entity name,
   * because the table says "by Australian batsmen" where the team is "Australia
   * national cricket team", and "for India" where the team is "India national
   * cricket team". Both the plain and the adjectival form are tried.
   *
   * A table on a team's own article that names no team at all is accepted: an
   * unqualified "Most Test runs" section on India's page is India's. A table on
   * a records article must name the team, because those articles discuss world
   * records alongside the team's own.
   */
  private ownsCricketTable(context: string, teamName: string): boolean {
    const haystack = context.toLowerCase();

    // "India national cricket team" -> "india"; "West Indies cricket team" ->
    // "west indies".
    const core = teamName
      .replace(/\b(men's|women's|national|cricket|team)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!core) return true;

    if (haystack.includes(core)) return true;

    // Adjectival forms: Australia -> Australian, Pakistan -> Pakistani,
    // England -> English, Sri Lanka -> Sri Lankan.
    const adjectives = CRICKET_TEAM_ADJECTIVES[core];
    if (adjectives?.some((form) => haystack.includes(form))) return true;

    // Naive but effective for the rest: most country names take -n or -an.
    return haystack.includes(`${core}n`) || haystack.includes(`${core}an`);
  }

  async fetchTeamRankings(
    recordsTitle: string | null,
    teamName?: string,
    teamTitle?: string,
  ): Promise<WikiRanking[]> {
    // Three sources, tried in order of how authoritative they are.
    //
    // The records article first, where one exists. Then the team's own article,
    // which for most sides without a records article carries the same two
    // tables under "Player records": Ghana, Egypt, Serbia, Sevilla, Atlético
    // Madrid and Boca Juniors all publish their leaderboards there and nowhere
    // else, and reading only the records article left every one of them empty.
    // The list of internationals last, being the thinnest of the three.
    const rankings: WikiRanking[] = [];

    for (const title of [recordsTitle, teamTitle]) {
      if (!title) continue;

      const found = await this.rankingsFromArticle(title);
      for (const ranking of found) {
        if (rankings.some((existing) => existing.kind === ranking.kind)) continue;
        rankings.push({ ...ranking, sourceTitle: title });
      }

      if (rankings.length >= 2) break;
    }

    // A ranking with a single entry is a record holder, not a leaderboard, so it
    // counts as a gap: France's article states its record scorer in prose and
    // lists nobody else.
    const thin = (kind: string) =>
      (rankings.find((ranking) => ranking.kind === kind)?.entries.length ?? 0) < 3;

    if (teamName && (thin('most_appearances') || thin('top_scorers'))) {
      for (const derived of await this.fetchInternationalsRankings(teamName)) {
        if (!thin(derived.kind)) continue;

        // Replaces the thin ranking rather than sitting beside it: two
        // leaderboards of the same kind on one team is not a shape the page can
        // render.
        const existing = rankings.findIndex((ranking) => ranking.kind === derived.kind);
        if (existing >= 0) rankings.splice(existing, 1, derived);
        else rankings.push(derived);
      }
    }

    return rankings;
  }

  /** Both leaderboards as read from one article, by table then by prose list. */
  private async rankingsFromArticle(title: string): Promise<WikiRanking[]> {
    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    const tables = parseTables(html);
    const rankings: WikiRanking[] = [];

    // Anchored to the article's own headings before falling back to columns.
    // These pages carry many tables with a player column and a number: Real
    // Madrid's has nineteen tables, including by-season and by-competition
    // lists that look identical to a column matcher. Choosing on columns alone
    // published a by-competition table as the club's all-time top scorers,
    // which listed Ronaldo five times and then started naming seasons.
    //
    // Heading terms are ordered by how specific they are, so "Most goals"
    // beats the section-level "Goalscorers" that contains it.
    // National sides count appearances as caps and head the section
    // accordingly: Brazil and Germany use "Most appearances" with a "Caps"
    // column, Argentina heads it "Most-capped players". Without both spellings
    // every country's appearance table was dropped while its scorers table
    // published, which is why Brazil showed goals and no caps.
    const appearances = findTableByHeading(
      tables,
      [
        'Most appearances',
        'Most-capped players',
        'Most capped players',
        'Appearances',
        'Appearance records',
        'Appearances (most)',
        'All competitions appearances',
        'Most apps',
        'All competitions',
      ],
      ['player|name'],
      ['total', 'apps', 'app', 'appearances', 'matches', 'games', 'caps'],
    );
    if (appearances) {
      const entries = this.rowsToEntries(appearances, [
        // "Total" first, deliberately. These tables break appearances down by
        // competition and then total them, and any single competition column
        // matches "apps" just as well as the total does.
        'total',
        'caps',
        'appearances',
        'apps',
        // "App." with the full stop, which Boca Juniors uses and which no
        // longer spelling matches.
        'app',
        'matches',
        'games',
      ]);
      if (entries.length > 0) {
        rankings.push({
          kind: 'most_appearances',
          // Fixed label rather than one derived from the article, so the same
          // heading appears on every club whatever its page happens to call
          // the section.
          label: 'Most appearances',
          entries,
          // Sourced from a maintained records article rather than aggregated
          // from scattered statements, so unlike the Wikidata equivalent this
          // matches the club's own published figures.
          confidence: 'high',
          note: 'From the records tables on Wikipedia.',
        });
      }
    }

    const scorers = findTableByHeading(
      tables,
      [
        'Most goals',
        'Top goalscorers',
        'Overall scorers',
        'Top 10 all-time scorers',
        'All-time scorers',
        'Goalscorers',
        'Top scorers',
        'Goalscoring records',
        'Goal scorers',
        'Goals scored',
        'Top all-time goalscorers',
        // Bare "Goals", last because it is the least specific term available.
        // England's article heads the section with it and nothing else, so
        // without this the heading match failed entirely and the column
        // fallback chose the per-club record-scorer table beneath, publishing
        // England's record scorer as Nat Lofthouse with 30.
        'Goals',
      ],
      ['player|name'],
      ['goals', 'official goals', 'total'],
    );
    if (scorers && scorers !== appearances) {
      const entries = this.rowsToEntries(scorers, ['official goals', 'total', 'goals']);
      if (entries.length > 0) {
        rankings.push({
          kind: 'top_scorers',
          label: 'Top scorers',
          entries,
          confidence: 'high',
          note: 'From the records tables on Wikipedia.',
        });
      }
    }

    // Articles written as prose lists rather than tables, filling in whichever
    // of the two rankings the table pass did not produce. Only the gaps are
    // filled: where a page has both shapes the table is the fuller one.
    const lists = parseDefinitionLists(html);

    if (!rankings.some((ranking) => ranking.kind === 'most_appearances')) {
      const entries = this.listToEntries(lists, ['most appearances', 'most caps', 'most capped']);
      if (entries.length > 0) {
        rankings.push({
          kind: 'most_appearances',
          label: 'Most appearances',
          entries,
          confidence: 'high',
          note: 'From the records tables on Wikipedia.',
        });
      }
    }

    if (!rankings.some((ranking) => ranking.kind === 'top_scorers')) {
      const entries = this.listToEntries(lists, ['most goals', 'top goalscorer', 'top scorer']);
      if (entries.length > 0) {
        rankings.push({
          kind: 'top_scorers',
          label: 'Top scorers',
          entries,
          confidence: 'high',
          note: 'From the records tables on Wikipedia.',
        });
      }
    }

    return rankings;
  }

  /**
   * Leaderboards derived from a country's list of internationals.
   *
   * Lower confidence than a records article on purpose. These lists are capped
   * at a minimum number of appearances, so a prolific scorer with few caps can
   * be missing from the goals ranking, and the figures are maintained less
   * closely than the records article's.
   */
  private async fetchInternationalsRankings(teamName: string): Promise<WikiRanking[]> {
    const country = this.plainTeamName(teamName)
      .replace(/\b(football|soccer)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!country) return [];

    const title = `List of ${country} international footballers`;
    if (!(await this.client.exists(title))) return [];

    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    // Every table on the page that has a person, caps and goals, merged into
    // one. Ireland's list is split alphabetically into 26 tables, so reading a
    // single table gave a leaderboard drawn from the surnames beginning with
    // one letter, topped by John Aldridge on 69 rather than Robbie Keane on 146.
    const candidates = parseTables(html).filter((entry) => {
      const headers = entry.headers.map((header) => header.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const hasName = headers.some((header) => header.includes('player') || header === 'name');
      return hasName && headers.some((header) => header.includes('caps'));
    });
    if (candidates.length === 0) return [];

    const table: ParsedTable = {
      heading: candidates[0]!.heading,
      headingPath: candidates[0]!.headingPath,
      caption: candidates[0]!.caption,
      headers: candidates[0]!.headers,
      // Only tables sharing the first one's columns are merged: an alphabetical
      // split repeats the same header row, while a page that happens to carry
      // an unrelated caps table does not.
      rows: candidates
        .filter(
          (entry) =>
            entry.headers.join('|').toLowerCase() ===
            candidates[0]!.headers.join('|').toLowerCase(),
        )
        .flatMap((entry) => entry.rows),
    };

    const rankings: WikiRanking[] = [];

    const note = `Derived from the list of ${country} internationals on Wikipedia.`;
    const sourceTitle = title;

    const appearances = this.rowsToEntries(table, ['caps']);
    if (appearances.length > 0) {
      rankings.push({
        kind: 'most_appearances',
        label: 'Most appearances',
        entries: appearances,
        confidence: 'partial',
        note,
        sourceTitle,
      });
    }

    const scorers = this.rowsToEntries(table, ['goals']);
    if (scorers.length > 0) {
      rankings.push({
        kind: 'top_scorers',
        label: 'Top scorers',
        entries: scorers,
        confidence: 'partial',
        note,
        sourceTitle,
      });
    }

    return rankings;
  }

  /**
   * Ranking entries from a prose-list leaderboard.
   *
   * Labels are matched most-specific-first for the same reason table headings
   * are: "Most appearances as a captain" contains "most appearances" and is a
   * different record.
   */
  private listToEntries(lists: ParsedList[], labels: string[]): WikiRankingEntry[] {
    // Accents decomposed before stripping, not after. Removing everything
    // outside [a-z0-9] turns "Atlético" into "atltico", which can never match
    // the "atletico" in its own article title, so the club was rejected from
    // its own records page.
    const normalise = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    // Qualified variants of the same record, excluded outright. A captaincy or
    // goalkeeping list is not a shorter version of the overall one.
    const qualified = (label: string) =>
      /captain|goalkeep|clean sheet|substitute|youngest|oldest|manager|coach|single|season|tournament|world cup|euro|friendl|penalt|hat.?trick/i.test(
        label,
      );

    const usable = lists.filter((list) => !qualified(list.label));

    for (const wanted of labels) {
      const target = normalise(wanted);
      const match =
        usable.find((list) => normalise(list.label) === target) ??
        usable.find((list) => normalise(list.label).includes(target));
      if (!match) continue;

      const entries = match.entries
        .slice()
        .sort((a, b) => b.value - a.value)
        .slice(0, 25)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          value: entry.value,
          detail: entry.detail,
          link: entry.link,
        }));

      if (entries.length > 0 && Number(entries[0]?.value ?? 0) > 0) return entries;
    }

    return [];
  }

  // ---------------------------------------------------------------------------
  // Layer 4: players
  // ---------------------------------------------------------------------------

  /** Biographical facts about a player. */
  async fetchPlayerFacts(title: string): Promise<WikiFact[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const box = parseInfobox(wikitext);
    if (!box) return [];

    const map: [string, string, string, number][] = [
      ['fullname', 'Full name', 'profile', 10],
      ['full_name', 'Full name', 'profile', 10],
      ['birth_date', 'Born', 'profile', 20],
      ['birth_place', 'Birthplace', 'profile', 25],
      ['height', 'Height', 'profile', 30],
      ['position', 'Position', 'profile', 40],
      ['batting', 'Batting style', 'profile', 40],
      ['bowling', 'Bowling style', 'profile', 45],
      ['role', 'Role', 'profile', 46],
      ['currentclub', 'Current club', 'career', 50],
      ['club', 'Club', 'career', 50],
      ['nationalteam', 'National team', 'career', 55],
      ['country', 'Country', 'career', 55],
      // `career_start` is deliberately unmapped.
      //
      // It is a basketball-only field in practice, and basketball dates a career
      // by the draft rather than by a first appearance: `draft_year` is the
      // figure the sport quotes and 386 of the 392 people carrying a career
      // start carried a draft year too, so the pair rendered the same 2003 twice
      // on LeBron James's profile.
      //
      // The value is also unreliable where it is the only one of the two. Six
      // people have a career start and no draft year, and most of those are not
      // a start at all but a whole span: Michael Jordan's reads
      // "1984-1993, 1995-1998, 2001". `career_end` is kept, being a different
      // fact and a cleaner one.
      ['career_end', 'Career end', 'career', 65],
      ['debutdate', 'Debut', 'career', 60],
      ['nationalyears', 'International years', 'career', 62],
      ['draft', 'Draft', 'career', 70],
      ['draft_year', 'Draft year', 'career', 70],
      ['draft_team', 'Drafted by', 'career', 72],
    ];

    return this.factsFrom(box, map);
  }

  /**
   * A cricketer's playing span, and whether it is over.
   *
   * The evidence a cricket article carries and a football one does not. Club
   * spells are how a footballer's status is derived, and cricketers have almost
   * none recorded: the ingested squads are national sides and franchises with no
   * dates, so 4,769 cricketers had no evidence either way and their pages showed
   * no badge at all. Tendulkar, who retired in 2013, was one of them.
   *
   * **The start is the first international**, taken from `internationalspan` or
   * the earliest debut year, and club years are consulted only for a player who
   * has none. A career that begins with a domestic debut reads wrongly on a page
   * that calls the figure a career start: Dhoni's said 1999, the year he first
   * played for Bihar, while he is universally described as debuting in 2004,
   * when he first played for India.
   *
   * The end is the opposite: the latest year from any source, because a player
   * who has retired from internationals and still turns out in a franchise
   * league has not stopped playing. Dhoni's 2025 is his IPL, and it is why he
   * reads as active rather than retired in 2019.
   *
   * Null where the article says nothing, which stays null: no badge is better
   * than a wrong one.
   */
  async fetchCricketCareerSpan(
    title: string,
  ): Promise<{ start: number | null; end: number | null; ongoing: boolean } | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    // The cricketer box by name, not the first one on the page: Dhoni's
    // article opens with an officeholder infobox for an honorary army rank.
    const box = parseInfobox(wikitext, 'cricketer');
    if (!box) return null;

    const yearsIn = (value: string | undefined): number[] =>
      value
        ? [...value.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]))
        : [];

    const stillGoing = (value: string | undefined): boolean =>
      value !== undefined && /present|current/i.test(value);

    const internationalSpans = [box.internationalspan, box.nationalyears];
    const clubSpans = Array.from({ length: 8 }, (_, index) => box[`year${index + 1}`]);

    // Debut years, which are the harder evidence for a start: a span reading
    // "2004–2019" and `odidebutyear = 2004` agree, and where they disagree the
    // debut field is the one stating a single match rather than a range.
    const debutYears = ['testdebutyear', 'odidebutyear', 't20idebutyear']
      .map((field) => parseNumber(box[field] ?? ''))
      .filter((year): year is number => year !== null);

    const internationalYears = [...internationalSpans.flatMap(yearsIn), ...debutYears];

    // The first international, or the first of anything for a player who never
    // played one.
    const startCandidates =
      internationalYears.length > 0 ? internationalYears : clubSpans.flatMap(yearsIn);

    // The last international, on the same footing as the start. Franchise years
    // are deliberately excluded: Dhoni's article runs his Chennai Super Kings
    // spell to 2025 and he last played for India in 2019, and taking the later
    // of the two labelled him Active six years after his international
    // retirement. A career in these badges is an international career, or the
    // whole domestic record of a player who never had one.
    const lastYears = ['lasttestyear', 'lastodiyear', 'lastt20iyear']
      .map((field) => parseNumber(box[field] ?? ''))
      .filter((year): year is number => year !== null);

    const endCandidates =
      internationalYears.length > 0
        ? [...internationalYears, ...lastYears]
        : clubSpans.flatMap(yearsIn);

    // "present" counts from the international span for anyone who has played
    // one, and from a club span only for a domestic-only player. An open-ended
    // franchise row says nothing about an international career.
    const ongoing =
      internationalYears.length > 0
        ? internationalSpans.some(stillGoing)
        : clubSpans.some(stillGoing);

    const start = startCandidates.length > 0 ? Math.min(...startCandidates) : null;
    const end = endCandidates.length > 0 ? Math.max(...endCandidates) : null;

    if (start === null && end === null && !ongoing) return null;

    return { start, end, ongoing };
  }

  /**
   * A cricketer's per-format career record.
   *
   * Cricket infoboxes use a `columnN` pattern: `column1 = Test`, `matches1`,
   * `runs1`, `bat avg1` and so on, repeated for each format a player has
   * played. That maps exactly onto the discipline model, which is why cricket
   * statistics work here and did not with the previous source.
   *
   * Three infobox fields carry two statistics each, and both halves are kept:
   * `100s/50s` is hundreds and fifties, `catches/stumpings` is a fielding and a
   * wicketkeeping figure, and taking only the first of each was throwing away a
   * column the player page shows. A missing half is written as a dash or an en
   * dash and yields nothing rather than a zero.
   */
  async fetchCricketStats(title: string): Promise<WikiStatBlock[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    // The cricketer box by name, not the first one on the page: Dhoni's
    // article opens with an officeholder infobox for an honorary army rank.
    const box = parseInfobox(wikitext, 'cricketer');
    if (!box) return [];

    const blocks: WikiStatBlock[] = [];

    for (let column = 1; column <= 6; column += 1) {
      const label = box[`column${column}`];
      if (!label) continue;

      const discipline = this.disciplineFor(label);
      if (!discipline) continue;

      const stats: Record<string, number | string> = {};

      const numeric: [string, string][] = [
        ['matches', 'matches'],
        ['runs', 'runs'],
        ['bat avg', 'batting_average'],
        ['wickets', 'wickets'],
        ['bowl avg', 'bowling_average'],
        ['deliveries', 'deliveries'],
        ['fivefor', 'five_wickets'],
      ];

      for (const [source, key] of numeric) {
        const raw = box[`${source}${column}`];
        if (!raw) continue;

        const parsed = parseNumber(raw);
        if (parsed !== null) stats[key] = parsed;
      }

      // Paired fields: "81/116" and "186/–". Each half is its own registry key.
      const paired: [string, string, string][] = [
        ['100s/50s', 'hundreds', 'fifties'],
        ['catches/stumpings', 'catches', 'stumpings'],
      ];

      for (const [source, firstKey, secondKey] of paired) {
        const raw = box[`${source}${column}`];
        if (!raw) continue;

        const halves = raw.split('/');
        for (const [index, key] of [firstKey, secondKey].entries()) {
          const parsed = parseNumber(halves[index] ?? '');
          if (parsed !== null) stats[key] = parsed;
        }
      }

      // Text, and deliberately not parsed into a number. A highest score of
      // "248*" is an unbeaten innings and the asterisk is the fact that makes
      // it one; a best return of "5/32" is five wickets for thirty-two and
      // means nothing reduced to either figure alone.
      const text: [string, string][] = [
        ['top score', 'highest_score'],
        ['best bowling', 'best_bowling'],
      ];

      for (const [source, key] of text) {
        const raw = box[`${source}${column}`];
        if (!raw) continue;

        const cleaned = cleanCricketFigure(raw);
        if (cleaned) stats[key] = cleaned;
      }

      // Strike rate is not in the infobox, but it is the column a T20 record is
      // read on, so it is computed where both inputs are present. Balls faced
      // is not published either, so this is left to the aggregation job rather
      // than guessed from deliveries, which are balls *bowled*.

      if (Object.keys(stats).length > 0) {
        blocks.push({
          discipline,
          stats,
          appearances: typeof stats.matches === 'number' ? stats.matches : null,
        });
      }
    }

    return blocks;
  }

  /**
   * A basketball player's career averages, per competition phase.
   *
   * Wikipedia carries what the NBA's own statistics service will not license:
   * per-season tables with games, minutes, shooting percentages, rebounds,
   * assists and points, each ending in a career summary row. Three tables
   * appear, for the regular season, the playoffs and college, and they are kept
   * apart because a playoff average is drawn from a different pool of opponents
   * than a regular-season one.
   *
   * Only the career row is taken. Per-season rows are real data and belong in a
   * season-scoped table that does not exist yet; storing them flattened into a
   * career row would silently overwrite one season with the next.
   */
  async fetchBasketballStats(title: string): Promise<WikiStatBlock[]> {
    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    const tables = parseTables(html);
    const blocks: WikiStatBlock[] = [];

    // Column meaning comes from the header rather than the position, because
    // older articles omit steals and blocks and every index after them shifts.
    const columnMap: Record<string, string> = {
      gp: 'games_played',
      ppg: 'points_per_game',
      rpg: 'rebounds_per_game',
      apg: 'assists_per_game',
      spg: 'steals_per_game',
      bpg: 'blocks_per_game',
      mpg: 'minutes_per_game',
      'fg%': 'field_goal_percentage',
      '3p%': 'three_point_percentage',
      'ft%': 'free_throw_percentage',
    };

    // Order matters: the tables appear regular season, playoffs, college, and
    // nothing in the markup says which is which.
    const phases = ['regular_season', 'playoffs', 'college'] as const;
    let phaseIndex = 0;

    for (const table of tables) {
      const headers = table.headers.map((header) => header.toLowerCase().trim());
      if (!headers.includes('year') || !headers.includes('gp')) continue;

      // The career row is labelled, not positional. Curry's regular-season
      // table ends with an "All-Star" row rather than "Career", so taking the
      // last row would record his All-Star averages as his career.
      const careerRow = table.rows.find((row) => /^career$/i.test((row.cells[0] ?? '').trim()));
      if (!careerRow) {
        phaseIndex += 1;
        continue;
      }

      // The career row is shorter than the header: "Career" spans the Year and
      // Team columns, so a row of 12 cells sits under 13 headers and every
      // value lands one column to the left. Read positionally, Curry's points
      // average is recorded as his blocks and his shooting percentages vanish.
      //
      // Aligning from the right corrects it, because the trailing columns are
      // the ones that matter and they always line up.
      const offset = headers.length - careerRow.cells.length;

      const stats: Record<string, number> = {};
      for (const [index, header] of headers.entries()) {
        const key = columnMap[header];
        const raw = careerRow.cells[index - offset];
        if (!key || !raw) continue;

        const value = parseNumber(raw);
        if (value === null) continue;

        // Shooting figures are written as ".462" and read better as 46.2%.
        stats[key] =
          key.endsWith('_percentage') && value < 1 ? Number((value * 100).toFixed(1)) : value;
      }

      if (Object.keys(stats).length > 0) {
        blocks.push({
          discipline: phases[phaseIndex] ?? null,
          stats,
          appearances: stats.games_played ?? null,
        });
      }

      phaseIndex += 1;
      if (phaseIndex >= phases.length) break;
    }

    return blocks;
  }

  /**
   * A footballer's career appearances and goals: two of the three headline
   * tiles on a player page, the third being trophies counted from our honours.
   *
   * Football only. Other sports count a career in their own terms and get their
   * own extraction when their data is worked through; a shared "games and
   * goals" reader would only invite one sport's vocabulary onto another's page.
   *
   * Wikipedia's football infoboxes no longer carry a "Total" row: Ronaldo's and
   * Messi's both end at the last club and leave the arithmetic to the reader.
   * So the senior rows are summed here.
   *
   * Summing the infobox rather than our own `person_team` rows is the point of
   * re-fetching: career ingestion skips spells at clubs outside our catalogue,
   * so a stored sum undercounts, while every club a player served appears here
   * whether we hold it or not.
   *
   * Rows without an appearance figure are youth spells and are skipped, as are
   * reserve, B and age-group sides, whose figures would otherwise be counted
   * twice over. Senior international caps are included: 855 for Messi and 991
   * for Ronaldo are the club-plus-country figures a reader recognises, and the
   * page said 855 beside a stale 1,100 until the two agreed.
   */
  async fetchFootballCareerTotals(title: string): Promise<WikiCareerTotals> {
    const career = await this.fetchFootballCareer(title);
    if (career.length === 0) return { games: null, goals: null };

    let games: number | null = null;
    let goals: number | null = null;

    for (const row of career) {
      if (row.apps === null) continue;
      if (/\b(b|c|ii|iii|u\d{2}|reserves?|youth|academy|junior)\b\s*$/i.test(row.team.trim())) {
        continue;
      }

      games = (games ?? 0) + row.apps;
      if (row.goals !== null) goals = (goals ?? 0) + row.goals;
    }

    return { games, goals };
  }

  /**
   * The team trophies a player's article credits them with.
   *
   * The reason this exists: honours reached the database from Wikidata's "award
   * received" statements, which are close to empty for footballers. Pel\u00e9,
   * Maradona, Zidane, Cruyff, Ronaldo and Buffon all held zero, so their pages
   * reported no trophies at all. Wikipedia's own Honours section lists them in
   * full, grouped by club and country.
   *
   * **Team trophies only**: competitions won with a club or a national side. An
   * individual award is a different kind of thing from a league title, and a
   * count that adds a magazine's Team of the Year selection to a World Cup is
   * not a number anybody can check. Those groups are still shown in full in the
   * honours list on the same page; they are simply not totalled here.
   *
   * Counting rules, because a naive count of the section is wrong three times:
   *
   *   - **Individual, Records, Orders and Decorations groups are excluded.**
   *     The Records group is the worst offender: "Second-most appearances in
   *     the UEFA Champions League: 177" contributes a number that is not a
   *     trophy at all.
   *   - **Runner-up lines do not count.** "UEFA Champions League runner-up:
   *     1996\u201397, 1997\u201398" is a record of losing two finals. Where a line
   *     carries both ("FIFA World Cup: 1998; runner-up: 2006"), only the part
   *     before the runner-up clause counts.
   *   - **Each year is one trophy.** "Serie A: 1996\u201397, 1997\u201398" is two
   *     league titles on one line, and counting lines would report one.
   */
  async fetchFootballHonours(title: string): Promise<WikiHonourCount> {
    const html = await this.client.fetchHtml(title);
    if (!html) return { won: null, groups: 0 };

    // The section runs from its own heading to the next top-level one. Anchored
    // on the heading id rather than its text, which varies.
    const heading = /id="(Honours|Honors|Career_honours|Honours_and_awards)"/.exec(html);
    if (!heading) return { won: null, groups: 0 };

    const rest = html.slice(heading.index);
    const nextSection = rest.search(/<h2\b/);
    const section = nextSection > 0 ? rest.slice(0, nextSection) : rest;

    let won = 0;
    let groups = 0;

    // Two levels of suppression, because the two kinds of label nest. A
    // heading ("Manager") governs everything down to the next heading, while a
    // bold or plain label ("Individual") governs only the list right after it.
    // Tracking one flag conflated them: Guardiola's managerial honours sit under
    // an h3 whose first club label re-enabled counting, and his tile credited a
    // player with 59 trophies won from the touchline.
    let sectionExcluded = false;
    let labelExcluded = false;

    // Walked in document order, because a label applies to the lists that
    // follow it. Articles label their groups inconsistently: some use headings
    // ("Player", "Records") and some a bold or plain paragraph ("Real Madrid",
    // "Individual"), so all of them are treated as labels.
    const tokens = section.matchAll(
      /<(b|p|h[345])\b[^>]*>([\s\S]{0,200}?)<\/\1>|<li\b[^>]*>([\s\S]*?)<\/li>/g,
    );

    for (const token of tokens) {
      const tag = token[1];
      const label = token[2];
      const item = token[3];

      if (tag !== undefined && label !== undefined) {
        const text = this.plainText(label);
        // Short, because a group label is a name and not a sentence: a
        // paragraph of prose inside the section is not a heading.
        if (!text || text.length >= 60) continue;

        const excluded = EXCLUDED_HONOUR_GROUPS.test(text);

        if (tag.startsWith('h')) {
          sectionExcluded = excluded;
          labelExcluded = false;
        } else {
          labelExcluded = excluded;
        }

        if (!sectionExcluded && !labelExcluded) groups += 1;
        continue;
      }

      if (sectionExcluded || labelExcluded || item === undefined) continue;

      const text = this.plainText(item);
      if (!text) continue;

      // Everything from a runner-up, third-place or losing-finalist clause
      // onwards is a record of not winning.
      const winning = text.split(NOT_A_WIN)[0] ?? '';

      // Only what follows the colon, so a competition whose name carries a year
      // ("Copa Am\u00e9rica 2021") is not itself counted as a win.
      if (!winning.includes(':')) continue;

      const years = winning.slice(winning.indexOf(':') + 1).match(/\d{4}(?:[\u2013-]\d{2,4})?/g);
      if (!years) continue;

      won += years.length;
    }

    return { won, groups };
  }

  /**
   * A player's honours as titles and years, from their Wikipedia article.
   *
   * Wikidata is the primary source for honours and is incomplete in a way that
   * shows: it has three of Ronaldo's five Ballons d'Or and omits Messi's 2022
   * World Cup Golden Ball entirely. The article's honours section has both,
   * because it is maintained by people who follow the sport.
   *
   * The same walk as `fetchFootballHonours`, which counts these lines and throws
   * the content away. This keeps it. Manager and youth sections are excluded by
   * the same rules, since a trophy won from the touchline is not a playing
   * honour.
   *
   * Deliberately conservative: a line must carry a colon and a four-digit year
   * to be read at all, so prose inside the section produces nothing rather than
   * a fabricated honour.
   */
  async fetchFootballHonourList(title: string): Promise<{ title: string; year: number | null }[]> {
    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    const heading = /id="(Honours|Honors|Career_honours|Honours_and_awards)"/.exec(html);
    if (!heading) return [];

    const rest = html.slice(heading.index);
    const nextSection = rest.search(/<h2\b/);
    // Figures removed before anything is read. An image caption is prose that
    // happens to name an award and a year, and Rodri's article carries "Rodri
    // winning the 2026 FIFA World Cup Golden Ball" beside the section, which the
    // walk below read as an honour he has already won.
    const section = (nextSection > 0 ? rest.slice(0, nextSection) : rest)
      .replace(/<figure\b[\s\S]*?<\/figure>/g, ' ')
      .replace(/<figcaption\b[\s\S]*?<\/figcaption>/g, ' ');

    const honours: { title: string; year: number | null }[] = [];
    let sectionExcluded = false;
    let labelExcluded = false;

    const tokens = section.matchAll(
      /<(b|p|h[345])\b[^>]*>([\s\S]{0,200}?)<\/\1>|<li\b[^>]*>([\s\S]*?)<\/li>/g,
    );

    for (const token of tokens) {
      const tag = token[1];
      const label = token[2];
      const item = token[3];

      if (tag !== undefined && label !== undefined) {
        const text = this.plainText(label);
        if (!text || text.length >= 60) continue;

        const excluded = EXCLUDED_HONOUR_LIST_GROUPS.test(text);
        if (tag.startsWith('h')) {
          sectionExcluded = excluded;
          labelExcluded = false;
        } else {
          labelExcluded = excluded;
        }
        continue;
      }

      if (sectionExcluded || labelExcluded || item === undefined) continue;

      const text = this.plainText(item);
      if (!text) continue;

      // Anything from a runner-up clause onwards records not winning.
      const winning = text.split(NOT_A_WIN)[0] ?? '';
      const colon = winning.indexOf(':');
      if (colon < 0) continue;

      const rawName = winning.slice(0, colon).trim();
      if (!rawName || rawName.length > 160) continue;

      // Season ranges are one win, not two. Articles write a season-based
      // honour as "2007-08, 2010-11, 2013-14, 2014-15", and matching bare
      // four-digit numbers counted each range twice: Ronaldo's four European
      // Golden Shoes became six rows, and every league title was inflated the
      // same way.
      //
      // A range is therefore matched first and reduced to its starting year,
      // which is how the rest of the codebase labels a season.
      const yearField = winning.slice(colon + 1);
      const years = [...yearField.matchAll(/(\d{4})(?:\s*[\u2013\u2014-]\s*(\d{2,4}))?/g)].map(
        (match) => match[1]!,
      );
      if (years.length === 0) continue;

      // Articles join an award's historical names with slashes, so Messi's line
      // reads "FIFA World Player of the Year/FIFA Ballon d'Or/The Best FIFA
      // Men's Player". Stored whole that is one unrecognisable title; the first
      // name is the one the award is listed under.
      const name = (rawName.split('/')[0] ?? rawName).trim();
      if (!name || name.length > 80) continue;

      // Prose, not an honour. The section carries trivia lines in the same list
      // markup ("One of only nine players to take part in five FIFA World
      // Cups"), and a sentence is recognisable by starting with a word that no
      // award title starts with.
      if (
        /^(one of|the only|first|second|third|holds|scored|became|most |named |set )/i.test(name)
      ) {
        continue;
      }

      // Aggregator selections and academic awards are not football honours.
      if (/whoscored|opta|honorary doctor|doctorate|university of/i.test(name)) continue;

      // One row per year, matching how the honour table stores repeats: eight
      // Ballons d'Or are eight rows, not one row saying eight.
      //
      // Only genuinely future years are rejected. An earlier version excluded
      // the current year as well, on the theory that an article lists a
      // tournament a player is about to enter; that was wrong, and it dropped
      // real honours won this year. The honours section records what has been
      // won, and a caption promising a future one is handled by stripping
      // figures rather than by distrusting the year.
      const currentYear = new Date().getFullYear();
      for (const year of years) {
        const parsed = Number(year);
        if (parsed > currentYear || parsed < 1850) continue;
        honours.push({ title: name, year: parsed });
      }
    }

    return honours;
  }

  /** An HTML fragment as displayable text, references and markup removed. */
  private plainText(fragment: string): string {
    return (
      fragment
        // Reference markers carry years of their own and would be counted.
        .replace(/<sup[\s\S]*?<\/sup>/g, '')
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * The titles a club's article credits it with.
   *
   * A different shape from a player's honours and so a different reader. A
   * player writes a bulleted list of years; a club states a count, and does so
   * in one of two layouts, both handled here:
   *
   *   - a table, Competition | Titles | Seasons, whose Titles column holds the
   *     figure (Real Madrid, Liverpool, Bayern);
   *   - a list reading "Serie A Winners (3): 1941\u201342, ..." with the
   *     runners-up on their own line (Roma, Tottenham, Aston Villa).
   *
   * The stated count is taken rather than the years listed beside it. The two
   * should agree, and where they do not \u2014 pages marking shared titles \u2014 the
   * count is what the article is actually asserting.
   *
   * Regional titles are excluded. Real Madrid's table closes with 27 regional
   * and friendly trophies which no published count of its honours includes, and
   * adding them produced a total a reader could not reconcile with anything.
   */
  async fetchClubTitles(title: string): Promise<WikiTitleCount> {
    const html = await this.client.fetchHtml(title);
    if (!html) return { titles: null, competitions: 0 };

    const heading = /id="(Honours|Honors|Achievements|Honours_and_achievements)"/.exec(html);
    if (!heading) return { titles: null, competitions: 0 };

    const rest = html.slice(heading.index);
    const nextSection = rest.search(/<h2\b/);
    const section = nextSection > 0 ? rest.slice(0, nextSection) : rest;

    let titles = 0;
    let competitions = 0;
    // The type is written once, in the first row of its group, and the rows
    // beneath it carry only a competition. So it persists until replaced.
    let type = '';

    for (const table of section.matchAll(/<table[\s\S]*?<\/table>/g)) {
      // Only a table that says it counts titles. The Honours heading is often
      // followed by a European-record table of matches played, won and drawn,
      // and summing its Won column gave Leverkusen 534 titles.
      if (!/>\s*(?:Titles|Winners|Wins|Trophies)\b/i.test(table[0])) continue;
      if (/Matches played|\bPld\b|Goal difference|\bGF\b/i.test(table[0])) continue;

      for (const row of table[0].split(/<tr[^>]*>/)) {
        const cells = stripCells(row);
        if (cells.length < 2) continue;

        // A row is either [type, competition, count, seasons] where its group
        // begins, or [competition, count, seasons] where it continues. The
        // count is the first cell that is a bare integer.
        const countIndex = cells.findIndex((cell) => /^\d{1,3}$/.test(cell));
        if (countIndex < 1) continue;

        if (countIndex >= 2) type = cells[countIndex - 2] ?? type;

        if (EXCLUDED_TITLE_TYPES.test(type)) continue;

        const count = parseNumber(cells[countIndex]!);
        if (count === null) continue;

        titles += count;
        competitions += 1;
      }
    }

    // The second shape, and the more common one: a list rather than a table,
    // written "Serie A Winners (3): 1941\u201342, 1982\u201383, 2000\u201301" with the
    // runners-up on a line of their own. Roma, Lazio, Tottenham, Aston Villa,
    // Newcastle and Fiorentina all use it, and a table-only reader skipped 67
    // of the first 150 clubs.
    if (competitions === 0) {
      for (const item of section.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
        const text = this.plainText(item[1]!);
        if (!text) continue;

        // A losing record, however it is phrased. Checked before the winners
        // pattern because "Runners-up: (14)" also carries a bracketed count.
        if (NOT_A_WIN.test(text)) continue;
        if (EXCLUDED_TITLE_TYPES.test(text)) continue;
        if (EXCLUDED_COMPETITIONS.test(text)) continue;

        // A winning line at all: "Winners", "Winner" or "Champions".
        if (!/\b(winners?|champions?)\b/i.test(text)) continue;

        // Where the count is stated in brackets \u2014 "Serie A Winners (3)" \u2014 take
        // it. The years after the colon confirm it and are not counted as well,
        // since the two disagree on pages marking shared titles.
        const stated = /\b(?:winners?|champions?)\b[^(:]*\((\d{1,3})\)/i.exec(text);

        if (stated) {
          const count = parseNumber(stated[1]!);
          if (count === null) continue;

          titles += count;
          competitions += 1;
          continue;
        }

        // Otherwise the years are the only count there is: Newcastle writes
        // "FA Cup Winners: 1909\u201310, 1923\u201324, ..." with no figure at all, and
        // a reader demanding brackets scored the club zero.
        const years = text.slice(text.indexOf(':') + 1).match(/\d{4}(?:[\u2013-]\d{2,4})?/g);
        if (!text.includes(':') || !years) continue;

        titles += years.length;
        competitions += 1;
      }
    }

    return { titles, competitions };
  }

  /**
   * A footballer's club career, from the infobox career table.
   *
   * Rendered HTML rather than wikitext: the career rows are a table inside the
   * infobox, and in source they are a wall of templates.
   */
  async fetchFootballCareer(
    title: string,
  ): Promise<{ years: string; team: string; apps: number | null; goals: number | null }[]> {
    const html = await this.client.fetchHtml(title);
    if (!html) return [];

    const infobox = /<table[^>]*class="[^"]*infobox[^"]*"[^>]*>[\s\S]*?<\/table>/.exec(html);
    if (!infobox) return [];

    // Parsed directly rather than through `parseTables`, which requires a
    // header row. An infobox has none: its career rows are bare `<td>` pairs
    // under a "Senior career" heading, so routing them through the table parser
    // returned nothing at all for every player.
    //
    // Rows come in two shapes. Youth spells carry two cells (years, club) and
    // senior spells carry four (years, club, appearances, goals in brackets).
    // Both are kept, because a youth spell is part of a career timeline even
    // without figures attached.
    const career: { years: string; team: string; apps: number | null; goals: number | null }[] = [];

    for (const chunk of infobox[0].split(/<tr[^>]*>/)) {
      const cells = stripCells(chunk);

      const [years, team, apps, goals] = cells;

      // A career row begins with a year. Everything else in an infobox is
      // biography and is skipped.
      if (!years || !team || !/^\d{4}/.test(years)) continue;
      if (cells.length < 2) continue;

      career.push({
        years,
        team,
        apps: apps ? parseNumber(apps) : null,
        // Goals are rendered parenthesised: "(474)".
        goals: goals ? parseNumber(goals.replace(/[()]/g, '')) : null,
      });
    }

    return career;
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /** Resolves a records-article title for a club, or null if it has none. */
  async findRecordsArticle(teamName: string, sportSlug = 'football'): Promise<string | null> {
    // Cricket names its records articles per format ("List of India Test
    // cricket records") rather than as one combined page, so the football
    // pattern finds nothing for a national side. The country is extracted from
    // the team name and the Test article searched for, that being the format
    // with the deepest records.
    const searches =
      sportSlug === 'cricket'
        ? [
            `intitle:records ${teamName.replace(/\b(national|cricket|team|men's|women's)\b/gi, '').trim()} Test cricket`,
            `intitle:records intitle:statistics ${teamName}`,
          ]
        : [
            `intitle:records intitle:statistics ${teamName}`,
            // The same search with the qualifiers stripped. Wikipedia's search
            // ranks on the whole phrase, and a name like "France men's national
            // association football team" scores so many generic words that
            // France's own records article fell outside the first five hits
            // while five other countries' did not.
            `intitle:records intitle:statistics ${this.plainTeamName(teamName)}`,
          ];

    // National sides name their records article to a fixed pattern, so it is
    // cheaper and far more accurate to ask for the title outright than to
    // search for it. Searching alone left France, whose page exists, with no
    // records at all. A hit returns immediately: the guessed title already
    // names the team, so the name check below would be a formality, and every
    // avoided search is one fewer request against a rate-limited endpoint.
    for (const guess of this.guessedRecordsTitles(teamName, sportSlug)) {
      if (await this.client.exists(guess)) return guess;
    }

    const candidates: string[] = [];

    for (const search of searches) {
      candidates.push(...(await this.client.resolveTitles(search, 8)));
      // The second search exists only to rescue names the first is too diluted
      // to match, so it is skipped whenever the first found anything at all.
      if (candidates.length > 0) break;
    }

    if (candidates.length === 0) return null;

    // Accents decomposed before stripping, not after. Removing everything
    // outside [a-z0-9] turns "Atlético" into "atltico", which can never match
    // the "atletico" in its own article title, so the club was rejected from
    // its own records page.
    const normalise = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    // Words that appear in almost every club and country article and therefore
    // prove nothing about a match. Requiring only "some word in common" let
    // Bangladesh's records article be returned for Afghanistan, Zimbabwe and
    // England Women alike, because all four share "cricket" and "team", and
    // every one of those pages was then filled with Bangladesh's records.
    const generic = new Set([
      'national',
      'cricket',
      'football',
      'team',
      'club',
      'mens',
      'womens',
      'women',
      'list',
      'records',
      'statistics',
      'association',
      'united',
      'city',
      'sports',
    ]);

    // Legal-form words. A club's stored name is often its registered one, and
    // its article is not: "Real Madrid Club de Fútbol" is filed as "Real Madrid
    // CF". Requiring every word of the legal name rejected the club's own
    // article, which is how Real Madrid ended up with no tables at all, so
    // these are stripped before the comparison.
    const legalForms = new Set([
      'cf',
      'fc',
      'sad',
      'sa',
      'ac',
      'as',
      'ss',
      'sc',
      'cd',
      'ud',
      'rc',
      'de',
      'del',
      'la',
      'el',
      'futbol',
      'football',
      'futebol',
      'calcio',
      'balompie',
      'clube',
      'sporting',
    ]);

    const distinctive = teamName
      .split(/\s+/)
      .map(normalise)
      // Three characters, not four. "Test cricket records" articles are named
      // for the country alone, and a four-character floor drops England, whose
      // distinctive word is exactly seven but whose sibling cases include
      // shorter country names.
      .filter((word) => word.length >= 3 && !generic.has(word) && !legalForms.has(word));

    // Nothing distinctive to check against means the name is entirely generic,
    // and accepting the search's best guess would be a coin toss.
    if (distinctive.length === 0) return null;

    // Every distinctive word must appear, not merely one of them. Matching on
    // any single word gave Atlético Madrid and Real Sociedad both of Real
    // Madrid's leaderboards, because "madrid" and "real" are shared, and the
    // site published Cristiano Ronaldo as Real Sociedad's record scorer.
    const names = (candidate: string) => {
      const candidateNormalised = normalise(candidate);
      return distinctive.every((word) => candidateNormalised.includes(word));
    };

    // A women's article is never the men's team's records, and vice versa. PSG's
    // search returned the women's page, so the club's record appearance holder
    // was published as Sabrina Delannoy.
    const wantsWomen = /\bwomen'?s?\b/i.test(teamName);
    const genderMatches = (candidate: string) => /\bwomen'?s?\b/i.test(candidate) === wantsWomen;

    // The first candidate that actually names the team wins, rather than the
    // first candidate outright.
    for (const candidate of candidates) {
      if (names(candidate) && genderMatches(candidate)) return candidate;
    }

    return null;
  }

  /**
   * A team name with the qualifiers every side shares removed.
   *
   * "France men's national association football team" is nine words of which
   * one identifies the team. The rest only dilute a search.
   */
  private plainTeamName(teamName: string): string {
    return teamName
      .replace(/\b(men's|women's|national|association|team)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Records-article titles worth trying directly, most likely first. */
  private guessedRecordsTitles(teamName: string, sportSlug: string): string[] {
    // Only the national-team pattern is guessable. Club records articles are
    // named inconsistently ("Liverpool F.C. records and statistics" beside
    // "List of Arsenal F.C. records"), which is why searching exists at all.
    if (!/\bnational\b/i.test(teamName)) return [];

    const country = this.plainTeamName(teamName)
      .replace(new RegExp(`\\b${sportSlug}\\b`, 'gi'), ' ')
      .replace(/\b(football|cricket|basketball|soccer)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!country) return [];

    const sportWord = sportSlug === 'football' ? 'football' : sportSlug;

    return [
      `${country} national ${sportWord} team records and statistics`,
      `${country} men's national ${sportWord} team records and statistics`,
    ];
  }

  private factsFrom(box: Infobox, map: [string, string, string, number][]): WikiFact[] {
    const facts: WikiFact[] = [];
    const seen = new Set<string>();

    for (const [source, label, category, order] of map) {
      const value = box[source];
      if (!value || seen.has(label)) continue;

      // Templates occasionally leave residue, and a value that is only
      // punctuation is worse than no value at all.
      const cleaned = value.replace(/^[\s,;|]+|[\s,;|]+$/g, '');
      if (cleaned.length < 1 || cleaned.length > 300) continue;
      if (!/[a-zA-Z0-9]/.test(cleaned)) continue;

      // A field mapped to the `honours` category is meant to state a count
      // ("18"), not enumerate the years: `league_champs` reads that way for
      // the NBA (Lakers: "18") but as a bulleted list of seasons for the NFL
      // (Chiefs: "AFL championships (3) 1962, 1966, 1969"), and there is no
      // per-sport switch in this shared field map to tell the two apart in
      // advance. Three or more four-digit years is the shape of the list
      // form specifically, so it is caught here rather than by dropping the
      // field for every sport that uses it usefully. See the note beside
      // `league_champs` below for why `conf_champs`/`div_champs` are instead
      // simply not mapped at all: those are *always* a list, never a count.
      if (
        category === 'honours' &&
        (cleaned.match(/\b(1[89]\d{2}|20\d{2})\b/g)?.length ?? 0) >= 3
      ) {
        continue;
      }

      seen.add(label);
      facts.push({
        key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        label,
        value: cleaned,
        category,
        order,
      });
    }

    return facts;
  }

  /** Converts a parsed table into ranking entries, picking the value column by header. */
  /**
   * Test seam onto `rowsToEntries`.
   *
   * Column choice is where this class has been wrong most often, and every case
   * needed a live article to reproduce. Exposing it keeps those cases as fixtures.
   */
  rankingsForTest(table: ParsedTable, valueHeaders: string[]): WikiRankingEntry[] {
    return this.rowsToEntries(table, valueHeaders);
  }

  private rowsToEntries(table: ParsedTable, valueHeaders: string[]): WikiRankingEntry[] {
    // Accents decomposed before stripping, not after. Removing everything
    // outside [a-z0-9] turns "Atlético" into "atltico", which can never match
    // the "atletico" in its own article title, so the club was rejected from
    // its own records page.
    const normalise = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const headers = table.headers.map(normalise);

    // Combined columns such as "League Games/Goals" hold two numbers in one
    // cell and cannot be read as a single value, so they are passed over in
    // favour of a column that holds one.
    const isCombined = (header: string) => header.includes('games') && header.includes('goals');

    // Rate columns are never the ranked value. Manchester United's scorers
    // table ends with "Goals per game", and a substring match for "goals"
    // found it before "Total", so the club's top scorer was published as
    // "Tommy Taylor 0.689". Ratios are excluded outright rather than ranked
    // lower, because no records table ranks players by one.
    const isRate = (header: string) =>
      header.includes('pergame') ||
      header.includes('permatch') ||
      header === 'ratio' ||
      header.includes('average');

    // Columns whose cells are date spans or durations rather than counts. The
    // Netherlands' tables carry both "Matches" and "Total career", and a search
    // for "total" matched the career column, whose cells read "2003–2018": no
    // row parsed as a number, so the country published no tables at all.
    const isSpan = (header: string) =>
      header.includes('career') ||
      header.includes('period') ||
      header.includes('minutes') ||
      header.includes('date') ||
      header.includes('years');

    // Exact header match first, then prefix, then substring. Without the
    // ordering a column called "Goals per game" satisfies a search for "goals"
    // as readily as the column actually called "Goals".
    const findColumn = (term: string): number => {
      const wanted = normalise(term);
      const usable = (candidate: string) =>
        !isCombined(candidate) && !isRate(candidate) && !isSpan(candidate);

      const exact = headers.findIndex((candidate) => candidate === wanted && usable(candidate));
      if (exact >= 0) return exact;

      const prefixed = headers.findIndex(
        (candidate) => candidate.startsWith(wanted) && usable(candidate),
      );
      if (prefixed >= 0) return prefixed;

      return headers.findIndex((candidate) => candidate.includes(wanted) && usable(candidate));
    };

    const valueIndex = valueHeaders.map(findColumn).find((index) => index >= 0);

    // "Player" first, then "Name". The internationals lists head the column
    // "Name" while records articles head it "Player", and requiring "player"
    // alone made those lists unreadable.
    // "Name" is matched as a prefix rather than exactly: Rangers heads the
    // column "Name and nationality". It is still not a substring match, because
    // "Name" appears inside headers like "Opponent name" that are not people.
    const nameIndex =
      headers.findIndex((header) => header.includes('player')) >= 0
        ? headers.findIndex((header) => header.includes('player'))
        : headers.findIndex((header) => header.startsWith('name'));
    if (nameIndex < 0) return [];

    // Falling back to a combined column when no plain one exists. Arsenal's
    // records article offers only "League Games/Goals" style columns, whose
    // cells read "406/0", and skipping them left the club with no tables at
    // all. Which half to take depends on what is being ranked.
    const combinedIndex =
      valueIndex === undefined ? headers.findIndex((header) => isCombined(header)) : -1;
    if (valueIndex === undefined && combinedIndex < 0) return [];

    const wantsGoals = valueHeaders.some((header) => header.includes('goal'));

    const entries: WikiRankingEntry[] = [];

    // Some tables carry a rank column the header row does not declare. Roma's
    // appearance table heads four columns "Player | Position | Appearances |
    // Goals" and then writes five cells a row, the first being the rank, and the
    // renderer drops the surplus. Read positionally, "Player" lands on the rank
    // and every row was rejected for having a numeric name.
    //
    // Detected from the data rather than the width, because the widths match:
    // the name column reads as a bare number on every row while the column
    // after it does not.
    const numeric = (value: string | undefined) =>
      value !== undefined && /^\d+$/.test(value.trim());

    const offset =
      table.rows.length > 0 &&
      table.rows.every((row) => numeric(row.cells[nameIndex]) && !numeric(row.cells[nameIndex + 1]))
        ? 1
        : 0;

    const widest = table.rows.reduce((most, row) => Math.max(most, row.cells.length), 0);

    for (const row of table.rows) {
      // A row narrower than the widest keeps its own indexing. Merged cells are
      // already resolved by the parser, so a short row is malformed rather than
      // offset.
      const shift = row.cells.length >= widest ? offset : 0;

      const rawName = row.cells[nameIndex + shift];
      const rawCell = row.cells[(valueIndex ?? combinedIndex) + shift];
      if (!rawName || !rawCell) continue;

      // Several countries' tables append a link to a per-player match list, so
      // the cell renders as "Lionel Messi ( list )" and that is what was
      // published as the player's name. Only trailing editorial annotations are
      // removed: a genuine disambiguator is part of the name Wikipedia uses.
      const name = rawName
        .replace(/\s*\(\s*(list|lists|matches|goals|details|stats|captain|c|vc)\s*\)\s*$/i, '')
        // A trailing asterisk or dagger marks a still-active player. It is a
        // footnote, not part of the name: the lists of internationals rendered
        // "Erling Haaland *".
        .replace(/[\s*†‡^]+$/, '')
        .trim();
      if (!name) continue;

      // A combined cell reads "406/0": appearances before the slash, goals
      // after it.
      const rawValue =
        valueIndex === undefined ? (rawCell.split('/')[wantsGoals ? 1 : 0] ?? '') : rawCell;

      // Many records tables annotate the ranked figure with a second one in
      // parentheses: Real Madrid's scorers read "450 (438)", meaning 450 goals
      // in 438 appearances, and Manchester United's appearances read
      // "963 (161)" for appearances including substitutions. The bracketed
      // figure is context, never the ranked value, so it is dropped before
      // parsing. Without this every such row was rejected outright, which is
      // why the two largest clubs had no scorers table at all.
      const value = parseNumber(stripParenthetical(rawValue));
      if (value === null) continue;

      // The link is taken from the name's own cell rather than from the row,
      // because many tables place a flag icon before the name and the row's
      // first link is therefore a country.
      //
      // Within that cell the flag still comes first: Real Madrid's scorers gave
      // "Portugal" for Ronaldo and "France" for Benzema, so every entry linked
      // to a nationality. The player is the link whose target resembles the
      // cell's text, allowing for the disambiguator Wikipedia appends
      // ("Raúl (footballer)").
      //
      // There is deliberately no fallback to the first link. Where the display
      // name and the article title genuinely differ, as with "Manolo Sanchís"
      // linking to "Manuel Sanchís Hontiyuelo", falling back would attach the
      // flag's country link instead, and a row that quietly navigates to Spain
      // is worse than a row that does not navigate at all.
      // Redlinks and non-article hrefs are not entities. Wikipedia renders a
      // link to a page that does not exist as "Title?action=edit&redlink=1",
      // and carrying that through produced ranking rows pointing at an edit
      // form.
      const candidates = (row.cellLinks[nameIndex + shift] ?? []).filter(
        (candidate) => !candidate.includes('?') && !candidate.includes('action=edit'),
      );
      const simplify = (value: string) =>
        value
          .replace(/\s*\([^)]*\)\s*$/, '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
      const wanted = simplify(name);
      const link =
        candidates.find((candidate) => simplify(candidate) === wanted) ??
        candidates.find((candidate) => simplify(candidate).includes(wanted)) ??
        // Also accept the reverse: a surname-only cell against a full title.
        candidates.find((candidate) => wanted.includes(simplify(candidate)));

      // A name that is purely numeric means the columns were misidentified and
      // the rank column is being read as both name and value. Hearts' tables
      // came back as "1, 2, 3" against values "1, 2, 3" for exactly that
      // reason, which is worse than no table at all.
      if (/^\d+$/.test(name.trim())) continue;

      entries.push({
        // Derived from position rather than read from a column, because a rank
        // column is optional and, where present, is often blank on rows that
        // share a position.
        rank: entries.length + 1,
        name,
        value,
        detail: null,
        link,
      });

      // Deliberately no early break. Truncating as rows are read and sorting
      // afterwards works only on a table that is already a leaderboard: the
      // lists of internationals are alphabetical, so taking the first rows gave
      // Poland's most-capped player as Zygmunt Anczok with 48 rather than
      // Robert Lewandowski with 167.
    }

    // Sorted and renumbered rather than trusted as read. Not every records
    // article lists its rows in order: Fortaleza's goalscorers arrived with 0
    // ranked above 29, because the page sorts by a different column than the
    // one being extracted.
    entries.sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0));

    const ranked = entries.slice(0, 25);
    for (const [index, entry] of ranked.entries()) entry.rank = index + 1;

    // A leaderboard whose top value is zero was not a leaderboard for the thing
    // being asked about.
    if (ranked.length === 0 || Number(ranked[0]?.value ?? 0) <= 0) return [];

    return ranked;
  }

  /**
   * A tennis player's career: their span, their titles and their major results.
   *
   * `Infobox tennis biography` is unusually rich, and it is the only good
   * source for any of this. Wikidata records slam titles inconsistently and
   * frequently not at all: Federer's entity carries one honour, an ESPY award,
   * and none of his twenty majors. The infobox states every one of them in a
   * structured field.
   *
   * The field that matters is the per-major result, which reads
   * `AustralianOpenresult = W (2004, 2006, 2007, 2010, 2017, 2018)` for a
   * champion and `SF (2019)` or `4R` for everybody else. Only a `W` is a title,
   * and the years in the parentheses are the years it was won, so one field
   * yields both the count and the dates.
   *
   * ## On the leading letter
   *
   * Matched anchored at the start, because the result codes overlap as
   * substrings. A value of `W (2008)` is a win; `QF`, `SF` and `F` are not, and
   * `F` in particular means the player **lost** the final. Federer's Olympic
   * singles field reads `F (2012)` and his doubles field `W (2008)`, so a
   * substring test for "W" anywhere would credit him a singles gold he never
   * won, and one that ignored doubles would miss the gold he did.
   *
   * ## On retirement
   *
   * `retired` is present for a player who has stopped and absent for one still
   * competing, which is the signal club spells give in every other sport and
   * which tennis players do not have. Its format varies: a full date
   * ("23 September 2022"), a bare year, or a range ("2022–2026") for a player
   * who came back. The last year mentioned is taken, and a year in the future
   * is a scheduled farewell rather than a completed retirement.
   */
  async fetchTennisCareer(title: string): Promise<TennisCareer | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    // The tennis box specifically, and nothing else.
    //
    // `parseInfobox` takes a preferred template and falls back to whatever
    // infobox the page has, which is right for its other callers and wrong
    // here. Wikidata's "sport: tennis" statement is true of anybody who ever
    // played the game, so this catalogue contains a pop musician, a king and a
    // former Czech president. Accepting the fallback parses their musician and
    // officeholder boxes, finds no result fields, and returns an empty career
    // that reads as "played tennis, won nothing, still active" rather than
    // "not a tennis player". Requiring the template by name is what makes a
    // null here mean something.
    if (!/\{\{\s*Infobox\s+tennis\s+biography\b/i.test(wikitext)) return null;

    const box = parseInfobox(wikitext, 'tennis biography');
    if (!box) return null;

    /** The years inside a result field: "W (2004, 2006)" gives [2004, 2006]. */
    const yearsIn = (value: string): number[] =>
      [...value.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]));

    /**
     * Whether a result field records a win, and in which years.
     *
     * Anchored on the leading token. `W` wins; `F`, `SF`, `QF` and a round
     * number do not.
     */
    const winYears = (value: string | undefined): number[] => {
      if (!value) return [];
      if (!/^\s*'*\s*W\b/.test(value)) return [];
      return yearsIn(value);
    };

    const titles: TennisTitle[] = [];
    for (const major of TENNIS_SLAM_FIELDS) {
      for (const year of winYears(box[major.field.toLowerCase()])) {
        titles.push({ slug: major.slug, name: major.name, year, discipline: 'singles' });
      }
      for (const year of winYears(box[major.doublesField.toLowerCase()])) {
        titles.push({ slug: major.slug, name: major.name, year, discipline: 'doubles' });
      }
    }

    for (const other of TENNIS_OTHER_TITLE_FIELDS) {
      for (const year of winYears(box[other.field.toLowerCase()])) {
        titles.push({ slug: other.slug, name: other.name, year, discipline: 'singles' });
      }
      if (other.doublesField) {
        for (const year of winYears(box[other.doublesField.toLowerCase()])) {
          titles.push({ slug: other.slug, name: other.name, year, discipline: 'doubles' });
        }
      }
    }

    // Deduplicated on (competition, year, discipline). The WTA Finals was held
    // twice in 1986 and Navratilova won both, so her infobox names the year
    // twice; the honour table holds one row per competition and year, so the
    // second is dropped rather than failing the insert.
    const seen = new Set<string>();
    const deduped = titles.filter((entry) => {
      const key = `${entry.slug}:${entry.year}:${entry.discipline}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const turnedProYears = yearsIn(box.turnedpro ?? '');
    const retiredYears = yearsIn(box.retired ?? '');

    // The last year named, because a comeback writes a range. A player whose
    // only retirement year is in the future has announced one rather than
    // completed it, and is still competing today.
    const retiredYear = retiredYears.length > 0 ? Math.max(...retiredYears) : null;

    return {
      turnedPro: turnedProYears.length > 0 ? Math.min(...turnedProYears) : null,
      retiredYear,
      // The presence of the field is the signal, not the year: a player with
      // `retired = 2022` has stopped whatever the date parses to.
      hasRetiredField: box.retired !== undefined,
      plays: box.plays ?? null,
      singlesTitles: this.leadingCount(box.singlestitles),
      doublesTitles: this.leadingCount(box.doublestitles),
      highestSinglesRanking: this.rankingNumber(box.highestsinglesranking),
      highestDoublesRanking: this.rankingNumber(box.highestdoublesranking),
      titles: deduped,
    };
  }

  /**
   * Reads a golfer's career out of `Infobox golfer`.
   *
   * The golf counterpart of `fetchTennisCareer`, and it exists for the same
   * reason: golf has no clubs, so every signal the pipeline normally derives
   * from a club spell is missing, and the infobox is the only place the sport's
   * own evidence is written down.
   *
   * ## Why the major fields are parsed differently from tennis's
   *
   * `Infobox tennis biography` writes a result as `W (2004, 2006)`, so tennis
   * anchors on a leading `W`. `Infobox golfer` writes it as
   * `'''Won''': [[1997 Masters Tournament|1997]], [[2001 Masters Tournament|2001]]`,
   * and the same field for a non-winner reads `T2: 2019` or `DNP`. So the test
   * here is for a leading "Won", and the years are taken from the wikilinks
   * that follow it.
   *
   * The link targets are where the years must come from rather than the whole
   * field, because a field can carry a footnote with an unrelated year in it.
   * Taking every four-digit number in the string would read those as wins.
   *
   * ## Why `retired` is not the status signal here
   *
   * Tennis reads status from whether the infobox has a `retired` field. That
   * works for tennis and does not work for golf: the golf template carries
   * `retired` as an empty placeholder on almost every article, including Jack
   * Nicklaus's and Gary Player's, so its presence says nothing at all. Only a
   * filled value means anything, and the caller combines that with the last
   * year the player actually won a major to decide.
   */
  async fetchGolfCareer(title: string): Promise<GolfCareer | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    // The golfer box specifically, and nothing else.
    //
    // Same reasoning as the tennis equivalent: Wikidata's "sport: golf"
    // statement is true of anybody who ever played a round, and this catalogue
    // contains Heinrich Harrer, the Austrian mountaineer who climbed the Eiger.
    // `parseInfobox` would fall back to his mountaineer box, find no result
    // fields and return an empty career that reads as "golfer who won nothing"
    // rather than "not a golfer". Requiring the template by name is what makes
    // a null here mean something.
    if (!/\{\{\s*Infobox\s+golfer\b/i.test(wikitext)) return null;

    const box = parseInfobox(wikitext, 'golfer');
    if (!box) return null;

    /**
     * The years a major result field records as wins.
     *
     * Anchored on a leading "Won". A field reading `T2: 2019` or `DNP` is a
     * result and not a win, and must contribute nothing.
     *
     * Years come from the wikilink targets rather than from the raw string, so
     * that a trailing footnote or a "(record)" parenthetical cannot be read as
     * an extra championship. A bare year with no link is accepted too, since
     * older articles write `'''Won''': 1962, 1967` without linking.
     */
    const winYears = (value: string | undefined): number[] => {
      if (!value) return [];
      if (!/^\s*(?:'{2,5})?\s*Won\b/i.test(value)) return [];

      // Everything after the "Won" label, which is where the years live.
      const tail = value.replace(/^[^:]*:/, '');
      const years = new Set<number>();

      // Linked years: [[1997 Masters Tournament|1997]] and [[1997]] both give
      // 1997, and the piped label is preferred because the target can carry a
      // different year for an event spanning a new year.
      for (const match of tail.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const linkText = match[1] ?? '';
        const label = linkText.includes('|') ? linkText.split('|').pop()! : linkText;
        const year = /\b(1[89]\d{2}|20\d{2})\b/.exec(label);
        if (year) years.add(Number(year[1]));
      }

      // Unlinked years, for the older articles that write them plainly. Only
      // consulted when no link produced anything, so a linked field cannot pick
      // up a stray number from a footnote.
      if (years.size === 0) {
        for (const match of tail.matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)) {
          years.add(Number(match[1]));
        }
      }

      return [...years];
    };

    const majors: GolfMajorWin[] = [];
    for (const major of GOLF_MAJOR_FIELDS) {
      for (const year of winYears(box[major.field.toLowerCase()])) {
        majors.push({ slug: major.slug, name: major.name, year, tour: major.tour });
      }
    }

    // Deduplicated on (major, year). A field occasionally names a year twice
    // through a footnote, and the honour table holds one row per title and
    // year, so the second would silently do nothing on insert.
    const seen = new Set<string>();
    const deduped = majors.filter((entry) => {
      const key = `${entry.name}:${entry.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const winCounts: Record<string, number> = {};
    for (const field of GOLF_WIN_COUNT_FIELDS) {
      const value = this.leadingCount(box[field.field.toLowerCase()]);
      if (value !== null) winCounts[field.key] = value;
    }

    /** The years inside a field: "1996" gives [1996]. */
    const yearsIn = (value: string | undefined): number[] =>
      [...(value ?? '').matchAll(/\b(1[89]\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]));

    const turnedProYears = yearsIn(box.yearpro);
    const retiredYears = yearsIn(box.retired);
    const hallOfFameYears = yearsIn(box.wghofyear);
    const lastMajorYear =
      deduped.length > 0 ? Math.max(...deduped.map((entry) => entry.year)) : null;

    return {
      turnedPro: turnedProYears.length > 0 ? Math.min(...turnedProYears) : null,
      // The last year named, because a comeback writes a range.
      retiredYear: retiredYears.length > 0 ? Math.max(...retiredYears) : null,
      lastMajorYear,
      tour: box.tour ?? null,
      college: box.college ?? null,
      winCounts,
      hallOfFameYear: hallOfFameYears.length > 0 ? Math.min(...hallOfFameYears) : null,
      majors: deduped,
    };
  }

  /**
   * An NFL team's championship counts and Super Bowl-winning years.
   *
   * The infobox states these as counts (`no_sb_champs`, `no_conf_champs`,
   * `no_div_champs`, `no_league_champs`, `no_playoff_appearances`) rather than
   * as an honours table the way a football club's article does, which is why
   * this needs its own reader rather than `fetchClubTitles`: there is no table
   * to sum, only fields to read directly.
   *
   * Two template names are accepted. Wikipedia is mid-migration from the
   * sport-specific `Infobox NFL team` to the generic `Infobox gridiron
   * football team`, and which one a given team's article uses is not
   * predictable from anything but reading it: the Chiefs and the Cowboys still
   * carry the old template, the Patriots and the Steelers the new one, and
   * both name the championship fields identically. Requiring either by name,
   * rather than falling back to whatever infobox happens to be first in the
   * article, is what makes a null here mean "not a team article" rather than
   * "the wrong infobox parsed into nothing".
   *
   * `sbYears` comes from `sb_champs` separately from the counts, because a
   * team's honour rows need the actual seasons it won in, not just how many
   * times. `parseInfobox` resolves wikilinks to their display text before this
   * reader ever sees the field, so `[[2001 New England Patriots season|2001]]
   * ([[Super Bowl XXXVI|XXXVI]])` has already become plain `2001 (XXXVI)` by
   * the time it reaches `box.sb_champs`, and there are no brackets left to
   * split on. One bare four-digit year per comma-separated entry is read
   * instead; the roman numeral beside it contributes no digits, so it cannot
   * be mistaken for a second season.
   */
  async fetchNflTeamTitles(title: string): Promise<NflTeamTitles | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    const templateMatch = /\{\{\s*Infobox\s+(NFL team|gridiron football team)\b/i.exec(wikitext);
    if (!templateMatch) return null;

    const box = parseInfobox(wikitext, templateMatch[1]);
    if (!box) return null;

    const yearsIn = (value: string | undefined): number[] => {
      if (!value) return [];
      const years = new Set<number>();
      for (const entry of value.split(',')) {
        const year = /\b(19[0-9]\d|20\d{2})\b/.exec(entry);
        if (year) years.add(Number(year[1]));
      }
      return [...years];
    };

    return {
      superBowlTitles: this.leadingCount(box.no_sb_champs),
      conferenceTitles: this.leadingCount(box.no_conf_champs),
      divisionTitles: this.leadingCount(box.no_div_champs),
      leagueTitles: this.leadingCount(box.no_league_champs),
      playoffAppearances: this.leadingCount(box.no_playoff_appearances),
      superBowlYears: yearsIn(box.sb_champs),
    };
  }

  /**
   * A named column group's own labels and the "Career" row's values within it,
   * from an American football player's season-by-season statistics table.
   *
   * The shared machinery behind `fetchQuarterbackCareerPassing`,
   * `fetchRunningBackCareerTotals`, `fetchReceiverCareerTotals` and
   * `fetchDefenderCareerTotals`. Every position's article uses the same table
   * shape (Year, Team, one or more named column groups, a trailing "Career"
   * row), but the group names and the columns inside them differ entirely by
   * position: a quarterback's article groups Passing then Rushing, a running
   * back's groups Rushing then Receiving, a cornerback's groups Tackles then
   * Interceptions. Column *position* within a group is not reliable either,
   * even among players at the same position: Mahomes' Passing block has ten
   * sub-columns, Brady's and Rodgers' have eleven in a different order. This
   * reads the header row's own labels to find each stat by name rather than
   * assuming where it sits, and returns null for a position or article this
   * reader cannot find the named group in, rather than guessing.
   *
   * Every quirk below was found by testing against a real player's article
   * and checking the result against the article's own stated career totals,
   * not assumed:
   *
   *   - The section can open with a "Legend" key table before the season
   *     table itself, whenever the fallback `Career statistics` heading is
   *     used rather than a `Regular season` subheading (Sam Darnold's article
   *     is one). Reading the first `{|...|}` unconditionally finds that
   *     legend, not the season table. Every `{|...|}` block from the section
   *     onward is tried in turn, and the one whose header actually declares
   *     the wanted group is the one used.
   *   - A group's colspan can be wrong: Mahomes' Fumbles group claims 3 but
   *     the table has 2. This only matters when the miscounted group is
   *     *before* the one being read, so the label count is checked only up to
   *     the end of the wanted group, not across the whole row.
   *   - A column label is usually `{{abbr|Label|...}}`, but two other forms
   *     exist on real articles: a plain unwrapped header (Rex Grossman's
   *     "Record" column, no template at all) and `{{tooltip|Label|...}}` in
   *     place of `{{abbr|...}}`. All three are matched in one pass so their
   *     document order is preserved; missing the unwrapped form silently
   *     shifts every later index. A label can also nest a wikilink,
   *     `{{abbr|[[Passer rating|...]]|Passer rating}}` (Grossman's Rtg), which
   *     is unwrapped to the link's own display text.
   *   - The Career row's own header cell reads two different ways: a plain
   *     `colspan="2" | Career<ref>...` (Rodgers) or "Career" as the display
   *     text of an external link to Pro Football Reference,
   *     `colspan="2"| [https://...Career]` (Mahomes, Brady). Anchored on the
   *     cell rather than on "Career]" specifically, or the first form is
   *     never matched at all.
   *   - Cells are usually separated by `!!`, but some articles (Darnold's)
   *     mix in a lone `\n!` for the one cell right after the row's own header
   *     cell. Splitting on `!!` alone silently drops that cell and shifts
   *     every later value by one column.
   *   - A highlighted cell carries a wikitable attribute prefix before its
   *     own content pipe, `style="background:#e0cef2;"| 89,214`, which is
   *     wikitext cell syntax rather than HTML and so is not something
   *     `plainText` strips on its own; it is stripped here first.
   */
  private async fetchCareerColumnGroup(
    title: string,
    groupName: string,
  ): Promise<{
    labels: string[];
    groupStart: number;
    offset: number;
    cells: (number | null)[];
  } | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    const sectionStart =
      wikitext.search(/====\s*Regular season\s*====/i) >= 0
        ? wikitext.search(/====\s*Regular season\s*====/i)
        : wikitext.search(/==\s*Career statistics\s*==/i);
    if (sectionStart === -1) return null;

    const groupPattern = new RegExp(`colspan="\\d+"\\s*\\|\\s*${groupName}\\b`, 'i');
    let table: string | null = null;
    let groupRow: string | undefined;
    let labelRow: string | undefined;
    let cursor = sectionStart;
    while (cursor < wikitext.length) {
      const tableStart = wikitext.indexOf('{|', cursor);
      if (tableStart === -1) break;
      const tableEnd = wikitext.indexOf('\n|}', tableStart);
      if (tableEnd === -1) break;
      // Includes the closing `\n|}` rather than stopping short of it, because
      // the Career row is read up to that marker via a lookahead, and a
      // lookahead cannot match text that was sliced away before it ran.
      const candidate = wikitext.slice(tableStart, tableEnd + 3);

      const headerRows = candidate.split(/\n\|-\n?/).slice(0, 3);
      const groupIndex = headerRows.findIndex((row) => groupPattern.test(row));
      if (groupIndex !== -1) {
        // The label row is whichever segment immediately follows the group
        // row, not identified by its own content: most articles wrap every
        // label in `{{abbr|Label|...}}`, but some (Tyreek Hill's) write plain
        // `! GP !! GS` with no template at all, and a pattern requiring
        // `{{abbr|` finds nothing to read on those. Position relative to the
        // group row is reliable either way.
        table = candidate;
        groupRow = headerRows[groupIndex];
        labelRow = headerRows[groupIndex + 1];
        break;
      }

      cursor = tableEnd + 3;
    }
    if (!table || !groupRow || !labelRow) return null;

    // How many single-column header cells (`rowspan="2"| Year`, `| Team`, and
    // sometimes `| GP`) precede the first named column group. Some articles'
    // "Games" columns are their own colspan group the way Passing and Rushing
    // are (Mahomes: Year, Team as rowspan cells, then a `colspan="3"| Games`
    // group holding GP/GS/Record); others give GP its own rowspan cell
    // alongside Year and Team with no group of its own at all (Cedric
    // Benson's rushing table: three rowspan cells, then straight into
    // `colspan="6"| Rushing`). The label row never repeats a rowspan cell's
    // own label, so `labels[0]` is always the first sub-column of the first
    // *named* group either way, and `groupStart` computed purely from colspan
    // sums stays correct for indexing into `labels`. What differs is how many
    // data cells the Career row carries before that first labelled value:
    // Mahomes' Career row has one merged Year+Team cell and nothing else
    // ungrouped; Benson's has the same merged cell plus a separate GP value.
    // Counted here, once, from the group row itself, rather than assumed.
    const firstColspanIndex = groupRow.search(/colspan="\d+"/i);
    const leadingRowspans =
      firstColspanIndex === -1
        ? 0
        : (groupRow.slice(0, firstColspanIndex).match(/rowspan="\d+"/gi)?.length ?? 0);

    let groupStart = 0;
    let groupSpan = 0;
    let seen = 0;
    for (const match of groupRow.matchAll(/colspan="(\d+)"\s*\|\s*([^!|\n]+)/gi)) {
      const span = Number(match[1]);
      const label = match[2]!.trim();
      if (new RegExp(`^${groupName}$`, 'i').test(label)) {
        groupStart = seen;
        groupSpan = span;
        break;
      }
      seen += span;
    }
    if (groupSpan === 0) return null;

    const cellTokens = labelRow.matchAll(
      /\{\{(?:abbr|tooltip)\|([^{}]+)\|[^{}]*\}\}|!\s*([A-Za-z][A-Za-z0-9%/ ]{0,15})\s*(?=!!|\n)/gi,
    );
    const labels: string[] = [];
    for (const match of cellTokens) {
      const raw = match[1] ?? match[2] ?? '';
      const link = /\[\[([^|\]]*\|)?([^\]]+)\]\]/.exec(raw);
      labels.push((link ? link[2]! : raw).trim());
    }
    if (labels.length < groupStart + groupSpan) return null;

    const careerWordIndex = table.search(/colspan="2"\s*\|\s*(?:\[[^\]]*)?Career\b/i);
    if (careerWordIndex === -1) return null;
    const rowStart = table.lastIndexOf('\n|-\n', careerWordIndex) + '\n|-\n'.length;
    const nextRowBoundary = table.indexOf('\n|-\n', careerWordIndex);
    const tableCloseBoundary = table.indexOf('\n|}', careerWordIndex);
    const rowEnd =
      nextRowBoundary === -1
        ? tableCloseBoundary
        : tableCloseBoundary === -1
          ? nextRowBoundary
          : Math.min(nextRowBoundary, tableCloseBoundary);
    if (rowStart === -1 || rowEnd === -1) return null;
    const careerRow = table.slice(rowStart, rowEnd);

    const cellsRaw = careerRow.split(/\n?!!|\|\||\n!(?!!)/);
    const cells = cellsRaw.map((cell) => {
      const withoutAttributes = /^[^|]*\|(?!\|)(.*)$/s.exec(cell)?.[1] ?? cell;
      return parseNumber(this.plainText(withoutAttributes));
    });

    // The Career row's own header cell always merges exactly two rowspan
    // columns (Year and Team) under one `colspan="2"`, whatever else precedes
    // the first named group. Any further leading rowspan cell beyond those
    // two (Benson's GP) is not merged away and still occupies one data cell
    // of its own, so it is added to the base offset of 1. Verified against
    // both Mahomes' table (2 leading rowspans, offset 1: label index 6 "Yds"
    // is data cell 7, giving 35,939) and Benson's (3 leading rowspans, offset
    // 2: label index 1 "Yds" is data cell 3, giving 6,017, his real career
    // rushing total).
    const offset = 1 + Math.max(0, leadingRowspans - 2);

    return { labels: labels.slice(groupStart, groupStart + groupSpan), groupStart, offset, cells };
  }

  /**
   * A single stat's value from a column group already read by
   * `fetchCareerColumnGroup`.
   *
   * The row leads with one cell merging Year and Team, and `group.offset`
   * (computed in `fetchCareerColumnGroup`, see its own comment) accounts for
   * any further leading column the merge did not absorb, so a label at
   * absolute index N is data cell N + offset.
   */
  private readGroupStat(
    group: { labels: string[]; groupStart: number; offset: number; cells: (number | null)[] },
    labelName: string,
  ): number | null {
    const index = group.labels.findIndex(
      (label) => label.toLowerCase() === labelName.toLowerCase(),
    );
    if (index === -1) return null;
    return group.cells[group.groupStart + index + group.offset] ?? null;
  }

  /**
   * A quarterback's career regular-season passing totals.
   *
   * Passing and Rushing each have their own `Yds` and `TD` columns, which is
   * why only the "Passing" group's span is searched. See
   * `fetchCareerColumnGroup`'s doc comment for the table-reading quirks this
   * relies on.
   */
  async fetchQuarterbackCareerPassing(title: string): Promise<QuarterbackCareerPassing | null> {
    const group = await this.fetchCareerColumnGroup(title, 'Passing');
    if (!group) return null;
    const yards = this.readGroupStat(group, 'Yds');
    const touchdowns = this.readGroupStat(group, 'TD');
    if (yards === null || touchdowns === null) return null;
    return {
      yards,
      touchdowns,
      interceptions: this.readGroupStat(group, 'Int'),
      completions: this.readGroupStat(group, 'Cmp'),
      attempts: this.readGroupStat(group, 'Att'),
    };
  }

  /**
   * A running back's career rushing totals, from the "Rushing" column group.
   *
   * A running back's own article also carries a Receiving group, read
   * separately by `fetchReceiverCareerTotals` so a runner's yards after catch
   * are not folded into their rushing figure or the reverse.
   */
  async fetchRunningBackCareerTotals(
    title: string,
  ): Promise<{ yards: number | null; touchdowns: number | null; attempts: number | null } | null> {
    const group = await this.fetchCareerColumnGroup(title, 'Rushing');
    if (!group) return null;
    const yards = this.readGroupStat(group, 'Yds');
    const touchdowns = this.readGroupStat(group, 'TD');
    if (yards === null && touchdowns === null) return null;
    return { yards, touchdowns, attempts: this.readGroupStat(group, 'Att') };
  }

  /**
   * A receiver's career receiving totals, from the "Receiving" column group.
   *
   * Works the same for a wide receiver, a tight end, or a running back's own
   * receiving line: whichever position's article is passed in, only the
   * "Receiving" group is read.
   */
  async fetchReceiverCareerTotals(
    title: string,
  ): Promise<{
    yards: number | null;
    touchdowns: number | null;
    receptions: number | null;
  } | null> {
    const group = await this.fetchCareerColumnGroup(title, 'Receiving');
    if (!group) return null;
    const yards = this.readGroupStat(group, 'Yds');
    const touchdowns = this.readGroupStat(group, 'TD');
    if (yards === null && touchdowns === null) return null;
    return { yards, touchdowns, receptions: this.readGroupStat(group, 'Rec') };
  }

  /**
   * A defender's career tackle and takeaway totals.
   *
   * Two groups rather than one, because a defensive player's headline numbers
   * split across them: sacks live in "Tackles" alongside solo and assisted
   * tackle counts, while interceptions have their own group. A player with
   * only one of the two (an edge rusher with no interceptions, a cornerback
   * whose article carries no sack column) still returns whichever group was
   * found rather than nulling the whole result.
   */
  async fetchDefenderCareerTotals(
    title: string,
  ): Promise<{
    tackles: number | null;
    sacks: number | null;
    interceptions: number | null;
  } | null> {
    const [tacklesGroup, interceptionsGroup] = await Promise.all([
      this.fetchCareerColumnGroup(title, 'Tackles'),
      this.fetchCareerColumnGroup(title, 'Interceptions'),
    ]);
    if (!tacklesGroup && !interceptionsGroup) return null;

    // "Cmb" (combined tackles: solo plus assisted), the article's own
    // headline tackle figure. Verified against Micah Parsons' and Patrick
    // Surtain II's own tables (2026-09-04): neither carries a column literally
    // named "Total" or "Tackles".
    const tackles = tacklesGroup ? this.readGroupStat(tacklesGroup, 'Cmb') : null;
    const sacks = tacklesGroup ? this.readGroupStat(tacklesGroup, 'Sck') : null;
    const interceptions = interceptionsGroup ? this.readGroupStat(interceptionsGroup, 'Int') : null;
    if (tackles === null && sacks === null && interceptions === null) return null;

    return { tackles, sacks, interceptions };
  }

  /**
   * A gridiron player's club history, read from the `pastteams` infobox
   * field rather than from Wikidata's "member of sports team" statements.
   *
   * The reason this exists: those Wikidata statements are frequently
   * undated, which is how the American football catalogue ended up with
   * Jerry Rice credited with four simultaneous "current" spells (the
   * Seahawks, the Broncos, the 49ers and the Raiders all showing no end
   * date), rather than the sequential 49ers (1985-2000), Raiders
   * (2001-2004), Seahawks (2004) career his own Wikipedia infobox states.
   * `pastteams` is a bulleted list, one team per line, each with a
   * `{{NFL Year|...}}` date range, and it is present on essentially every
   * gridiron player's article regardless of era or position, unlike the
   * season-by-season statistics table `fetchCareerColumnGroup` reads (which
   * is a materially newer convention and absent from most players who
   * retired before the 2000s).
   *
   * Three date forms are seen on real articles, all handled here:
   *   - `{{NFL Year|2017}}-present` - a single template, open-ended
   *   - `{{NFL Year|1985|2000}}` - one template naming both years
   *   - `{{NFL Year|1968}}-{{NFL Year|1969}}` - two templates, one each
   *
   * A team name is kept as written rather than resolved to a slug here;
   * matching it against the team catalogue is the caller's job, the same
   * division of labour `fetchFootballCareers`' underlying reader uses.
   */
  async fetchGridironTeamSpells(title: string): Promise<GridironTeamSpell[] | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    const fieldMatch = /\|\s*pastteams\s*=\s*\n?((?:\*[^\n]*\n?)+)/.exec(wikitext);
    if (!fieldMatch) return null;

    const spells: GridironTeamSpell[] = [];

    for (const rawLine of fieldMatch[1]!.split('\n')) {
      const line = rawLine.trim();
      if (!line.startsWith('*')) continue;

      const teamMatch = /\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/.exec(line);
      if (!teamMatch) continue;
      const teamName = teamMatch[1]!.trim();

      const current = /present/i.test(line);

      const yearTemplates = [...line.matchAll(/\{\{NFL Year\|(\d{4})(?:\|(\d{4}))?\}\}/gi)];
      let startYear: number | null = null;
      let endYear: number | null = null;

      if (yearTemplates.length >= 1) {
        const first = yearTemplates[0]!;
        startYear = Number(first[1]);
        // A single template can itself carry both years
        // (`{{NFL Year|1985|2000}}`).
        if (first[2]) endYear = Number(first[2]);
      }
      if (yearTemplates.length >= 2 && endYear === null) {
        endYear = Number(yearTemplates[1]![1]);
      }

      // A bare year outside any template, for the rare article that writes
      // one plainly rather than through the template.
      if (startYear === null) {
        const bareYears = [...line.matchAll(/\b(19[0-9]\d|20\d{2})\b/g)];
        if (bareYears.length >= 1) startYear = Number(bareYears[0]![1]);
        if (bareYears.length >= 2) endYear = Number(bareYears[1]![1]);
      }

      if (startYear === null) continue;

      spells.push({ teamName, startYear, endYear: current ? null : endYear, current });
    }

    return spells.length > 0 ? spells : null;
  }

  /**
   * A gridiron player's position and current team, read directly from their
   * own `Infobox NFL biography` / `Infobox gridiron football biography`
   * rather than trusted from Wikidata's `P413` ("position played") statement.
   *
   * The reason this exists: `P413` is a general-purpose property with no
   * per-sport scoping, and a genuinely dual-sport person's Wikidata item can
   * carry a value for each sport they played. The enrichment query that reads
   * it takes whichever one Wikidata's own statement ranking happens to
   * return, with no way to prefer the American-football one. Real
   * consequences on this catalogue: John Lynch, the Hall of Fame safety and
   * 49ers general manager, was tagged `position: 'pitcher'` from a brief
   * baseball statement on the same Wikidata item; Kyler Murray and Deion
   * Sanders, both correctly identified as gridiron players, were tagged their
   * MLB fielding positions the same way. A Wikipedia infobox has no such
   * ambiguity: this reads the specific template the article about the
   * football career actually uses, so there is only one position to find.
   *
   * `position` is still checked against a whitelist of real playing
   * positions before being returned, because the same field carries a
   * different problem for a legend whose infobox has moved on to describe
   * their life after playing: John Lynch's `position` field now reads
   * "President of football operations & general manager" and Deion Sanders'
   * reads "Head coach", both true statements about the person and neither a
   * playing position. `career_position` is read first where present and
   * falls back to `position` where it is not: the template carries the
   * former specifically for a person like Lynch, whose article states
   * `career_position = Safety` alongside the executive title in `position`,
   * and most articles have no such split because most subjects have no
   * second career the infobox needs to describe. A value neither field gives
   * that the whitelist does not recognise is dropped rather than written, so
   * a corrupted-by-crossover tag is not simply replaced with a different
   * wrong one.
   */
  async fetchGridironPlayerAttributes(
    title: string,
  ): Promise<{ position: string | null; currentTeam: string | null } | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    const templateMatch = /\{\{\s*Infobox\s+(NFL biography|gridiron football biography)\b/i.exec(
      wikitext,
    );
    if (!templateMatch) return null;

    const box = parseInfobox(wikitext, templateMatch[1]);
    if (!box) return null;

    const rawPosition = box.career_position
      ? this.plainText(box.career_position)
      : box.position
        ? this.plainText(box.position)
        : null;
    const position =
      rawPosition && GRIDIRON_PLAYING_POSITIONS.has(rawPosition.toLowerCase())
        ? rawPosition.toLowerCase()
        : null;
    const currentTeam = box.current_team ? this.plainText(box.current_team) : null;
    if (!position && !currentTeam) return null;

    return { position, currentTeam: currentTeam || null };
  }

  /**
   * A mixed martial artist's professional record, read from
   * `Infobox martial artist`.
   *
   * Unlike every career total this file reads from a season-by-season table
   * elsewhere, MMA's infobox states the breakdown directly as nine separate
   * counts (three ways to win, four ways to lose, plus draws and no-contests),
   * which is what a fight record actually is: there is no season to sum, only
   * a list of results. Verified against two real fighters before trusting the
   * field names (2026-09-04): Khabib Nurmagomedov reads
   * `mma_kowin=8, mma_subwin=11, mma_decwin=10`, summing to his real 29-0
   * career; Amanda Nunes reads 13+4+6 wins against 2+2+1 losses, her real
   * 23-5 record.
   *
   * `mma_dqwin` is read too, though rare enough that neither test case had
   * one, for the same reason `mma_dqloss` is: a disqualification win is
   * still a win, and omitting the field would undercount the handful of
   * fighters who have one.
   */
  async fetchMmaRecord(title: string): Promise<{
    wins: number;
    losses: number;
    draws: number;
    noContests: number;
    knockoutWins: number;
    submissionWins: number;
    decisionWins: number;
    weightClass: string | null;
    yearsActive: string | null;
  } | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    if (!/\{\{\s*Infobox\s+martial\s+artist\b/i.test(wikitext)) return null;

    const box = parseInfobox(wikitext, 'martial artist');
    if (!box) return null;

    const count = (field: string): number => this.leadingCount(box[field]) ?? 0;

    const winFields = ['mma_kowin', 'mma_subwin', 'mma_decwin', 'mma_dqwin'];
    const lossFields = ['mma_koloss', 'mma_subloss', 'mma_decloss', 'mma_dqloss'];

    const wins = winFields.reduce((sum, field) => sum + count(field), 0);
    const losses = lossFields.reduce((sum, field) => sum + count(field), 0);
    const draws = count('mma_draw');
    const noContests = count('mma_nc');
    const knockoutWins = count('mma_kowin');
    const submissionWins = count('mma_subwin');
    const decisionWins = count('mma_decwin');

    // No result field at all, distinct from every field genuinely reading
    // zero: an amateur or a fighter this reader found the wrong infobox
    // for should not be recorded as 0-0.
    const hasAnyRecordField = [...winFields, ...lossFields, 'mma_draw', 'mma_nc'].some(
      (field) => box[field] !== undefined,
    );
    if (!hasAnyRecordField) return null;

    const weightClass = box.weight_class ? this.plainText(box.weight_class) : null;
    const yearsActive = box.years_active ? this.plainText(box.years_active) : null;

    return {
      wins,
      losses,
      draws,
      noContests,
      knockoutWins,
      submissionWins,
      decisionWins,
      weightClass,
      yearsActive,
    };
  }

  /**
   * A mixed martial artist's title reigns, from the "Championships and
   * accomplishments" section of their article.
   *
   * The section is a nested wikitext list, one promotion per top-level
   * bullet (`*'''[[Promotion]]'''`) and one championship per sub-bullet
   * (`**[[Some Championship]] (N times)`), where N states how many separate
   * reigns the fighter held it across, not how many title defences. A reign
   * is what `honour` rows should count: two Jon Jones rows for his Light
   * Heavyweight title, one for his Heavyweight title, matching the "(Two
   * times)" and "(One time)" his own article states, and likewise three rows
   * for Amanda Nunes across her two divisions.
   *
   * Only sub-bullets stating a repeat count are read. A promotion's other
   * bullets (finalist placings, hall-of-fame inductions, tournament wins)
   * have no such count and are correctly left out, the same way
   * `fetchFootballHonours` excludes a club's non-title honours from its
   * count.
   *
   * The section heading's own whitespace is inconsistent between articles
   * (`==Championships and accomplishments==` on Fedor Emelianenko's page,
   * `== Championships and accomplishments ==` on Khabib Nurmagomedov's), so
   * both are matched. Verified against four real fighters before trusting
   * the pattern (2026-09-04): Jon Jones reads two Light Heavyweight reigns
   * and one Heavyweight reign; Amanda Nunes two Bantamweight and one
   * Featherweight; Khabib Nurmagomedov one Lightweight; Fedor Emelianenko's
   * PRIDE and RINGS titles are read correctly by title text, but resolve to
   * no honour row since neither promotion is in this sport's curated
   * competitions, which is correct: he never held a UFC, Bellator, ONE or
   * PFL title.
   */
  async fetchMmaTitles(title: string): Promise<{ title: string; count: number }[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const headingMatch = /==\s*Championships and accomplishments\s*==/i.exec(wikitext);
    if (!headingMatch) return [];

    const sectionStart = headingMatch.index + headingMatch[0].length;
    const nextHeading = /\n==[^=]/.exec(wikitext.slice(sectionStart));
    const section = wikitext.slice(
      sectionStart,
      nextHeading ? sectionStart + nextHeading.index : undefined,
    );

    const results: { title: string; count: number }[] = [];
    const wordToNumber: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };

    for (const match of section.matchAll(
      /^\*\*\s*(?:\[\[File:[^\]]*\]\]\s*)?\[\[([^\]]*Championship[^\]]*)\]\][^\n]*?\((one|two|three|four|five|\d+)\s*times?(?:;[^)]*)?\)/gim,
    )) {
      const link = match[1]!;
      const label = link.includes('|') ? link.split('|').pop()! : link;
      const countText = match[2]!.toLowerCase();
      const count = wordToNumber[countText] ?? Number(countText);
      if (!Number.isFinite(count) || count < 1) continue;
      results.push({ title: this.plainText(label), count });
    }

    return results;
  }

  /**
   * A mixed martial artist's UFC title-fight bouts, win or loss, from the
   * `{{MMA record start}}` fight-by-fight table.
   *
   * `fetchMmaTitles` only counts title *reigns won*, so a fighter who has
   * challenged for a UFC title and lost (Chael Sonnen: 0 reigns, 2 losing
   * title challenges) is invisible to it and would be invisible to a "Most
   * Title Bouts" table built on titles won alone, which is a different claim
   * than the table's name makes. This reads the record table's Notes column
   * instead, which states the title context on both a winning and a losing
   * row alike ("Defended the [[UFC Heavyweight Championship]]." on a win row,
   * "For the [[UFC Lightweight Championship]]." on a loss row that did not
   * change hands).
   *
   * Each `|-`-delimited row is ten pipe-separated cells in a fixed order:
   * Result, Record, Opponent, Method, Event, Date, Round, Time, Location,
   * Notes. Split on `|` rather than matched by a per-field regex, because the
   * Method and Notes cells hold free text that can itself contain
   * parentheses and wikilinks a field-specific pattern would have to special
   * case; splitting the row once and reading cells by position is simpler and
   * matches how `parseInfobox` already treats the safer case of a flat
   * `|key=value` list.
   *
   * Scoped to the UFC by the Event cell rather than trusted globally: a
   * fighter's table properly includes non-UFC bouts (Bellator, PRIDE, an
   * amateur promotion), and "for the [[Bellator Lightweight
   * Championship]]" is a real title bout, just not a UFC one. Only event
   * cells naming UFC are counted, matching this sport's curated competition
   * list being UFC-only.
   */
  async fetchMmaTitleBouts(
    title: string,
  ): Promise<{ titleBoutWins: number; titleBoutLosses: number } | null> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return null;

    const startMatch = /\{\{\s*MMA record start\s*\}\}/i.exec(wikitext);
    if (!startMatch) return null;

    const tableStart = startMatch.index + startMatch[0].length;
    const endMatch = /\{\{\s*MMA record end\s*\}\}/i.exec(wikitext.slice(tableStart));
    const table = wikitext.slice(tableStart, endMatch ? tableStart + endMatch.index : undefined);

    let titleBoutWins = 0;
    let titleBoutLosses = 0;

    for (const rowText of table.split(/\n\|-/).slice(1)) {
      // Splitting on the cell delimiter leaves an empty leading element: the
      // row text starts with the delimiter itself (`\n|{{no2}}Loss...`), so
      // index 0 is always "" and the Result cell is at index 1, not 0.
      const cells = rowText
        .split(/\n\|/)
        .slice(1, 11)
        .map((cell) => cell.trim());
      if (cells.length < 10) continue;

      const [resultCell, , , , eventCell, , , , , notesCell] = cells;
      if (!/\[\[\s*UFC\b/i.test(eventCell ?? '')) continue;
      if (!/Championship/i.test(notesCell ?? '')) continue;

      // The result token is usually a template (`{{yes2}}Win`,
      // `{{no2}}Loss`) but not always: McGregor's own table writes plain
      // "Loss" and "Win" with no wrapper on some rows. Matched on the
      // trailing word either way, and a draw or no-contest counted as
      // neither a win nor a loss, since holding a title is not decided by
      // one.
      if (/\bWin\b/i.test(resultCell ?? '')) {
        titleBoutWins += 1;
      } else if (/\bLoss\b/i.test(resultCell ?? '')) {
        titleBoutLosses += 1;
      }
    }

    return { titleBoutWins, titleBoutLosses };
  }

  /**
   * The UFC weight classes a fighter currently holds the title in, from the
   * same `{{MMA record start}}` table `fetchMmaTitleBouts` reads.
   *
   * A fighter is read as the current champion of a division when their most
   * recent bout for that division's title (rows are written newest-first, the
   * same order the table is displayed in) is a win whose Notes do not say the
   * title was later vacated, stripped, or relinquished. That is also
   * correctly what excludes a fighter who has since lost the title in a
   * later bout: their most recent bout for that division becomes a Loss row,
   * which this only credits a win for, or a different fighter's win row
   * supersedes it because the newest bout for that title belongs to them.
   *
   * Verified against four real UFC pages (2026-09-04): Islam Makhachev,
   * Alex Pereira and Ilia Topuria all read as champions of a division from
   * an older bout in their record, correctly excluded because a later bout
   * of theirs for that same title is a loss; Justin Gaethje, who beat
   * Topuria most recently for the lightweight title with no override text on
   * the row, reads as the current lightweight champion.
   */
  async fetchMmaCurrentUfcTitles(title: string): Promise<string[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const startMatch = /\{\{\s*MMA record start\s*\}\}/i.exec(wikitext);
    if (!startMatch) return [];

    const tableStart = startMatch.index + startMatch[0].length;
    const endMatch = /\{\{\s*MMA record end\s*\}\}/i.exec(wikitext.slice(tableStart));
    const table = wikitext.slice(tableStart, endMatch ? tableStart + endMatch.index : undefined);

    const divisionsWon = new Set<string>();
    const divisionsSettled = new Set<string>();

    for (const rowText of table.split(/\n\|-/).slice(1)) {
      const cells = rowText
        .split(/\n\|/)
        .slice(1, 11)
        .map((cell) => cell.trim());
      if (cells.length < 10) continue;

      const [resultCell, , , , eventCell, , , , , notesCell] = cells;
      if (!/\[\[\s*UFC\b/i.test(eventCell ?? '')) continue;

      const titleMatch = /\[\[\s*(UFC[^\]|]*Championship)[^\]]*\]\]/i.exec(notesCell ?? '');
      if (!titleMatch) continue;
      const division = this.plainText(titleMatch[1]!);

      // Rows are read newest-first, so the first bout seen for a division is
      // this fighter's most recent for it, and settles the question for that
      // division: a later (older) row for the same title cannot change who
      // holds it now.
      if (divisionsSettled.has(division)) continue;
      divisionsSettled.add(division);

      const isWin = /\bWin\b/i.test(resultCell ?? '');
      const overridden = /\b(vacat|stripp|relinquish)/i.test(notesCell ?? '');
      if (isWin && !overridden) divisionsWon.add(division);
    }

    return [...divisionsWon];
  }

  /**
   * The count at the front of a titles field.
   *
   * `singlestitles` cleans to "167 (Open era record)" or "103 (2nd in the Open
   * Era)": a count followed by a parenthetical ranking. `parseNumber` requires
   * the whole string to be a number and correctly rejects both, so the leading
   * integer is taken here rather than by loosening a helper that a dozen other
   * callers rely on being strict.
   */
  private leadingCount(value: string | undefined): number | null {
    if (!value) return null;
    const match = /^\s*(\d{1,4})\b/.exec(value);
    return match ? Number(match[1]) : null;
  }

  /**
   * The number out of a ranking field.
   *
   * `highestsinglesranking` cleans to "No. 1 (2 February 2004)", and the wanted
   * value is the 1 rather than the 2 that starts the date. Anchored on the
   * "No." prefix for that reason: `parseNumber` on the whole string returns the
   * day of the month for anybody whose article writes the date first.
   */
  private rankingNumber(value: string | undefined): number | null {
    if (!value) return null;
    const match = /No\.\s*(\d{1,4})/i.exec(value);
    return match ? Number(match[1]) : null;
  }

  /** Maps a cricket infobox column label onto a discipline key. */
  private disciplineFor(label: string): string | null {
    const normalised = label.toLowerCase();
    if (normalised.includes('test')) return 'test';
    if (normalised.includes('t20i') || normalised.includes('twenty20 international')) return 't20i';
    if (normalised.includes('odi') || normalised.includes('one day international')) return 'odi';
    // The domestic pair, checked after the internationals: the labels do not
    // collide, but the internationals are the more specific patterns and run
    // first on purpose. Kept apart from Test and ODI, which is the error the
    // discipline model exists to prevent.
    if (normalised.includes('first-class') || normalised.includes('first class')) {
      return 'first_class';
    }
    if (/(^|[^a-z])fc([^a-z]|$)/.test(normalised)) return 'first_class';
    if (normalised.includes('list a')) return 'list_a';
    if (/(^|[^a-z])la([^a-z]|$)/.test(normalised)) return 'list_a';
    // Domestic T20 is a real format with its own records, but no discipline is
    // defined for it yet. Skipped rather than folded into a format it is not
    // comparable with.
    return null;
  }
}

/**
 * A cricket figure that is text rather than a number: "248*" or "5/32".
 *
 * Kept as written, minus the footnote marks and the dashes a table uses for a
 * figure it does not hold. An en dash, an em dash or a bare hyphen all mean
 * "none" in a cricket infobox and none of them should reach a page as a value.
 */
function cleanCricketFigure(value: string): string | null {
  const cleaned = value
    .replace(/[\u2020\u2021]/g, '')
    .replace(/\s+/g, '')
    .trim();
  if (!cleaned) return null;
  if (/^[-\u2013\u2014]+$/.test(cleaned)) return null;
  // Anything without a digit is not a score or a bowling return. Guards against
  // an infobox holding a note in the field.
  if (!/\d/.test(cleaned)) return null;

  return cleaned;
}

/**
 * The text of every cell in one table row, markup and references removed.
 *
 * Shared by the infobox readers, which parse rows by hand rather than through
 * `parseTables`: an infobox has no header row, so the table parser returns
 * nothing for it.
 */
function stripCells(row: string): string[] {
  return [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) =>
    cell[1]!
      .replace(/<sup[\s\S]*?<\/sup>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/\sdata-mw='[^']*'/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

/**
 * Decodes percent escapes in an infobox filename.
 *
 * Some articles write the file with its URL encoding intact:
 * `Logo de la Conmebol Copa Am%C3%A9rica.svg`. The API rejects that outright,
 * with `The requested page title contains invalid characters: "%C3"`, so the
 * Copa America logo resolved to nothing until the escape was decoded.
 *
 * A malformed escape is left alone rather than thrown on: `decodeURIComponent`
 * raises on a stray `%`, and a filename containing one is still worth trying.
 */
function decodeFilename(name: string): string {
  if (!name.includes('%')) return name;

  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}
