import {
  competitionDetailSchema,
  competitionSummarySchema,
  contentDetailSchema,
  contentSummarySchema,
  explainerDetailSchema,
  explainerLibrarySchema,
  explainerSummarySchema,
  highlightSchema,
  quizSummarySchema,
  sportOverviewSchema,
  errorResponseSchema,
  healthResponseSchema,
  paginated,
  playerDetailSchema,
  playerSummarySchema,
  searchResultSchema,
  sportDetailSchema,
  sportSchema,
  teamDetailSchema,
  teamSummarySchema,
  type CompetitionDetail,
  type ContentDetail,
  type ContentSummary,
  type ExplainerDetail,
  type ExplainerLibrary,
  type ExplainerSummary,
  type HealthResponse,
  type Highlight,
  type QuizSummary,
  type SportOverview,
  type Paginated,
  type PlayerDetail,
  type SearchResult,
  type Sport,
  type SportDetail,
  type TeamDetail,
} from '@sportbrain/contracts';
import { z } from 'zod';
import type { ZodSchema } from 'zod';
import { serverEnv } from './env';

/**
 * The single path from the web app to the API.
 *
 * No component calls `fetch` directly. Centralising it means timeouts,
 * error shape, request-id propagation and caching policy are decided once.
 *
 * This lives in the app rather than in `packages/api-client` on purpose:
 * with one endpoint, a package would be indirection without benefit. It gets
 * extracted the moment a second consumer appears (an admin app, a worker) or
 * the domain surface grows past a handful of calls. The shape below is
 * already extraction-ready.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  /**
   * Seconds before a cached response is considered stale. Omit to leave
   * caching to the framework default.
   *
   * Note this is a positive number only. Next.js treats `revalidate: false`
   * as "cache indefinitely", not "do not cache", which is the opposite of
   * what it reads like. Use `noStore` for that.
   */
  revalidate?: number;
  /** Cache tags, for targeted invalidation via revalidateTag. */
  tags?: string[];
  /** Bypasses the cache entirely. For data that must be fresh on every request. */
  noStore?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * Performs a typed GET against the API and validates the response.
 *
 * Validating on arrival rather than casting means a contract mismatch surfaces
 * here, with the offending field named, instead of as an undefined property
 * during render.
 */
export async function apiGet<T>(
  path: string,
  schema: ZodSchema<T>,
  options: RequestOptions = {},
): Promise<T> {
  const { API_URL } = serverEnv();
  const url = `${API_URL}${path}`;

  const timeout = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
    ...(options.noStore
      ? { cache: 'no-store' as const }
      : options.revalidate === undefined && options.tags === undefined
        ? {}
        : { next: { revalidate: options.revalidate, tags: options.tags } }),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const parsed = schema.safeParse(await response.json());

  if (!parsed.success) {
    throw new ApiError(
      response.status,
      'CONTRACT_MISMATCH',
      `Response from ${path} did not match its contract: ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join('; ')}`,
    );
  }

  return parsed.data;
}

async function toApiError(response: Response): Promise<ApiError> {
  const requestId = response.headers.get('x-request-id') ?? undefined;

  try {
    const body = errorResponseSchema.safeParse(await response.json());
    if (body.success) {
      return new ApiError(
        response.status,
        body.data.error.code,
        body.data.error.message,
        requestId,
      );
    }
  } catch {
    // Body was not JSON. Fall through to the generic error below.
  }

  return new ApiError(response.status, 'UNKNOWN', `API returned ${response.status}`, requestId);
}

// --- Endpoints --------------------------------------------------------------

/**
 * Fetches API health.
 *
 * Never cached: a cached health check reports the past, which defeats its
 * purpose.
 */
export function fetchHealth(): Promise<HealthResponse> {
  return apiGet('/health', healthResponseSchema, { noStore: true, timeoutMs: 3_000 });
}

/**
 * Cache policy for sports data.
 *
 * The site is read-heavy, SEO-critical and backed by data that changes only
 * when an ingestion run completes, so pages are cached aggressively and
 * invalidated by tag rather than by waiting for a TTL.
 *
 * Tags mirror the URL hierarchy, so `revalidateTag('sport:football')` after an
 * ingestion clears every football page at once without touching cricket.
 */
const CACHE = {
  /** The sidebar. Changes when a sport launches, which is a deliberate act. */
  sports: { revalidate: 3_600, tags: ['sports'] },
  /** Entity pages. An hour is well inside how often ingestion runs. */
  entity: (sportSlug: string) => ({ revalidate: 3_600, tags: ['sports', `sport:${sportSlug}`] }),
  /** Lists carry filters, so they are cached shorter and re-fetched more often. */
  list: (sportSlug: string) => ({ revalidate: 900, tags: ['sports', `sport:${sportSlug}`] }),
};

const listEnvelope = <T extends z.ZodTypeAny>(item: T) => z.object({ data: z.array(item) });

/** Every launched sport, for the sidebar. */
export function fetchSports(): Promise<{ data: Sport[] }> {
  return apiGet('/v1/sports', listEnvelope(sportSchema), CACHE.sports);
}

/** One sport with the counts behind each tab. */
export function fetchSport(slug: string): Promise<SportDetail> {
  return apiGet(`/v1/sports/${slug}`, sportDetailSchema, CACHE.entity(slug));
}

export function fetchTeams(
  sportSlug: string,
  params: { page?: number; limit?: number; kind?: string; q?: string } = {},
): Promise<Paginated<z.infer<typeof teamSummarySchema>>> {
  return apiGet(
    `/v1/sports/${sportSlug}/teams${toQuery(params)}`,
    paginated(teamSummarySchema),
    CACHE.list(sportSlug),
  );
}

export function fetchTeam(sportSlug: string, slug: string): Promise<TeamDetail> {
  return apiGet(`/v1/sports/${sportSlug}/teams/${slug}`, teamDetailSchema, CACHE.entity(sportSlug));
}

export function fetchPlayers(
  sportSlug: string,
  params: { page?: number; limit?: number; q?: string } = {},
): Promise<Paginated<z.infer<typeof playerSummarySchema>>> {
  return apiGet(
    `/v1/sports/${sportSlug}/players${toQuery(params)}`,
    paginated(playerSummarySchema),
    CACHE.list(sportSlug),
  );
}

export function fetchPlayer(sportSlug: string, slug: string): Promise<PlayerDetail> {
  return apiGet(
    `/v1/sports/${sportSlug}/players/${slug}`,
    playerDetailSchema,
    CACHE.entity(sportSlug),
  );
}

export function fetchCompetitions(
  sportSlug: string,
  params: { page?: number; limit?: number; kind?: string; q?: string } = {},
): Promise<Paginated<z.infer<typeof competitionSummarySchema>>> {
  return apiGet(
    `/v1/sports/${sportSlug}/competitions${toQuery(params)}`,
    paginated(competitionSummarySchema),
    CACHE.list(sportSlug),
  );
}

export function fetchCompetition(sportSlug: string, slug: string): Promise<CompetitionDetail> {
  return apiGet(
    `/v1/sports/${sportSlug}/competitions/${slug}`,
    competitionDetailSchema,
    CACHE.entity(sportSlug),
  );
}

/**
 * Cross-entity search.
 *
 * Not cached at the fetch layer. Search is user input with an unbounded key
 * space, so caching it fills the cache with entries that will never be read
 * again. The API caches briefly on its own side, where the hit rate is real.
 */
export function search(
  query: string,
  params: { sport?: string; type?: string; limit?: number } = {},
): Promise<{ data: SearchResult[] }> {
  return apiGet(`/v1/search${toQuery({ q: query, ...params })}`, listEnvelope(searchResultSchema), {
    noStore: true,
    timeoutMs: 5_000,
  });
}

/** Explainers for a sport's Explainers tab. */
export function fetchExplainers(sportSlug: string): Promise<{ data: ContentSummary[] }> {
  return apiGet(
    `/v1/sports/${sportSlug}/explainers`,
    listEnvelope(contentSummarySchema),
    // Editorial content changes on publication rather than on a sync, so it is
    // cached longer than anything ingestion touches.
    { revalidate: 3_600, tags: ['content', `sport:${sportSlug}`] },
  );
}

/**
 * The explainer library landing page.
 *
 * One request for the whole page: the beginner path, the categories and the
 * search index arrive together, so the page cannot render half-populated.
 */
export function fetchExplainerLibrary(sportSlug: string): Promise<ExplainerLibrary> {
  return apiGet(`/v1/sports/${sportSlug}/explainer-library`, explainerLibrarySchema, {
    revalidate: 3_600,
    tags: ['content', 'explainers', `sport:${sportSlug}`],
  });
}

/** One explainer, by slug or by any of its aliases. */
export function fetchExplainerDetail(sportSlug: string, slug: string): Promise<ExplainerDetail> {
  return apiGet(`/v1/sports/${sportSlug}/explainers/${slug}`, explainerDetailSchema, {
    revalidate: 3_600,
    tags: ['content', 'explainers', `sport:${sportSlug}`],
  });
}

/** Every published explainer in one category, uncapped. */
export function fetchExplainerCategory(
  sportSlug: string,
  categorySlug: string,
): Promise<{ data: ExplainerSummary[] }> {
  return apiGet(
    `/v1/sports/${sportSlug}/explainer-categories/${categorySlug}`,
    listEnvelope(explainerSummarySchema),
    { revalidate: 3_600, tags: ['content', 'explainers', `sport:${sportSlug}`] },
  );
}

export function fetchExplainer(slug: string): Promise<ContentDetail> {
  return apiGet(`/v1/explainers/${slug}`, contentDetailSchema, {
    revalidate: 3_600,
    tags: ['content'],
  });
}

/**
 * Generated headline cards for the discovery panels.
 *
 * Short revalidation because the endpoint randomises: a long window would
 * freeze one set of cards in place, which is the opposite of what a discovery
 * panel is for.
 */
export function fetchHighlights(): Promise<{ data: Highlight[] }> {
  return apiGet('/v1/highlights', listEnvelope(highlightSchema), {
    revalidate: 120,
    tags: ['highlights'],
  });
}

/**
 * The encyclopedia overview: facts, prose, timeline, governance and sources.
 *
 * Cached for an hour and tagged by sport, so publishing new editorial can
 * invalidate one sport without clearing the rest.
 */
export function fetchSportOverview(slug: string): Promise<SportOverview> {
  return apiGet(`/v1/sports/${slug}/overview`, sportOverviewSchema, {
    revalidate: 3_600,
    tags: ['sports', `sport:${slug}`],
  });
}

/** Social media stories for a sport. */
export function fetchStories(sportSlug: string): Promise<{ data: ContentSummary[] }> {
  return apiGet(`/v1/sports/${sportSlug}/stories`, listEnvelope(contentSummarySchema), {
    revalidate: 3_600,
    tags: ['content', `sport:${sportSlug}`],
  });
}

/** Quizzes for a sport. */
export function fetchQuizzes(sportSlug: string): Promise<{ data: QuizSummary[] }> {
  return apiGet(`/v1/sports/${sportSlug}/quizzes`, listEnvelope(quizSummarySchema), {
    revalidate: 3_600,
    tags: ['content', `sport:${sportSlug}`],
  });
}

/** Builds a query string, dropping undefined values so they do not appear as "undefined". */
function toQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== '',
  );
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()}`;
}
