import { createHash } from 'node:crypto';
import { Logger } from '@nestjs/common';
import { guardOutboundUrl } from '../../../common/security/url-guard';

/**
 * Fetches one RSS/Atom feed URL robustly, on behalf of a `news_sources` row.
 *
 * Retry strategy: retries live entirely in this module (an in-fetcher retry
 * loop with exponential backoff), not in BullMQ's job-level `attempts`. The
 * `news-fetch` BullMQ job itself is configured with a small number of
 * `attempts` too (see `queue/queue.constants.ts` usage in the fetch
 * processor), but that outer retry exists for infrastructure failure (the
 * worker process dying mid-job), not for transient HTTP failure — this
 * function already exhausts `config.news.rss.retryCount` attempts against
 * the network before returning, so a BullMQ retry of the whole job should be
 * rare and is not "two independent retry storms" stacked on top of each
 * other for the same failure.
 *
 * Redirects: followed automatically by `fetch` (Node's default,
 * `redirect: 'follow'`), capped at `MAX_REDIRECTS` by using `redirect:
 * 'manual'` and following hops ourselves, so a feed cannot bounce this
 * fetcher through an unbounded or looping redirect chain, and — critically —
 * so every hop is re-validated by `guardOutboundUrl` before being followed
 * (a redirect to a private/internal address is exactly the SSRF vector the
 * guard exists for; letting `fetch` follow redirects natively would bypass
 * it entirely).
 */

const MAX_REDIRECTS = 5;
const USER_AGENT = 'SportBrainHQ-NewsFetcher/1.0 (+https://sportbrainhq.com)';

export interface RssFetchInput {
  url: string;
  timeoutMs: number;
  maxResponseBytes: number;
  retryCount: number;
  /** Conditional-GET bookkeeping from the source's last successful fetch. */
  etag?: string | null;
  lastModified?: string | null;
  /** Content hash of the source's last successful fetch, for the no-304-but-identical-bytes case. */
  previousContentHash?: string | null;
}

export type RssFetchResult =
  | {
      outcome: 'success';
      httpStatus: number;
      body: string;
      contentHash: string;
      etag: string | null;
      lastModified: string | null;
      /** True when the content hash matches `previousContentHash` (a 200 with byte-identical content). */
      unchanged: boolean;
    }
  | {
      outcome: 'not_modified';
      httpStatus: 304;
      etag: string | null;
      lastModified: string | null;
    }
  | {
      outcome: 'rejected';
      reason: string;
    }
  | {
      outcome: 'failed';
      httpStatus: number | null;
      errorMessage: string;
    };

const logger = new Logger('RssFetcher');

export function hashContent(body: string): string {
  return createHash('sha256').update(body).digest('hex');
}

/** Fetches a feed, retrying transient failures with exponential backoff, up to `retryCount` extra attempts. */
export async function fetchRssFeed(input: RssFetchInput): Promise<RssFetchResult> {
  const guard = guardOutboundUrl(input.url);
  if (!guard.allowed) {
    return { outcome: 'rejected', reason: `${guard.reason}: ${guard.detail}` };
  }

  const totalAttempts = input.retryCount + 1;
  let lastError: string = 'unknown error';
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    if (attempt > 0) {
      const backoffMs = Math.min(30_000, 500 * 2 ** (attempt - 1));
      await sleep(backoffMs);
    }

    try {
      const result = await attemptFetch(input);
      if (result.outcome === 'failed' && attempt < totalAttempts - 1 && isRetryable(result)) {
        lastError = result.errorMessage;
        lastStatus = result.httpStatus;
        logger.warn(
          `Fetch attempt ${attempt + 1}/${totalAttempts} failed for "${input.url}": ${result.errorMessage}. Retrying.`,
        );
        continue;
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === totalAttempts - 1) {
        return { outcome: 'failed', httpStatus: null, errorMessage: lastError };
      }
      logger.warn(
        `Fetch attempt ${attempt + 1}/${totalAttempts} threw for "${input.url}": ${lastError}. Retrying.`,
      );
    }
  }

  return { outcome: 'failed', httpStatus: lastStatus, errorMessage: lastError };
}

function isRetryable(result: { httpStatus: number | null }): boolean {
  // Network errors (httpStatus null) and 5xx/429 are worth retrying. A 4xx
  // other than 429 is the feed telling us something that won't change on
  // retry (bad URL, forbidden), so retrying wastes the remaining budget.
  if (result.httpStatus === null) return true;
  if (result.httpStatus === 429) return true;
  return result.httpStatus >= 500;
}

async function attemptFetch(input: RssFetchInput): Promise<RssFetchResult> {
  let currentUrl = input.url;

  for (let redirectHop = 0; redirectHop <= MAX_REDIRECTS; redirectHop++) {
    const guard = guardOutboundUrl(currentUrl);
    if (!guard.allowed) {
      return { outcome: 'rejected', reason: `${guard.reason}: ${guard.detail}` };
    }

    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    };
    if (input.etag) headers['If-None-Match'] = input.etag;
    if (input.lastModified) headers['If-Modified-Since'] = input.lastModified;

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(input.timeoutMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { outcome: 'failed', httpStatus: null, errorMessage: message };
    }

    // 304 is handled separately below: it is a conditional-GET response, not
    // a redirect, and carries no Location header to follow.
    if (response.status >= 300 && response.status < 400 && response.status !== 304) {
      const location = response.headers.get('location');
      if (!location) {
        return {
          outcome: 'failed',
          httpStatus: response.status,
          errorMessage: `Redirect status ${response.status} with no Location header`,
        };
      }
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (response.status === 304) {
      return {
        outcome: 'not_modified',
        httpStatus: 304,
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
      };
    }

    if (!response.ok) {
      return {
        outcome: 'failed',
        httpStatus: response.status,
        errorMessage: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    const body = await readBodyBounded(response, input.maxResponseBytes);
    if (body === null) {
      return {
        outcome: 'failed',
        httpStatus: response.status,
        errorMessage: `Response exceeded maxResponseBytes (${input.maxResponseBytes})`,
      };
    }

    const contentHash = hashContent(body);
    const unchanged =
      input.previousContentHash !== undefined &&
      input.previousContentHash !== null &&
      input.previousContentHash === contentHash;

    return {
      outcome: 'success',
      httpStatus: response.status,
      body,
      contentHash,
      etag: response.headers.get('etag'),
      lastModified: response.headers.get('last-modified'),
      unchanged,
    };
  }

  return {
    outcome: 'failed',
    httpStatus: null,
    errorMessage: `Exceeded maximum redirect count (${MAX_REDIRECTS})`,
  };
}

/**
 * Reads a response body up to `maxBytes`, aborting rather than buffering
 * unbounded. Returns `null` if the limit is exceeded.
 */
async function readBodyBounded(response: Response, maxBytes: number): Promise<string | null> {
  if (!response.body) {
    const text = await response.text();
    return Buffer.byteLength(text, 'utf8') > maxBytes ? null : text;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
