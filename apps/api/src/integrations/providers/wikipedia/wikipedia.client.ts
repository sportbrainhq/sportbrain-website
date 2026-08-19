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
  private static readonly MIN_INTERVAL_MS = 250;

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
    await this.throttle();

    const url = `${WikipediaClient.REST}/page/html/${encodeURIComponent(title)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': WikipediaClient.USER_AGENT, Accept: 'text/html' },
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      throw new ProviderError('wikipedia', 'request failed', true, error);
    }

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
    const url =
      `${WikipediaClient.API}?action=query&list=search` +
      `&srsearch=${encodeURIComponent(search)}&srlimit=1&format=json&formatversion=2`;

    const body = await this.getJson<{ query?: { search?: { title: string }[] } }>(url);
    return body.query?.search?.[0]?.title ?? null;
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

  private async getJson<T>(url: string): Promise<T> {
    await this.throttle();

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': WikipediaClient.USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      throw new ProviderError('wikipedia', 'request failed', true, error);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('wikipedia', `HTTP ${response.status}`, retryable);
    }

    return (await response.json()) as T;
  }

  private async throttle(): Promise<void> {
    const wait = WikipediaClient.MIN_INTERVAL_MS - (Date.now() - this.lastRequestAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    this.lastRequestAt = Date.now();
  }
}
