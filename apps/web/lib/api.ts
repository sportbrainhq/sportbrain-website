import {
  errorResponseSchema,
  healthResponseSchema,
  type HealthResponse,
} from '@sportbrain/contracts';
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
// Only platform endpoints exist. Domain calls are added as domains ship.

/**
 * Fetches API health.
 *
 * Never cached: a cached health check reports the past, which defeats its
 * purpose.
 */
export function fetchHealth(): Promise<HealthResponse> {
  return apiGet('/health', healthResponseSchema, { noStore: true, timeoutMs: 3_000 });
}
