import { z } from 'zod';

/**
 * Every non-2xx API response has this shape, without exception.
 *
 * A single envelope means the web app has one error path to handle rather
 * than one per endpoint, and it keeps internal details (stack traces, driver
 * messages) from leaking: the API maps unrecognised failures to a generic
 * INTERNAL code before serialising.
 */
export const errorResponseSchema = z.object({
  error: z.object({
    /** Stable, machine-readable. Clients branch on this, never on `message`. */
    code: z.string(),
    /** Human-readable and safe to display. Never contains internals. */
    message: z.string(),
    /** Field-level detail, set by the validation pipe on 400 responses. */
    details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
    /** Correlation id, echoed from the x-request-id header. */
    requestId: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Error codes the platform emits today.
 *
 * Domain-specific codes get added here as domains arrive, so that the set of
 * things a client must handle is enumerable in one place.
 */
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
