/**
 * Turning Wikipedia markup into facts.
 *
 * Two parsers, because Wikipedia exposes structure in two very different
 * shapes and each needs its own approach.
 *
 * ## Infoboxes: reliable
 *
 * The `{{Infobox ...}}` template at the top of an article is a flat list of
 * `| key = value` pairs, consistent enough across pages to parse generically.
 * This is where the best data lives, and it is the data Wikidata most conspicuously
 * lacks: Kohli's infobox carries his full per-format career record, and the
 * Cricket World Cup's carries Tendulkar's 2,278 runs and McGrath's 71 wickets.
 *
 * ## Tables: bespoke, and treated with suspicion
 *
 * Body tables are not uniform and cannot be made so. Measured across four
 * clubs: Liverpool has 5 tables, Barcelona 7, Real Madrid 19, Juventus 28.
 * Their columns are competition-specific, so Liverpool's read
 * `League / FA Cup / League Cup` while Juventus reads
 * `Italian championship / Coppa Italia / Europe`. They appear in different
 * orders and under different headings.
 *
 * A parser that assumes a shape will therefore be wrong most of the time. This
 * one instead **recognises** tables by their headers and skips anything it does
 * not understand, which yields partial coverage that is correct rather than
 * full coverage that is not.
 */

/** One parsed infobox: flat key/value pairs, templates stripped. */
export type Infobox = Record<string, string>;

/** A recognised table: its heading, its columns, and its rows. */
export interface ParsedTable {
  heading: string | null;
  /**
   * A spanning header cell above the columns, where the table has one.
   *
   * Newcastle's page files a dozen trivia tables under one "Goal scorers"
   * heading and distinguishes them only by this caption ("Players who scored in
   * consecutive games"), so the heading alone cannot tell an all-time
   * leaderboard from a curiosity.
   */
  caption: string | null;
  /**
   * The heading hierarchy above the table, outermost first.
   *
   * Needed because the nearest heading is frequently a subdivision that says
   * nothing on its own: Barcelona's all-time scorers sit under "Top
   * goalscorers" > "All competitions", and only the ancestor identifies them.
   */
  headingPath: string[];
  headers: string[];
  rows: ParsedRow[];
}

export interface ParsedRow {
  cells: string[];
  /** Links found in each cell, indexed to match `cells`. */
  cellLinks: string[][];
  /**
   * Canonical Wikipedia titles linked from the row, in order.
   *
   * The reason tables are worth parsing at all. A cell reading "Xavi" is a
   * string; the link behind it is `Xavi_(footballer,_born_1980)`, which
   * resolves to exactly one entity and can be matched against what we already
   * hold without any name guessing.
   */
  links: string[];
}

/**
 * Extracts an infobox from wikitext.
 *
 * Brace-counted rather than regex-matched. Infoboxes contain nested templates
 * (`{{ubl|...}}`, `{{cr|AUS}}`), and a non-greedy match to the first `}}`
 * truncates the box at the first nested template, silently dropping most of it.
 *
 * `prefer` names the template wanted, and matters more than it sounds: an
 * article may carry several infoboxes and the first is not always the one about
 * the sport. MS Dhoni's article opens with `Infobox officeholder`, for an
 * honorary army rank, and his `Infobox cricketer` is second, so reading the
 * first returned no statistics at all for one of the most-viewed cricketers on
 * the site. Falls back to the first infobox where no preferred one is present.
 */
export function parseInfobox(wikitext: string, prefer?: string): Infobox | null {
  const start = infoboxStart(wikitext, prefer);
  if (start === -1) return null;

  let depth = 0;
  let end = wikitext.length;
  let index = start;

  // A `while` rather than a `for`, because the loop advances by two on a brace
  // pair and by one otherwise. Expressing that as a `for` with an increment
  // clause double-advances on every brace, which desynchronises the depth count
  // and closes the box early: Kohli's infobox parsed as 6 fields instead of 89.
  while (index < wikitext.length - 1) {
    if (wikitext.startsWith('{{', index)) {
      depth += 1;
      index += 2;
      continue;
    }

    if (wikitext.startsWith('}}', index)) {
      depth -= 1;
      index += 2;
      if (depth === 0) {
        end = index;
        break;
      }
      continue;
    }

    index += 1;
  }

  const box = wikitext.slice(start, end);
  const fields: Infobox = {};

  // Split on pipes at depth zero. A naive split on "|" breaks every value
  // containing a nested template or a wiki link with a display label, which is
  // most of the interesting ones.
  let depthTemplate = 0;
  let depthLink = 0;
  let current = '';
  const parts: string[] = [];
  let cursor = 2;

  while (cursor < box.length - 2) {
    const pair = box.slice(cursor, cursor + 2);

    // Brace and bracket pairs are consumed whole, so the character after them
    // is not re-examined as the start of another pair.
    if (pair === '{{' || pair === '}}' || pair === '[[' || pair === ']]') {
      if (pair === '{{') depthTemplate += 1;
      if (pair === '}}') depthTemplate -= 1;
      if (pair === '[[') depthLink += 1;
      if (pair === ']]') depthLink -= 1;

      current += pair;
      cursor += 2;
      continue;
    }

    if (box[cursor] === '|' && depthTemplate === 0 && depthLink === 0) {
      parts.push(current);
      current = '';
      cursor += 1;
      continue;
    }

    current += box[cursor];
    cursor += 1;
  }
  parts.push(current);

  for (const part of parts) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;

    const key = part.slice(0, separator).trim().toLowerCase();
    const value = cleanWikitext(part.slice(separator + 1));

    if (key && value) fields[key] = value;
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

/**
 * Where the wanted infobox begins.
 *
 * The preferred template first, then any infobox at all. Matched on the
 * template name only, so `{{Infobox cricketer}}` and
 * `{{Infobox cricketer\n| name = ...}}` both hit.
 */
function infoboxStart(wikitext: string, prefer?: string): number {
  if (prefer) {
    const preferred = new RegExp(`\\{\\{\\s*Infobox\\s+${prefer}\\b`, 'i');
    const match = wikitext.search(preferred);
    if (match !== -1) return match;
  }

  return wikitext.search(/\{\{\s*Infobox/i);
}

/**
 * Strips wiki markup down to displayable text.
 *
 * The templates worth handling specially are the ones that carry meaning:
 * `{{cr|AUS}}` and `{{flagicon|IND}}` are decoration and should vanish, while
 * `[[Sachin Tendulkar]]` is a name and should survive as one.
 */
export function cleanWikitext(value: string): string {
  let text = value;

  // Refs and comments carry nothing displayable.
  text = text.replace(/<ref[^>]*\/>/g, '');
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Flag and country templates: drop the wrapper, keep nothing. The country is
  // almost always repeated as a linked name beside them.
  text = text.replace(/\{\{\s*(?:cr|cricon|flagicon|flagu|flag|fb|fbicon)\s*\|[^}]*\}\}/gi, ' ');

  // Unbulleted lists and similar joiners hold real values separated by pipes.
  text = text.replace(/\{\{\s*(?:ubl|plainlist|unbulleted list)\s*\|([^}]*)\}\}/gi, (_, inner) =>
    String(inner).split('|').filter(Boolean).join(', '),
  );

  // `{{sortname|Lionel|Messi}}` renders as a name.
  text = text.replace(/\{\{\s*sortname\s*\|([^|}]*)\|([^|}]*)(?:\|[^}]*)?\}\}/gi, '$1 $2');

  // nowrap and similar wrappers add nothing.
  text = text.replace(/\{\{\s*(?:nowrap|nbsp|small)\s*\|([^}]*)\}\}/gi, '$1');

  // Anything else templated is dropped rather than guessed at.
  let previous = '';
  while (previous !== text) {
    previous = text;
    text = text.replace(/\{\{[^{}]*\}\}/g, ' ');
  }

  // Links: keep the display label where there is one, the target otherwise.
  text = text.replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1');
  text = text.replace(/\[\[([^\]]*)\]\]/g, '$1');
  text = text.replace(/\[https?:\/\/\S+\s+([^\]]*)\]/g, '$1');

  // Bold and italic markup.
  text = text.replace(/'''''|'''|''/g, '');

  // Residual HTML.
  text = text.replace(/<br\s*\/?>/gi, ', ');
  text = text.replace(/<[^>]+>/g, '');

  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts tables from rendered HTML.
 *
 * HTML rather than wikitext, because the rendered form has already expanded
 * every template: a cell that reads `{{sortname|Lionel|Messi}}` in the source
 * is simply `Lionel Messi` here, wrapped in a link to the canonical title.
 */
export function parseTables(html: string): ParsedTable[] {
  const tables: ParsedTable[] = [];

  // Headings are captured alongside the tables rather than ignored, because on
  // a records article the heading is the only thing that distinguishes tables
  // with identical columns. Real Madrid's page carries an all-time scorers
  // table, a by-season one and a by-competition one, all of them "Player" plus
  // "Goals"; without the heading there is no way to tell which is which, and
  // choosing on columns alone published a by-competition table as the club's
  // all-time list.
  const sections = [
    ...html.matchAll(
      /<h([2-4])[^>]*>([\s\S]*?)<\/h[2-4]>|<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
    ),
  ];

  // A stack rather than a single value, because the nearest heading is often
  // the least informative one. Barcelona files its all-time scorers under
  // "Top goalscorers" and then subdivides it with "All competitions"; matching
  // only the nearest heading sees "All competitions", which says nothing about
  // what is being ranked. Keeping the ancestors lets a caller match either.
  const stack: { level: number; text: string }[] = [];

  for (const match of sections) {
    // A heading match updates the running context and produces no table.
    if (match[2] !== undefined) {
      const level = Number(match[1] ?? '2');
      const text = cleanHtml(match[2])
        .replace(/\[edit\]/gi, '')
        .trim();
      if (!text) continue;
      while (stack.length > 0 && stack[stack.length - 1]!.level >= level) stack.pop();
      stack.push({ level, text });
      continue;
    }

    const body = match[3] ?? '';

    // `<tr id="mwB74">` rather than a bare `<tr>`: the REST renderer stamps an
    // identifier on every element, and a pattern expecting bare tags matches
    // nothing at all.
    // Chunks with no cells are discarded rather than treated as rows. Some
    // pages close the header row on its own line, which produces an empty
    // chunk that a naive split reads as the first data row: Liverpool's
    // appearance table came back with every value blank for exactly that
    // reason while Barcelona's parsed correctly.
    const rowChunks = body
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    if (rowChunks.length === 0) continue;

    // A single spanning `<th>` is a caption, not the header row. Rangers' page
    // titles each table that way ("Appearances records by player") and puts the
    // real columns underneath, so reading the first row as headers gave a
    // one-column table and the club's two leaderboards were both dropped.
    let caption: string | null = null;

    // Some pages write the caption as a spanning `<td>` instead of a `<th>`.
    // Newcastle's article does, a dozen times under one heading, and the prose
    // ("Players who scored in consecutive games") then parses as the first data
    // row, so a trivia table looked exactly like an all-time leaderboard.
    const spanning = /<td[^>]*colspan\s*=\s*["']?[2-9][^>]*>([\s\S]*?)<\/td>/i;

    const headerIndex = rowChunks.findIndex((chunk, index) => {
      const cells = [...chunk.matchAll(/<th([^>]*)>([\s\S]*?)<\/th>/g)];
      if (cells.length === 0) return false;
      if (cells.length > 1) return true;
      // Only the first row may be a caption; a later single-cell header row is
      // the header of a table that genuinely has one column.
      if (index > 0 || !/colspan\s*=\s*["']?[2-9]/i.test(cells[0]![1] ?? '')) return true;

      caption = cleanHtml(cells[0]![2] ?? '') || null;
      return false;
    });
    if (headerIndex < 0) continue;

    const headers = [...(rowChunks[headerIndex] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(
      (cell) => cleanHtml(cell[1] ?? ''),
    );
    if (headers.length === 0) continue;

    // A lone cell where the header row promised several columns is a caption,
    // whether or not it carries a colspan attribute: Newcastle's does not.
    const captionRow =
      headers.length > 1
        ? rowChunks
            .slice(headerIndex + 1)
            .find((chunk) => [...chunk.matchAll(/<t[hd][^>]*>/g)].length === 1)
        : undefined;

    if (captionRow && !caption) {
      const inner =
        spanning.exec(captionRow)?.[1] ??
        /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/.exec(captionRow)?.[1] ??
        '';
      caption = cleanHtml(inner) || null;
    }

    const rows: ParsedRow[] = [];

    /**
     * Cells still spanning down from an earlier row, keyed by column.
     *
     * Wikipedia merges the rank cell when players tie, and merges the player
     * cell when someone has two spells at a club. The row underneath then has
     * fewer cells than there are columns, and reading it positionally shifts
     * every value one column left. That is how Manchester United's top scorers
     * came out as year ranges: the tied rows at ranks 5 and 7 lost their rank
     * cell, so the player column was read from the years column.
     */
    let carried = new Map<number, { value: string; links: string[]; remaining: number }>();

    for (const chunk of rowChunks.slice(headerIndex + 1)) {
      const rawCells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)];
      if (rawCells.length === 0) continue;

      // The caption row is not data. Left in, its prose became row one of every
      // Newcastle table and displaced the ranking by a place.
      if (headers.length > 1 && rawCells.length === 1) continue;

      // Full attribute text per cell, so the rowspan can be read back off it.
      const rawTags = [...chunk.matchAll(/<t[hd]([^>]*)>([\s\S]*?)<\/t[hd]>/g)];

      const cells: string[] = [];
      const cellLinks: string[][] = [];

      // Links are captured per cell rather than per row, because their order
      // is not the column order: many tables put a flag icon before the name,
      // so the first link in a row is a country and the player is second.
      // Keyed by cell index, the caller can ask for the link in the column it
      // actually cares about.
      const readLinks = (inner: string) =>
        [...inner.matchAll(/href="\.\/([^"#]+)"/g)].map((link) =>
          decodeURIComponent(link[1] ?? '').replace(/_/g, ' '),
        );

      const nextCarried = new Map<number, { value: string; links: string[]; remaining: number }>();
      let source = 0;

      for (let column = 0; column < headers.length; column += 1) {
        const inherited = carried.get(column);
        if (inherited) {
          // A cell spanning into this row occupies its column without
          // consuming one of the row's own cells.
          cells.push(inherited.value);
          cellLinks.push(inherited.links);
          if (inherited.remaining > 1) {
            nextCarried.set(column, { ...inherited, remaining: inherited.remaining - 1 });
          }
          continue;
        }

        const tag = rawTags[source];
        if (!tag) break;
        source += 1;

        const value = cleanHtml(tag[2] ?? '');
        const links = readLinks(tag[2] ?? '');
        cells.push(value);
        cellLinks.push(links);

        const span = Number(/rowspan="?(\d+)"?/i.exec(tag[1] ?? '')?.[1] ?? '1');
        if (span > 1) nextCarried.set(column, { value, links, remaining: span - 1 });
      }

      carried = nextCarried;

      if (cells.length === 0) continue;

      rows.push({ cells, links: cellLinks.flat(), cellLinks });
    }

    if (rows.length > 0) {
      tables.push({
        heading: stack.length > 0 ? stack[stack.length - 1]!.text : null,
        headingPath: stack.map((entry) => entry.text),
        caption,
        headers,
        rows,
      });
    }
  }

  return tables;
}

/**
 * Strips rendered HTML to text.
 *
 * Footnote superscripts and the style blocks the renderer injects are removed
 * first: without that, a header comes back as
 * `Games played</span>"}]]}'>GP` rather than `GP`.
 */
/** A leaderboard written as a definition list rather than a table. */
export interface ParsedList {
  /** The `<dt>` label the entries sit under, e.g. "Most appearances". */
  label: string;
  entries: { name: string; value: number; link?: string; detail: string | null }[];
}

/**
 * Leaderboards written as prose lists.
 *
 * Not every records article uses tables. France's is written entirely as
 * definition lists: a `<dt>` naming the record and `<dd>` entries reading
 * "**Hugo Lloris**, 145, 19 November 2008 — 18 December 2022". The table parser
 * finds nothing on such a page, so France had no records at all while every
 * comparable country had two tables.
 *
 * Consecutive lists are merged when the later one continues the earlier: the
 * record holder sits alone under "Most appearances" and the rest of the
 * leaderboard follows under "Other centurions", which is one ranking split
 * across two elements.
 */
export function parseDefinitionLists(html: string): ParsedList[] {
  const lists: ParsedList[] = [];

  for (const match of html.matchAll(/<dl[^>]*>([\s\S]*?)<\/dl>/g)) {
    const body = match[1] ?? '';

    const label = cleanHtml(/<dt[^>]*>([\s\S]*?)<\/dt>/.exec(body)?.[1] ?? '');

    const entries: ParsedList['entries'] = [];

    for (const item of body.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/g)) {
      const raw = item[1] ?? '';
      const text = cleanHtml(raw);

      // "Name, 145, 19 November 2008 — 18 December 2022". The name runs to the
      // first comma and the figure to the second; anything after is the span of
      // the record, which is kept as detail rather than parsed.
      const parts = text.split(',');
      if (parts.length < 2) continue;

      const name = parts[0]!.trim();
      const value = parseNumber(parts[1]!);
      if (!name || value === null) continue;

      // A row whose "name" is a number means the entry is not a person.
      if (/^[\d\s]+$/.test(name)) continue;

      const link = /<a[^>]+href="\.\/([^"#]+)"/.exec(raw)?.[1];

      entries.push({
        name,
        value,
        link: link ? decodeURIComponent(link).replace(/_/g, ' ') : undefined,
        detail: parts.slice(2).join(',').trim() || null,
      });
    }

    if (entries.length === 0) continue;

    // A list with no `<dt>` of its own, or one whose label announces itself as
    // the remainder of the list above, extends the previous entry instead of
    // starting a new leaderboard.
    const previous = lists[lists.length - 1];
    const isContinuation = !label || /^(other|also|further|remaining)\b/i.test(label);

    if (previous && isContinuation) {
      previous.entries.push(...entries);
      continue;
    }

    lists.push({ label, entries });
  }

  return lists;
}

function cleanHtml(value: string): string {
  let text = value;

  text = text.replace(/<sup[\s\S]*?<\/sup>/g, '');
  text = text.replace(/<style[\s\S]*?<\/style>/g, '');

  // Attributes are stripped before tags, and transclusion spans are unwrapped
  // rather than removed. Deleting those spans wholesale looks reasonable and
  // discards real content: Liverpool wraps every player name in a transclusion
  // span for the flag icon beside it, so removing the span removed the name and
  // the table parsed with every row blank.
  text = text.replace(/\sdata-mw='[^']*'/g, '');
  text = text.replace(/\sdata-mw="[^"]*"/g, '');
  text = text.replace(/<[^>]+>/g, ' ');

  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Whether a table's headers satisfy one required term.
 *
 * A term may list alternatives separated by "|". Records articles are split
 * roughly evenly between heading the person column "Player" and heading it
 * "Name": Scotland uses "Name" for both its leaderboards, so a hard
 * requirement on "player" rejected two correct tables and sent the country to a
 * worse source.
 */
function satisfiesTerm(headers: string[], term: string): boolean {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  return term.split('|').some((option) => {
    const wanted = normalise(option);
    // "name" is matched as a prefix so "Name and nationality" qualifies while
    // "Opponent name" does not; everything else matches as a substring.
    return headers.some((header) =>
      wanted === 'name' ? header.startsWith(wanted) : header.includes(wanted),
    );
  });
}

/**
 * Finds a table whose headers look like what the caller wants.
 *
 * Matching on headers rather than on position is what makes this survive the
 * variance between pages. Asking for "a table containing Rank and Player and
 * something goal-shaped" works on Barcelona, Liverpool and Juventus alike,
 * where "the second table on the page" works on exactly one of them.
 */
export function findTable(
  tables: ParsedTable[],
  required: string[],
  optional: string[] = [],
): ParsedTable | null {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  let best: { table: ParsedTable; score: number } | null = null;

  for (const table of tables) {
    const headers = table.headers.map(normalise);

    const hasAll = required.every((term) => satisfiesTerm(headers, term));
    if (!hasAll) continue;

    const score = optional.filter((term) =>
      headers.some((header) => header.includes(normalise(term))),
    ).length;

    if (!best || score > best.score) best = { table, score };
  }

  return best?.table ?? null;
}

/**
 * Finds the table a records article files under a given heading.
 *
 * Header matching alone is not enough on these pages, and the failure is not
 * subtle. Real Madrid's article carries nineteen tables, several of which have
 * a player column and a goals column: a by-season list, a by-competition list,
 * and the all-time list. Choosing between them on columns alone picked a
 * by-competition table, so the club's top scorer read "Cristiano Ronaldo 61"
 * five times over and then began listing seasons as though they were players.
 *
 * Wikipedia already states which table is which, in the heading above it. This
 * matches that heading first and falls back to column matching only when no
 * heading matches, which is what makes the same code correct on articles that
 * happen to have exactly one candidate.
 *
 * `headingTerms` are tried in order, so a caller can express that "Most goals"
 * is the wanted table and "Goalscorers" is an acceptable second choice.
 */
export function findTableByHeading(
  tables: ParsedTable[],
  headingTerms: string[],
  required: string[],
  optional: string[] = [],
): ParsedTable | null {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const satisfies = (table: ParsedTable) => {
    const headers = table.headers.map(normalise);
    return required.every((term) => satisfiesTerm(headers, term));
  };

  // Headings that qualify a table as a subset rather than the whole record.
  // Tottenham's page carries "Top 10 European competition scorers" and
  // Newcastle's a goalkeeping section, both of which satisfy every column test
  // the all-time table does. Matching them produced Harry Kane with 41 goals
  // and Newcastle's record scorer as a goalkeeper with 13.
  // A nested table under a heading that only enumerates ("List of topscorers"
  // beneath "Goals scored") is a breakdown of the table above it, not the
  // record itself. São Paulo's published record scorer came from such a list: a
  // 1933 state-championship tally of 21.
  const isEnumeration = (table: ParsedTable) =>
    table.headingPath.length > 1 && /^list of\b/i.test(table.heading ?? '');

  const isSubset = (table: ParsedTable) =>
    isEnumeration(table) ||
    [...table.headingPath, table.caption ?? ''].some((entry) =>
      /european|champions league|world cup|olympic|copa am|euros?\b|confederations|league only|domestic|in a season|by season|single season|single match|in a match|milestone|national cup|cup match|streak|firsts?\)|age\)|transfer|consecutive|fastest|latest|earliest|games taken|scored in|debut|goalkeep|clean sheet|substitute|youngest|oldest|fastest|assist|own goal|hat.?trick|manager|coach|captain/i.test(
        entry,
      ),
    );

  for (const term of headingTerms) {
    const wanted = normalise(term);

    // Exact heading before partial, so "Most goals" is not beaten by
    // "Most goals in a season" simply because that table appeared first.
    const candidates = tables.filter(
      (table) => table.headingPath.length > 0 && satisfies(table) && !isSubset(table),
    );

    // The caption counts as a heading. Newcastle files a dozen trivia tables and
    // its actual all-time list under the same "Goal scorers" heading, and only
    // the caption ("Records of all competition top goal scorers") tells them
    // apart; matching on the heading alone picked a single-match record and
    // published the club's top scorer with 20 goals.
    const labels = (table: ParsedTable) => [...table.headingPath, table.caption ?? ''];

    const exact = candidates.filter((table) =>
      labels(table).some((entry) => normalise(entry) === wanted),
    );
    if (exact.length > 0) return best(exact, wanted);

    const captioned = candidates.filter((table) => normalise(table.caption ?? '').includes(wanted));
    if (captioned.length > 0) return best(captioned, wanted);

    const partial = candidates.filter((table) =>
      labels(table).some((entry) => normalise(entry).includes(wanted)),
    );
    if (partial.length > 0) return best(partial, wanted);
  }

  return findTable(tables, required, optional);
}

/**
 * Chooses between tables that all match a heading term.
 *
 * Row count is deliberately not the tiebreak. A season-by-season list is longer
 * than the all-time top ten beside it, and ranking on length picked Juventus's
 * seasonal scorers, crediting the club's record goalscorer with 35.
 *
 * The table whose own nearest heading is the match wins, since a table sitting
 * directly under "Most goals" is the one that heading refers to; anything
 * matching only through an ancestor is a subdivision of it. Ties fall back to
 * document order, which on these articles puts the overall table first.
 */
function best(tables: ParsedTable[], wanted: string): ParsedTable {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const direct = tables.filter(
    (table) => table.heading && normalise(table.heading).includes(wanted),
  );

  const pool = direct.length > 0 ? direct : tables;

  // Shallowest heading path first. São Paulo files its all-time scorers under
  // "Goals scored" and a per-season list one level deeper under "List of
  // topscorers", which matches the term "Top scorers" as readily; taking the
  // deeper table published the club's record scorer as a 1933 state-championship
  // tally of 21.
  return pool.reduce((chosen, table) =>
    table.headingPath.length < chosen.headingPath.length ? table : chosen,
  );
}

/**
 * Parses "9,230", "46.85" or ".471" into a number.
 *
 * The leading-dot form matters: basketball writes shooting percentages as
 * ".471" rather than "0.471", and a pattern requiring a digit before the point
 * rejected every shooting figure on every player page while accepting
 * everything around them, so the columns simply went missing.
 *
 * Returns null for "-" and other placeholders.
 */
export function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[,\s]/g, '').replace(/[*†‡]/g, '');
  if (!/^-?(\d+(\.\d+)?|\.\d+)$/.test(cleaned)) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** One player's career totals for a single team. */
export interface RosterTotals {
  name: string;
  /** Canonical Wikipedia title, for resolving the row to a player we hold. */
  link: string | null;
  games: number | null;
  rebounds: number | null;
  assists: number | null;
  points: number | null;
}

/**
 * Strips the noise Wikipedia's renderer leaves in a header cell.
 *
 * `cleanHtml` is not enough on its own here. Two franchises defeat it in
 * different ways, and both were silently producing no tables:
 *
 *   - **Portland** styles its header through a template that leaks raw CSS and
 *     escaped markup into the cell, so "Statistics" arrives as
 *     `background-color: #E03A3E !important; … }'>Statistics`.
 *   - **Miami, Dallas and Charlotte** carry a citation stylesheet inside the
 *     `No.` header, so it arrives as `No.mw-parser-output .citation{…}`.
 *
 * The last `}'>` wins because the real label always follows the injected style,
 * and anything from `mw-parser-output` onwards is stylesheet rather than text.
 */
function cleanHeader(value: string): string {
  return cleanHtml(value)
    .replace(/&lt;[\s\S]*?&gt;/g, '')
    .replace(/^[\s\S]*\}'>/, '')
    .replace(/mw-parser-output[\s\S]*$/, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The metric a leaderboard column or heading refers to, if any. */
function metricFor(label: string): 'points' | 'rebounds' | 'assists' | 'games' | null {
  const text = label.toLowerCase().replace(/[^a-z]/g, '');
  if (/^(points|pts)$/.test(text)) return 'points';
  if (/^(rebounds|reb|totalrebounds)$/.test(text)) return 'rebounds';
  if (/^(assists|ast)$/.test(text)) return 'assists';
  if (/^(games|gp|gamesplayed)$/.test(text)) return 'games';
  return null;
}

/**
 * Career totals per player from an "{Team} all-time roster" article.
 *
 * Its own parser rather than a `parseTables` caller, because these pages defeat
 * that function: the roster template renders a **two-row header** whose first
 * row carries a `Statistics` cell spanning nine columns, and `parseTables`
 * counts columns from the first row alone and slices every data row to seven,
 * dropping REB, AST and PTS — exactly the figures wanted here.
 *
 * The numbers are why these pages are worth parsing at all: they are career
 * totals **for this team**, which no other source we hold provides. Wikidata has
 * no equivalent, and player infoboxes carry per-game averages over a whole
 * career, which is why an earlier version of the team tables could only rank by
 * average and flattered anyone who arrived late in a good career.
 *
 * ## Three layouts, because Wikipedia has three
 *
 * Measured across the NBA before this was widened, and there is no single shape
 * that serves them all:
 *
 *   1. **Wide roster.** Most franchises. One row per player with the totals
 *      inline under a spanning `Statistics` header. The Lakers and Spurs.
 *   2. **Statistics-leaders sections.** Miami and Dallas. The roster table
 *      carries no totals at all; instead an h2 "Statistics leaders" holds an h3
 *      per metric ("Points", "Rebounds", "Assists"), each with **two** tables,
 *      regular season then playoffs. Only the first is read, so the figures stay
 *      regular-season and comparable with layout 1.
 *   3. **Narrow roster.** Charlotte. One table with `Pts`, `Reb` and `Ast`
 *      columns named directly, no spanning header.
 *
 * All three are read. A franchise in none of them yields an empty array and
 * renders no tables rather than wrong ones.
 */
export function parseAllTimeRoster(html: string): RosterTotals[] {
  const results: RosterTotals[] = [];

  // Headings are tracked alongside tables because layout 2 identifies a
  // leaderboard only by the heading above it: its columns are the uninformative
  // "Rank | Player | Points".
  const parts = [
    ...html.matchAll(
      /<h([2-4])[^>]*>([\s\S]*?)<\/h[2-4]>|<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
    ),
  ];

  /** Metrics already taken, so the playoff table under a heading is skipped. */
  const claimed = new Set<string>();
  let heading = '';

  const readRows = (chunk: string) =>
    [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) => cell[1] ?? '');

  const linkIn = (cell: string) => {
    const match = /href="\.\/([^"#]+)"/.exec(cell);
    return match ? decodeURIComponent(match[1] ?? '').replace(/_/g, ' ') : null;
  };

  // Trailing markers on a name, all of them legend symbols rather than part of
  // it: `^` for a Hall of Famer or current player, `(#33)` for a retired
  // number, `†` and `*` for whatever the article's own key defines.
  const cleanName = (cell: string) =>
    cleanHtml(cell)
      .replace(/\s*\(#[^)]*\)/g, '')
      .replace(/[\^*†‡~]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  for (const part of parts) {
    if (part[2] !== undefined) {
      heading = cleanHeader(part[2]);
      continue;
    }

    const body = part[3] ?? '';
    const chunks = body
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    if (chunks.length < 2) continue;

    const firstRow = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHeader(cell[1] ?? ''),
    );

    // ── Layout 2: a leaderboard keyed by its heading ────────────────────────
    const rankIndex = firstRow.findIndex((label) => /^rank$/i.test(label));
    const playerIndex = firstRow.findIndex((label) => /^player$/i.test(label));
    if (rankIndex >= 0 && playerIndex >= 0) {
      // The value column is named on the table where possible, and falls back to
      // the heading, which is what actually distinguishes Miami's tables.
      const valueIndex = firstRow.findIndex((label) => metricFor(label) !== null);
      const metric = metricFor(firstRow[valueIndex] ?? '') ?? metricFor(heading);
      if (!metric || metric === 'games') continue;
      // Regular season is published first and playoffs second under the same
      // heading, so the second table is skipped rather than overwriting it.
      if (claimed.has(metric)) continue;
      claimed.add(metric);

      for (const chunk of chunks.slice(1)) {
        const cells = readRows(chunk);
        if (cells.length <= Math.max(playerIndex, valueIndex)) continue;
        const name = cleanName(cells[playerIndex] ?? '');
        const value = parseNumber(cleanHtml(cells[valueIndex] ?? ''));
        if (!name || value === null) continue;

        results.push({
          name,
          link: linkIn(cells[playerIndex] ?? ''),
          games: null,
          rebounds: metric === 'rebounds' ? value : null,
          assists: metric === 'assists' ? value : null,
          points: metric === 'points' ? value : null,
        });
      }
      continue;
    }

    // ── Layout 3: totals named directly on a single header row ──────────────
    const direct = new Map<string, number>();
    firstRow.forEach((label, index) => {
      const metric = metricFor(label);
      if (metric && !direct.has(metric)) direct.set(metric, index);
    });

    if (direct.has('points') || direct.has('rebounds') || direct.has('assists')) {
      for (const chunk of chunks.slice(1)) {
        const cells = readRows(chunk);
        if (cells.length < firstRow.length) continue;
        const name = cleanName(cells[0] ?? '');
        if (!name) continue;

        const value = (metric: string) => {
          const index = direct.get(metric);
          return index === undefined ? null : parseNumber(cleanHtml(cells[index] ?? ''));
        };

        results.push({
          name,
          link: linkIn(cells[0] ?? ''),
          games: value('games'),
          rebounds: value('rebounds'),
          assists: value('assists'),
          points: value('points'),
        });
      }
      continue;
    }

    // ── Layout 1: the wide roster, totals behind a spanning header ──────────
    const leading = firstRow.findIndex((label) => /^statistics$/i.test(label));
    if (leading < 1) continue;

    const subHeaders = [...(chunks[1] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHeader(cell[1] ?? '').toUpperCase(),
    );
    const offsets = new Map<string, number>();
    subHeaders.forEach((label, index) => {
      const metric = metricFor(label);
      if (metric && !offsets.has(metric)) offsets.set(metric, index);
    });
    if (offsets.size === 0) continue;

    for (const chunk of chunks.slice(2)) {
      const cells = readRows(chunk);
      if (cells.length <= leading) continue;
      const name = cleanName(cells[0] ?? '');
      if (!name) continue;

      const value = (metric: string) => {
        const index = offsets.get(metric);
        return index === undefined ? null : parseNumber(cleanHtml(cells[leading + index] ?? ''));
      };

      results.push({
        name,
        link: linkIn(cells[0] ?? ''),
        games: value('games'),
        rebounds: value('rebounds'),
        assists: value('assists'),
        points: value('points'),
      });
    }
  }

  return results;
}

/** One line of a player's infobox career highlights. */
export interface CareerHighlight {
  /** "22× NBA All-Star" reduces to this, with `times` carrying the 22. */
  label: string;
  /** How many times, where the line states it. Null for a one-off. */
  times: number | null;
}

/**
 * A player's career highlights, from the `highlights` infobox field.
 *
 * The field is how basketball itself summarises a career, and it is the shape a
 * reader expects: "4× NBA champion", "22× NBA All-Star", "4× NBA Most Valuable
 * Player". Our own honours list could not produce that. It is built from
 * Wikidata's `P166`, which holds no All-Star selections at all, records each
 * award as a separate dated row rather than a count, and mixes in whatever else
 * a person has won: LeBron James's page listed nineteen ESPY and BET awards on
 * separate lines, and a Golden Raspberry for Worst Actor, while never once
 * mentioning that he is a 22-time All-Star.
 *
 * Parsed rather than ingested as prose because the counts are the point. Each
 * line is a wiki list item of the rough form
 *
 *     * 13× [[All-NBA First Team]] ({{nbay|2005|end}}, ...)
 *
 * so the multiplier is read off the front, the wiki links are reduced to their
 * display text, and the trailing year list is dropped: it is what made the
 * honours section sprawl, and the count already carries the information.
 *
 * Ordering is preserved exactly as the article states it, which is not
 * alphabetical and not chronological but roughly by prestige, championships
 * first. That ordering is editorial work by people who know the sport, and it
 * is better than anything we would derive from a title string.
 *
 * Returns an empty array when the field is absent or holds no list items, so a
 * player without one keeps the honours list we already show.
 */
export function parseCareerHighlights(wikitext: string): CareerHighlight[] {
  const field = /\|\s*highlights\s*=/i.exec(wikitext);
  if (!field) return [];

  // The field ends at the next infobox parameter, which is the only reliable
  // terminator: the value itself spans many lines and contains pipes inside
  // templates and links.
  const rest = wikitext.slice(field.index + field[0].length);
  const next = /\n\s*\|\s*[a-z_0-9]+\s*=/.exec(rest);
  const body = next ? rest.slice(0, next.index) : rest.slice(0, 4000);

  const highlights: CareerHighlight[] = [];

  for (const raw of body.split('\n')) {
    const line = raw.trim();
    // Only top-level list items. A nested "**" line qualifies the one above it
    // rather than naming an honour of its own.
    if (!line.startsWith('*') || line.startsWith('**')) continue;

    let text = line.replace(/^\*+\s*/, '');

    // Templates first: `{{nbay|2008|end}}` is a season, and leaving them in
    // means the year list survives the parenthesis strip below.
    text = text.replace(/\{\{[^{}]*\}\}/g, '');
    // Links reduce to their display text: `[[NBA champion|champion]]` to
    // "champion", `[[NBA All-Star]]` to "NBA All-Star".
    text = text.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1');
    // External links go entirely, label and all. They are inline citations
    // rather than part of the honour: Manu Ginóbili's retired-number line
    // carried a Spanish news URL, its headline and its byline into the label.
    text = text.replace(/\[https?:\/\/\S*[^\]]*\]/g, '');
    text = text.replace(/'''?/g, '');
    text = text.replace(/<[^>]*>/g, '');
    // The trailing year list, which is what made this sprawl on the page.
    text = text.replace(/\([^()]*\)/g, '');
    text = text.replace(/\s+/g, ' ').trim();

    if (!text) continue;

    // A heading rather than an honour: Michael Jordan's field opens with
    // "'''Basketball player:'''" before the list proper. Tested before the
    // trailing punctuation is stripped, or the colon that identifies it is
    // already gone and the heading parses as an award.
    if (/:$/.test(text)) continue;

    text = text.replace(/[,;]+$/, '').trim();

    const multiplier = /^(\d+)\s*[×x]\s*/i.exec(text);
    const label = multiplier ? text.slice(multiplier[0].length).trim() : text;
    if (!label) continue;

    // A line longer than this is prose rather than an honour, and the field is
    // freeform enough that one occasionally is. Dropped rather than truncated:
    // half a sentence reads worse than an omission.
    if (label.length > 80) continue;

    highlights.push({
      label,
      times: multiplier ? Number(multiplier[1]) : null,
    });
  }

  return highlights;
}

/** One row of an NBA list article: a name, a value, and the link behind it. */
export interface NbaListRow {
  name: string;
  link: string | null;
  value: string;
  detail: string | null;
}

/**
 * Strips the annotation Wikipedia hangs off a name in these list articles.
 *
 * A trailing `*` marks a Hall of Famer, `†` an active player and `‡` whatever
 * the article's own key defines. A parenthesised run is a count or a span of
 * years. None of it is part of the name, and left in it reaches the page: the
 * career leaders table published "John Stockton*" and the champions table
 * "Baltimore Bullets† (2) (1, 1–0)".
 *
 * Reference markers are handled too. The renderer leaves the raw citation
 * template in the cell for a minority of rows, which is how a scoring-title
 * entry arrived as "Max Zaslofsky<ref>{{cite web |url=...}}</ref>[e]".
 */
function cleanListName(value: string): string {
  return (
    cleanHtml(value)
      // Both spellings, and in this order. `cleanHtml` decodes the entities, so a
      // pattern matching only `&lt;ref` runs too late to see it and left
      // "Max Zaslofsky<ref>" on the page once the template strip below had taken
      // everything after the braces.
      .replace(/(?:&lt;|<)ref[\s\S]*$/i, '')
      .replace(/\{\{[\s\S]*$/, '')
      .replace(/\[[a-z0-9]{1,3}\]/gi, '')
      .replace(/\([^()]*\)/g, '')
      // `^` marks an active player on some of these lists and survives as a
      // trailing caret otherwise, so the scoring leaders published
      // "LeBron James ^".
      .replace(/[*†‡§^~]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Folds a name for loose comparison: accents, case and punctuation removed. */
function foldName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Rows from a Wikipedia list article laid out as rank, name and a total.
 *
 * Serves the NBA's career leader lists, which all share one shape: a `Rank`
 * column, a `Player` column carrying the link, and a named total ("Total
 * steals", "Total points"). The value column is located by a caption fragment
 * rather than by position, because the columns after it differ between lists
 * and a fixed offset read games played on one and points per game on another.
 *
 * `limit` caps the rows taken. The source lists run to fifty and the page wants
 * ten, and truncating here rather than at the caller keeps the rank numbers
 * contiguous.
 *
 * Returns an empty array when no table matches, so a caller gets no table
 * rather than a wrong one.
 */
export function parseNbaLeaderList(html: string, valueHeader: string, limit: number): NbaListRow[] {
  for (const table of html.matchAll(
    /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
  )) {
    const chunks = (table[1] ?? '')
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    if (chunks.length < 2) continue;

    const headers = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? '').toLowerCase(),
    );

    const nameIndex = headers.findIndex((header) => header.startsWith('player'));
    const valueIndex = headers.findIndex((header) => header.includes(valueHeader.toLowerCase()));
    if (nameIndex < 0 || valueIndex < 0) continue;

    const rows: NbaListRow[] = [];

    for (const chunk of chunks.slice(1)) {
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
        (cell) => cell[1] ?? '',
      );
      if (cells.length <= Math.max(nameIndex, valueIndex)) continue;

      const name = cleanListName(cells[nameIndex] ?? '');
      const value = cleanHtml(cells[valueIndex] ?? '')
        .replace(/\[[a-z0-9]{1,3}\]/gi, '')
        .trim();
      if (!name || !value) continue;

      // The first link in the name cell is the player. Category links are
      // excluded: the renderer appends "Category:Articles with hCards" to a row
      // carrying a person's microformat, and it sorts before nothing useful.
      const link = [...(cells[nameIndex] ?? '').matchAll(/href="\.\/([^"#]+)"/g)]
        .map((match) => decodeURIComponent(match[1] ?? '').replace(/_/g, ' '))
        .find((title) => !title.startsWith('Category:'));

      rows.push({ name, link: link ?? null, value, detail: null });
      if (rows.length >= limit) break;
    }

    if (rows.length > 0) return rows;
  }

  return [];
}

/**
 * Winners from a season-by-season list article.
 *
 * The NBA's award and scoring-title lists share a shape the leader lists do
 * not: one row per season, with the season in the first column and the winner
 * beside it. Read separately because the useful value here is the year rather
 * than a total, and because the rows want reversing: the articles run oldest
 * first and a roll of honour reads newest first.
 *
 * The season is normalised to its **end** year, matching how the rest of the
 * catalogue dates NBA awards: "1946–47" becomes 1947. Getting that wrong is
 * what once published Kobe Bryant as the 2006 MVP when he won the 2008 one.
 */
export function parseNbaSeasonList(
  html: string,
  limit: number,
  /**
   * Header of the column naming the winner.
   *
   * "Player" on the NBA's and WNBA's award lists, and named explicitly where an
   * article titles the column after the award instead: the EuroLeague's Final
   * Four MVP list heads it "Final Four MVP", which matched nothing and left the
   * competition with no such table.
   */
  winnerHeader = 'player',
): NbaListRow[] {
  for (const table of html.matchAll(
    /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
  )) {
    const chunks = (table[1] ?? '')
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    // A header row and at least one data row. The column names below are what
    // actually identifies the right table, so a row count is redundant as a
    // filter and wrong as one: it silently rejected short tables.
    if (chunks.length < 2) continue;

    const headers = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? '').toLowerCase(),
    );

    const seasonIndex = headers.findIndex((header) => /^(season|year)/.test(header));
    const nameIndex = headers.findIndex((header) => header.startsWith(winnerHeader.toLowerCase()));
    if (seasonIndex < 0 || nameIndex < 0) continue;

    const rows: NbaListRow[] = [];

    for (const chunk of chunks.slice(1)) {
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
        (cell) => cell[1] ?? '',
      );
      if (cells.length <= Math.max(seasonIndex, nameIndex)) continue;

      const name = cleanListName(cells[nameIndex] ?? '');
      const season = cleanHtml(cells[seasonIndex] ?? '');
      if (!name) continue;

      // "1946–47" and "1946-47" both yield 1947; a bare "2024" yields itself.
      const span = /(\d{4})\s*[–-]\s*(\d{2,4})/.exec(season);
      const year = span
        ? span[2]!.length === 2
          ? Number(span[1]!.slice(0, 2) + span[2]) + (span[2] === '00' ? 100 : 0)
          : Number(span[2])
        : Number(/(\d{4})/.exec(season)?.[1] ?? NaN);
      if (!Number.isFinite(year)) continue;

      // The person, not a flag beside them. The EuroLeague's MVP rows open with
      // a nationality icon whose link is the country, so taking the first link
      // published Evan Fournier's award as pointing at France. Preferring a
      // link whose title resembles the printed name separates the two; where
      // none does, the first non-category link stands, which covers the case of
      // an article titled differently from the name in the table.
      const candidates = [...(cells[nameIndex] ?? '').matchAll(/href="\.\/([^"#]+)"/g)]
        .map((match) => decodeURIComponent(match[1] ?? '').replace(/_/g, ' '))
        .filter((title) => !title.startsWith('Category:') && !title.startsWith('File:'));

      const foldedName = foldName(name);
      const link =
        candidates.find((title) => {
          const foldedTitle = foldName(title);
          return foldedTitle.includes(foldedName) || foldedName.includes(foldedTitle);
        }) ?? candidates[0];

      rows.push({ name, link: link ?? null, value: String(year), detail: null });
    }

    if (rows.length > 0) return rows.reverse().slice(0, limit);
  }

  return [];
}

/**
 * Champions from a finals-by-year list article.
 *
 * "List of NBA champions" tabulates each final rather than each winner: one row
 * per year with the two conference champions either side of a `Result` column
 * holding the series score. The winner is whichever side took more games, which
 * is why this cannot reuse `parseNbaSeasonList`: neither team column is the
 * champion on its own, and taking the first would publish the losing finalist
 * for roughly half of NBA history.
 *
 * The team link is preferred over the name, since the name cell carries the
 * appearance and win-loss counts the article appends in brackets.
 */
export function parseNbaChampions(html: string, limit: number): NbaListRow[] {
  for (const table of html.matchAll(
    /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
  )) {
    const chunks = (table[1] ?? '')
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    // A header row and at least one data row. The column names below are what
    // actually identifies the right table, so a row count is redundant as a
    // filter and wrong as one: it silently rejected short tables.
    if (chunks.length < 2) continue;

    const headers = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? '').toLowerCase(),
    );

    const yearIndex = headers.findIndex((header) => /^year/.test(header));
    const westIndex = headers.findIndex((header) => header.includes('western champion'));
    const eastIndex = headers.findIndex((header) => header.includes('eastern champion'));
    const resultIndex = headers.findIndex((header) => header.startsWith('result'));
    if (yearIndex < 0 || westIndex < 0 || eastIndex < 0 || resultIndex < 0) continue;

    const rows: NbaListRow[] = [];

    for (const chunk of chunks.slice(1)) {
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
        (cell) => cell[1] ?? '',
      );
      if (cells.length <= Math.max(eastIndex, resultIndex)) continue;

      const year = Number(/(\d{4})/.exec(cleanHtml(cells[yearIndex] ?? ''))?.[1] ?? NaN);
      if (!Number.isFinite(year)) continue;

      // "4–2" means the side on the left won; "1–4" the side on the right.
      const score = /(\d+)\s*[–-]\s*(\d+)/.exec(cleanHtml(cells[resultIndex] ?? ''));
      if (!score) continue;

      const winnerCell = Number(score[1]) > Number(score[2]) ? cells[westIndex] : cells[eastIndex];
      const name = cleanListName(winnerCell ?? '');
      if (!name) continue;

      // The name cell links to the *season* article rather than the club:
      // "2020–21 Milwaukee Bucks season". The club is recoverable from it, and
      // is what resolves against the team catalogue, so the season prefix and
      // the "season" suffix are stripped rather than the link discarded.
      const link = [...(winnerCell ?? '').matchAll(/href="\.\/([^"#]+)"/g)]
        .map((match) => decodeURIComponent(match[1] ?? '').replace(/_/g, ' '))
        .filter((title) => !title.startsWith('Category:'))
        .map((title) =>
          title
            .replace(/^\d{4}(?:[–-]\d{2,4})?\s+/, '')
            .replace(/\s+season$/i, '')
            .trim(),
        )
        .find((title) => title.length > 0);

      rows.push({ name, link: link ?? null, value: String(year), detail: null });
    }

    if (rows.length > 0) return rows.reverse().slice(0, limit);
  }

  return [];
}

/**
 * Winners from a list whose champion sits in its own column.
 *
 * The third champions shape, after the NBA's two-sided finals table and the
 * medal-game form below. The NCAA, the WNBA and the EuroLeague all tabulate one
 * row per season with a column simply naming the winner, so no result needs
 * reading: the column is the answer.
 *
 * `winnerHeader` names that column because the three disagree on it: "Champion"
 * for the NCAA and the EuroLeague, "Champions" for the WNBA.
 */
export function parseChampionColumn(
  html: string,
  winnerHeader: string,
  limit: number,
): NbaListRow[] {
  for (const table of html.matchAll(
    /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
  )) {
    const chunks = (table[1] ?? '')
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    if (chunks.length < 2) continue;

    const headers = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? '').toLowerCase(),
    );

    const yearIndex = headers.findIndex((header) => /^(year|season)/.test(header));
    const winnerIndex = headers.findIndex((header) =>
      header.startsWith(winnerHeader.toLowerCase()),
    );
    if (yearIndex < 0 || winnerIndex < 0) continue;

    const rows: NbaListRow[] = [];

    for (const chunk of chunks.slice(1)) {
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
        (cell) => cell[1] ?? '',
      );
      if (cells.length <= Math.max(yearIndex, winnerIndex)) continue;

      const season = cleanHtml(cells[yearIndex] ?? '');
      // A season may be written as a span, and is dated by its end year to match
      // the rest of the catalogue.
      const span = /(\d{4})\s*[–-]\s*(\d{2,4})/.exec(season);
      const year = span
        ? span[2]!.length === 2
          ? Number(span[1]!.slice(0, 2) + span[2])
          : Number(span[2])
        : Number(/(\d{4})/.exec(season)?.[1] ?? NaN);
      if (!Number.isFinite(year)) continue;

      // The flag beside the winner carries a country name of its own, which on
      // the EuroLeague's rows is a separate link and renders as an image. Where
      // the text survives, it prefixes the club: "Greece Olympiacos". Dropping
      // any leading link that is not the last one in the cell leaves the club.
      const winnerCellRaw = cells[winnerIndex] ?? '';
      const winnerLinks = [...winnerCellRaw.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)];
      const name =
        winnerLinks.length > 1
          ? cleanListName(winnerLinks[winnerLinks.length - 1]![1] ?? '')
          : cleanListName(winnerCellRaw);
      if (!name) continue;

      // A season with no champion. Both the NCAA and the EuroLeague fill the
      // winner column with prose when a tournament did not happen, so 2020
      // published "Tournament not held due to the COVID-19 pandemic" and
      // "Cancelled due to COVID-19 pandemic" as though they were teams. A
      // champion's name is short and never a sentence.
      if (/\b(cancel|not held|abandon|no (?:tournament|competition)|suspend)/i.test(name)) {
        continue;
      }

      // The club, not the flag beside it. EuroLeague rows open with a country
      // icon whose link is the nation, so taking the first link published
      // Olympiacos as Greece and Fenerbahçe as Turkey. Matching the visible
      // name is what separates the two: the flag's title never does.
      const winnerCell = cells[winnerIndex] ?? '';
      const foldedName = foldName(name);
      const link = [...winnerCell.matchAll(/href="\.\/([^"#]+)"/g)]
        .map((match) => decodeURIComponent(match[1] ?? '').replace(/_/g, ' '))
        .filter((title) => !title.startsWith('Category:') && !title.startsWith('File:'))
        .filter((title) => {
          const foldedTitle = foldName(title);
          return foldedTitle.includes(foldedName) || foldedName.includes(foldedTitle);
        })
        .map((title) =>
          title
            .replace(/^\d{4}(?:[–-]\d{2,4})?\s+/, '')
            .replace(/\s+season$/i, '')
            .trim(),
        )
        .find((title) => title.length > 0);

      rows.push({ name, link: link ?? null, value: String(year), detail: null });
    }

    if (rows.length > 0) return rows.reverse().slice(0, limit);
  }

  return [];
}

/**
 * Winners from a tournament list whose final is one cell.
 *
 * FIBA and the Olympics tabulate an edition per row with a `Final` column
 * holding the whole result: the champion, the score and the venue run together
 * as text, so nothing can be read positionally. The champion is the **first
 * national-team link** in that cell, which is reliable because the runner-up
 * appears after the score and the venue links are places rather than teams.
 *
 * Future editions are skipped. Both articles list scheduled tournaments with
 * "Future event" in place of a result, and a row with no winner is not a row.
 */
export function parseTournamentFinal(html: string, limit: number): NbaListRow[] {
  for (const table of html.matchAll(
    /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g,
  )) {
    const chunks = (table[1] ?? '')
      .split(/<tr[^>]*>/)
      .slice(1)
      .filter((chunk) => /<t[hd][^>]*>/.test(chunk));
    // A header row and at least one data row. The column names below identify
    // the right table, so a row count is redundant as a filter.
    if (chunks.length < 2) continue;

    const headers = [...(chunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? '').toLowerCase(),
    );

    const yearIndex = headers.findIndex((header) => /^year/.test(header));
    // "Final" on FIBA, "Gold medal game" at the Olympics.
    const finalIndex = headers.findIndex(
      (header) => header.startsWith('final') || header.includes('gold medal'),
    );
    if (yearIndex < 0 || finalIndex < 0) continue;

    const rows: NbaListRow[] = [];

    for (const chunk of chunks.slice(1)) {
      const cells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(
        (cell) => cell[1] ?? '',
      );
      if (cells.length <= Math.max(yearIndex, finalIndex)) continue;

      const year = Number(/(\d{4})/.exec(cleanHtml(cells[yearIndex] ?? ''))?.[1] ?? NaN);
      if (!Number.isFinite(year)) continue;

      const finalCell = cells[finalIndex] ?? '';
      if (/future event/i.test(cleanHtml(finalCell))) continue;

      // A national side's article, which is what names the champion. Venue and
      // city links are excluded by requiring the team suffix.
      const teamLink = [...finalCell.matchAll(/href="\.\/([^"#]+)"/g)]
        .map((match) => decodeURIComponent(match[1] ?? '').replace(/_/g, ' '))
        .find((title) => /national basketball team/i.test(title));
      if (!teamLink) continue;

      // "Germany men's national basketball team" reads as "Germany" in a roll
      // of honour: the qualifier is the same on every row and carries nothing.
      const name = teamLink
        .replace(/\s+(?:men's|women's)?\s*national basketball team$/i, '')
        .trim();
      if (!name) continue;

      rows.push({ name, link: teamLink, value: String(year), detail: null });
    }

    if (rows.length > 0) return rows.reverse().slice(0, limit);
  }

  return [];
}
