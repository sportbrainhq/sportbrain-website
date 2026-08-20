import { Injectable } from '@nestjs/common';
import { WikipediaClient } from './wikipedia.client';
import {
  findTableByHeading,
  parseDefinitionLists,
  parseInfobox,
  parseNumber,
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

/** A person's statistics for one discipline, keyed to the registry. */
export interface WikiStatBlock {
  discipline: string | null;
  stats: Record<string, number>;
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
const EXCLUDED_HONOUR_GROUPS =
  /^(individual|records?|orders?|decorations?|awards?|other|see also|notes?|references?|state honours|honours and awards|personal|manager|managerial|as a manager|head coach|coach)\b/i;

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
   * **Photographs are rejected.** The point of this is a crest, and an infobox
   * `image` is not guaranteed to be one: Wikidata's equivalent field gave a
   * training-ground JPG for Barcelona and a squad photo for France. A raster
   * extension is the signal that separates the two, since crests are drawn as
   * SVG almost without exception while photographs are JPEG. PNG is allowed
   * because a minority of genuine crests are only available as PNG, but a `.jpg`
   * is a photograph and is never a crest.
   */
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
      if (file && /\.(svg|png)$/i.test(file)) return `File:${file}`;
    }

    for (const field of ['image', 'logo', 'crest', 'badge']) {
      const raw = box[field]?.trim();
      if (!raw) continue;

      // The value arrives in two shapes. Usually it is a bare filename, but a
      // minority of articles embed a full image link, `[[File:X.svg|frameless
      // |upright=0.5]]`, whose display parameters are not part of the name.
      // `cleanWikitext` has already reduced that to its parameters alone, so
      // the link is recovered from the raw wikitext rather than from the field.
      const name = raw
        .replace(/^\[\[/, '')
        .replace(/\]\]$/, '')
        .replace(/^(?:File|Image):/i, '')
        .split('|')[0]
        ?.trim();

      if (!name) continue;
      if (!/\.(svg|png)$/i.test(name)) continue;

      return `File:${name}`;
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
      ['conf_champs', 'Conference titles', 'honours', 54],
      ['div_champs', 'Division titles', 'honours', 56],
      ['gm', 'General manager', 'people', 67],
      ['ceo', 'Chief executive', 'people', 68],
      ['president', 'President', 'people', 69],
      ['affiliation', 'Affiliate', 'competition', 76],
      ['sponsor', 'Sponsor', 'commercial', 82],
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
      const winning = text.split(/\b(?:runners?-up|runner up|third place|finalist)\b/i)[0] ?? '';

      // Only what follows the colon, so a competition whose name carries a year
      // ("Copa Am\u00e9rica 2021") is not itself counted as a win.
      if (!winning.includes(':')) continue;

      const years = winning.slice(winning.indexOf(':') + 1).match(/\d{4}(?:[\u2013-]\d{2,4})?/g);
      if (!years) continue;

      won += years.length;
    }

    return { won, groups };
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
