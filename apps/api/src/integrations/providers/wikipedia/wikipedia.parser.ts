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
 * Extracts the first infobox from wikitext.
 *
 * Brace-counted rather than regex-matched. Infoboxes contain nested templates
 * (`{{ubl|...}}`, `{{cr|AUS}}`), and a non-greedy match to the first `}}`
 * truncates the box at the first nested template, silently dropping most of it.
 */
export function parseInfobox(wikitext: string): Infobox | null {
  const start = wikitext.search(/\{\{\s*Infobox/i);
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

    const headers = [...(rowChunks[0] ?? '').matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((cell) =>
      cleanHtml(cell[1] ?? ''),
    );
    if (headers.length === 0) continue;

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

    for (const chunk of rowChunks.slice(1)) {
      const rawCells = [...chunk.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)];
      if (rawCells.length === 0) continue;

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

    const hasAll = required.every((term) =>
      headers.some((header) => header.includes(normalise(term))),
    );
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
    return required.every((term) => headers.some((header) => header.includes(normalise(term))));
  };

  // Headings that qualify a table as a subset rather than the whole record.
  // Tottenham's page carries "Top 10 European competition scorers" and
  // Newcastle's a goalkeeping section, both of which satisfy every column test
  // the all-time table does. Matching them produced Harry Kane with 41 goals
  // and Newcastle's record scorer as a goalkeeper with 13.
  const isSubset = (table: ParsedTable) =>
    table.headingPath.some((entry) =>
      /european|champions league|league only|domestic|in a season|by season|single season|goalkeep|clean sheet|substitute|youngest|oldest|fastest/i.test(
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

    const exact = candidates.filter((table) =>
      table.headingPath.some((entry) => normalise(entry) === wanted),
    );
    if (exact.length > 0) return best(exact, wanted);

    const partial = candidates.filter((table) =>
      table.headingPath.some((entry) => normalise(entry).includes(wanted)),
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

  return direct[0] ?? tables[0]!;
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
