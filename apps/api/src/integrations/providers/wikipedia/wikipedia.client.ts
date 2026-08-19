import { Injectable } from '@nestjs/common';
import { ProviderError } from '../provider.types';

/**
 * Low-level access to the MediaWiki APIs.
 *
 * Two endpoints, used for different things because they are good at different
 * things:
 *
 *   - **`action=parse&prop=wikitext`** returns the raw source. Infoboxes are
 *     flat `| key = value` pairs there, which is the most reliable structured
 *     data Wikipedia exposes.
 *   - **`/api/rest_v1/page/html`** returns rendered HTML. Templates are already
 *     expanded, so a career table is real `<td>` cells rather than
 *     `{{sortname|Lionel|Messi}}`, and player names arrive as links that map
 *     straight to canonical titles.
 *
 * ## What may be stored, and what may not
 *
 * Wikipedia text is CC BY-SA 4.0. That licence covers **expression**, not
 * facts: nobody owns the fact that Tendulkar scored 2,278 World Cup runs, but
 * the sentences describing cricket's origins are somebody's writing.
 *
 * So this client is deliberately built to extract **facts and tables** and is
 * not used to harvest article prose. Numbers, dates, names and structured rows
 * are stored freely; narrative paragraphs are written by us and Wikipedia is
 * linked as a source. That keeps share-alike from attaching to our own
 * editorial layer, which is the part of the product we actually own.
 */
@Injectable()
export class WikipediaClient {
  private static readonly API = 'https://en.wikipedia.org/w/api.php';
  private static readonly REST = 'https://en.wikipedia.org/api/rest_v1';

  /**
   * Wikimedia's User-Agent policy requires a descriptive agent identifying the
   * operator and a contact. Requests without one are refused, and a generic one
   * is a good way to get an IP range blocked.
   */
  private static readonly USER_AGENT =
    'SportBrainHQ/0.1 (https://sportbrainhq.com; tech@sportbrainhq.com)';

  /**
   * Self-imposed pacing.
   *
   * Wikimedia publishes no hard anonymous rate limit and served ten sequential
   * requests without complaint when this was measured. That is not licence to
   * hammer a donated service: a full crawl of the catalogue is thousands of
   * requests, and the polite rate is what keeps it available.
   */
  private static readonly MIN_INTERVAL_MS = 400;

  /**
   * Retries allowed after a 429.
   *
   * Measured: a records-article crawl at the old 250ms pace was throttled
   * roughly ten teams in, which is well short of a full catalogue.
   */
  private static readonly MAX_RETRIES = 4;

  private lastRequestAt = 0;

  /** Raw wikitext for a page. The route to infoboxes. */
  async fetchWikitext(title: string): Promise<string | null> {
    const url =
      `${WikipediaClient.API}?action=parse&page=${encodeURIComponent(title)}` +
      `&prop=wikitext&format=json&formatversion=2&redirects=1`;

    const body = await this.getJson<{
      parse?: { wikitext?: string };
      error?: { code: string; info: string };
    }>(url);

    // A missing page is a normal outcome when walking a catalogue, not a
    // failure: plenty of entities have no article.
    if (body.error?.code === 'missingtitle') return null;
    if (body.error) {
      throw new ProviderError('wikipedia', `${body.error.code}: ${body.error.info}`, false);
    }

    return body.parse?.wikitext ?? null;
  }

  /** Rendered HTML. The route to tables, where templates are already expanded. */
  async fetchHtml(title: string): Promise<string | null> {
    const url = `${WikipediaClient.REST}/page/html/${encodeURIComponent(title)}`;

    const response = await this.send(url, 'text/html');

    if (response.status === 404) return null;
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('wikipedia', `HTTP ${response.status}`, retryable);
    }

    return response.text();
  }

  /**
   * Resolves a search term to a canonical page title.
   *
   * Needed because title construction is unreliable. The records pages follow a
   * pattern closely enough to be tempting and not closely enough to be safe:
   * three of four guessed titles resolved, and Liverpool's did not, because it
   * is "List of Liverpool F.C. records and statistics" rather than the
   * "Liverpool F.C. records and statistics" the pattern implied.
   */
  async resolveTitle(search: string): Promise<string | null> {
    const [first] = await this.resolveTitles(search, 1);
    return first ?? null;
  }

  /**
   * Several candidate titles for a search, best first.
   *
   * The top hit is often not the right one. Searching for Australia's Test
   * records returns the generic "List of Test cricket records" first and
   * "List of Australia Test cricket records" second, so a caller that reads
   * only the first result finds nothing usable and rejects a page that was
   * there all along.
   */
  async resolveTitles(search: string, limit = 5): Promise<string[]> {
    const url =
      `${WikipediaClient.API}?action=query&list=search` +
      `&srsearch=${encodeURIComponent(search)}&srlimit=${limit}&format=json&formatversion=2`;

    const body = await this.getJson<{ query?: { search?: { title: string }[] } }>(url);
    return (body.query?.search ?? []).map((row) => row.title);
  }

  /** Whether a page exists, without downloading it. */
  async exists(title: string): Promise<boolean> {
    const url =
      `${WikipediaClient.API}?action=query&titles=${encodeURIComponent(title)}` +
      `&format=json&formatversion=2&redirects=1`;

    const body = await this.getJson<{ query?: { pages?: { missing?: boolean }[] } }>(url);
    const page = body.query?.pages?.[0];
    return page !== undefined && page.missing !== true;
  }

  /**
   * Rendered thumbnail URLs for file pages, keyed by the file title given.
   *
   * This is the only route to a club crest, and the reason is licensing rather
   * than data quality. Crests are copyrighted logos, so they are not on Commons
   * and Wikidata's P154 cannot point at them: probing the live endpoint returns
   * no P154 at all for Real Madrid, Arsenal, Manchester City, Manchester United
   * or France, and the properties that *are* present are a stadium photo (P18)
   * and a colour swatch or national flag (P41). Every one of those would be
   * worse in a crest slot than no image. The files exist on **en.wikipedia**
   * under fair use, and only the local API exposes them.
   *
   * Two further findings, each of which produced a broken result first:
   *
   *   - **`prop=pageimages` returns nothing for these pages.** Non-free files
   *     are excluded from it, which is exactly the set wanted here, so the
   *     obvious API is the one that cannot work.
   *   - **The thumbnail URL must be taken from the response, not built.**
   *     Hand-assembling the conventional `.../thumb/a/ab/Name.svg/320px-Name.svg.png`
   *     form returned HTTP 400 for all three crests it was tried on. The
   *     `thumburl` the API returns carries query parameters and serves 200.
   *
   * Batched 50 titles per call, which is the API limit for `titles`, because
   * this runs over thousands of teams.
   */
  async fetchThumbnails(
    fileTitles: readonly string[],
    width: number,
  ): Promise<Map<string, string>> {
    const resolved = new Map<string, string>();

    for (let index = 0; index < fileTitles.length; index += 50) {
      const batch = fileTitles.slice(index, index + 50);

      const url =
        `${WikipediaClient.API}?action=query&prop=imageinfo&iiprop=url|mime` +
        `&iiurlwidth=${width}&titles=${encodeURIComponent(batch.join('|'))}` +
        `&format=json&formatversion=2`;

      const body = await this.getJson<{
        query?: {
          pages?: {
            title: string;
            missing?: boolean;
            imageinfo?: { thumburl?: string; url?: string }[];
          }[];
        };
      }>(url);

      for (const page of body.query?.pages ?? []) {
        if (page.missing) continue;

        // `thumburl` is absent for formats MediaWiki will not rasterise. The
        // original is still better than nothing for those.
        const source = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
        if (source) resolved.set(page.title, source);
      }
    }

    return resolved;
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await this.send(url, 'application/json');

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('wikipedia', `HTTP ${response.status}`, retryable);
    }

    return (await response.json()) as T;
  }

  /**
   * One request, paced and retried on throttling.
   *
   * Wikimedia answers a sustained crawl with 429 well before it answers with an
   * error, and a 429 halfway through a catalogue walk loses every team after
   * it. Backing off and retrying turns that into a pause rather than a failure,
   * and honours `Retry-After` when the response carries one.
   */
  private async send(url: string, accept: string): Promise<Response> {
    for (let attempt = 0; ; attempt += 1) {
      await this.throttle();

      let response: Response;
      try {
        response = await fetch(url, {
          headers: { 'User-Agent': WikipediaClient.USER_AGENT, Accept: accept },
          signal: AbortSignal.timeout(45_000),
        });
      } catch (error) {
        throw new ProviderError('wikipedia', 'request failed', true, error);
      }

      if (response.status !== 429 || attempt >= WikipediaClient.MAX_RETRIES) return response;

      const header = Number(response.headers.get('retry-after'));
      const wait = Number.isFinite(header) && header > 0 ? header * 1000 : 2000 * 2 ** attempt;

      await new Promise((resolve) => setTimeout(resolve, Math.min(wait, 30_000)));
    }
  }

  private async throttle(): Promise<void> {
    const wait = WikipediaClient.MIN_INTERVAL_MS - (Date.now() - this.lastRequestAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    this.lastRequestAt = Date.now();
  }
}
