import { Injectable } from '@nestjs/common';
import { WikipediaClient } from './wikipedia.client';
import {
  findTable,
  parseInfobox,
  parseNumber,
  parseTables,
  type Infobox,
  type ParsedTable,
} from './wikipedia.parser';

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
}

/** A person's statistics for one discipline, keyed to the registry. */
export interface WikiStatBlock {
  discipline: string | null;
  stats: Record<string, number>;
  appearances: number | null;
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
      ['website', 'Website', 'commercial', 100],
    ];

    return this.factsFrom(box, map);
  }

  // ---------------------------------------------------------------------------
  // Layer 3: teams
  // ---------------------------------------------------------------------------

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
  async fetchTeamRankings(recordsTitle: string): Promise<WikiRanking[]> {
    const html = await this.client.fetchHtml(recordsTitle);
    if (!html) return [];

    const tables = parseTables(html);
    const rankings: WikiRanking[] = [];

    // `rank` is not required. Many records articles number their rows
    // implicitly and start straight at the player column: Benfica's tables read
    // `Player | Years | Matches | Goals` and were skipped entirely by a matcher
    // that insisted on a rank column.
    const appearances =
      findTable(tables, ['player'], ['total', 'apps', 'appearances', 'matches', 'games']) ?? null;
    if (appearances) {
      const entries = this.rowsToEntries(appearances, [
        'total',
        'apps',
        'appearances',
        'matches',
        'games',
      ]);
      if (entries.length > 0) {
        rankings.push({
          kind: 'most_appearances',
          label: 'Most appearances',
          entries,
          // Sourced from a maintained records article rather than aggregated
          // from scattered statements, so unlike the Wikidata equivalent this
          // matches the club's own published figures.
          confidence: 'high',
          note: 'From the club records article on Wikipedia.',
        });
      }
    }

    const scorers = findTable(tables, ['player'], ['goals', 'official goals']);
    if (scorers && scorers !== appearances) {
      const entries = this.rowsToEntries(scorers, ['goals', 'official goals', 'total']);
      if (entries.length > 0) {
        rankings.push({
          kind: 'top_scorers',
          label: 'Top goalscorers',
          entries,
          confidence: 'high',
          note: 'From the club records article on Wikipedia.',
        });
      }
    }

    return rankings;
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
      ['career_start', 'Career start', 'career', 60],
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
   * A cricketer's per-format career record.
   *
   * Cricket infoboxes use a `columnN` pattern: `column1 = Test`, `matches1`,
   * `runs1`, `bat avg1` and so on, repeated for each format a player has
   * played. That maps exactly onto the discipline model, which is why cricket
   * statistics work here and did not with the previous source.
   */
  async fetchCricketStats(title: string): Promise<WikiStatBlock[]> {
    const wikitext = await this.client.fetchWikitext(title);
    if (!wikitext) return [];

    const box = parseInfobox(wikitext);
    if (!box) return [];

    const blocks: WikiStatBlock[] = [];

    for (let column = 1; column <= 6; column += 1) {
      const label = box[`column${column}`];
      if (!label) continue;

      const discipline = this.disciplineFor(label);
      if (!discipline) continue;

      const stats: Record<string, number> = {};
      const numeric: [string, string][] = [
        ['matches', 'matches'],
        ['runs', 'runs'],
        ['bat avg', 'batting_average'],
        ['100s/50s', 'hundreds'],
        ['wickets', 'wickets'],
        ['bowl avg', 'bowling_average'],
        ['catches/stumpings', 'catches'],
        ['deliveries', 'deliveries'],
      ];

      for (const [source, key] of numeric) {
        const raw = box[`${source}${column}`];
        if (!raw) continue;

        // "100s/50s" arrives as "80/72" and "catches/stumpings" as "150/-".
        // Only the first component is taken, which is the one the registry
        // defines.
        const first = raw.split('/')[0] ?? '';
        const parsed = parseNumber(first);
        if (parsed !== null) stats[key] = parsed;
      }

      const topScore = box[`top score${column}`];
      if (topScore) {
        const parsed = parseNumber(topScore);
        if (parsed !== null) stats.highest_score = parsed;
      }

      if (Object.keys(stats).length > 0) {
        blocks.push({
          discipline,
          stats,
          appearances: stats.matches ?? null,
        });
      }
    }

    return blocks;
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
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) =>
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
        : [`intitle:records intitle:statistics ${teamName}`];

    const candidates: string[] = [];
    for (const search of searches) {
      candidates.push(...(await this.client.resolveTitles(search, 5)));
    }

    if (candidates.length === 0) return null;

    const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

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

    const distinctive = teamName
      .split(/\s+/)
      .map(normalise)
      // Three characters, not four. "Test cricket records" articles are named
      // for the country alone, and a four-character floor drops England, whose
      // distinctive word is exactly seven but whose sibling cases include
      // shorter country names.
      .filter((word) => word.length >= 3 && !generic.has(word));

    // Nothing distinctive to check against means the name is entirely generic,
    // and accepting the search's best guess would be a coin toss.
    if (distinctive.length === 0) return null;

    // The first candidate that actually names the team wins, rather than the
    // first candidate outright.
    for (const candidate of candidates) {
      const candidateNormalised = normalise(candidate);
      if (distinctive.some((word) => candidateNormalised.includes(word))) return candidate;
    }

    return null;
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
  private rowsToEntries(table: ParsedTable, valueHeaders: string[]): WikiRankingEntry[] {
    const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const headers = table.headers.map(normalise);

    // Combined columns such as "League Games/Goals" hold two numbers in one
    // cell and cannot be read as a single value, so they are passed over in
    // favour of a column that holds one.
    const isCombined = (header: string) => header.includes('games') && header.includes('goals');

    const valueIndex = valueHeaders
      .map((header) =>
        headers.findIndex(
          (candidate) => candidate.includes(normalise(header)) && !isCombined(candidate),
        ),
      )
      .find((index) => index >= 0);

    const nameIndex = headers.findIndex((header) => header.includes('player'));
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

    for (const row of table.rows) {
      const name = row.cells[nameIndex];
      const rawCell = row.cells[valueIndex ?? combinedIndex];
      if (!name || !rawCell) continue;

      // A combined cell reads "406/0": appearances before the slash, goals
      // after it.
      const rawValue =
        valueIndex === undefined ? (rawCell.split('/')[wantsGoals ? 1 : 0] ?? '') : rawCell;

      const value = parseNumber(rawValue);
      if (value === null) continue;

      // The link is taken from the name's own cell rather than from the row,
      // because many tables place a flag icon before the name and the row's
      // first link is therefore a country.
      const link = row.cellLinks[nameIndex]?.[0];

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

      if (entries.length >= 25) break;
    }

    // Sorted and renumbered rather than trusted as read. Not every records
    // article lists its rows in order: Fortaleza's goalscorers arrived with 0
    // ranked above 29, because the page sorts by a different column than the
    // one being extracted.
    entries.sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0));
    for (const [index, entry] of entries.entries()) entry.rank = index + 1;

    // A leaderboard whose top value is zero was not a leaderboard for the thing
    // being asked about.
    if (entries.length === 0 || Number(entries[0]?.value ?? 0) <= 0) return [];

    return entries;
  }

  /** Maps a cricket infobox column label onto a discipline key. */
  private disciplineFor(label: string): string | null {
    const normalised = label.toLowerCase();
    if (normalised.includes('test')) return 'test';
    if (normalised.includes('t20i') || normalised.includes('twenty20 international')) return 't20i';
    if (normalised.includes('odi') || normalised.includes('one day international')) return 'odi';
    // First-class, List A and domestic T20 are real formats with their own
    // records, but no discipline is defined for them yet. Skipped rather than
    // folded into an international format they are not comparable with.
    return null;
  }
}
