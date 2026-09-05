import { z } from 'zod';

/**
 * The auth boundary.
 *
 * Google sign-in itself is a redirect flow (`GET /auth/google` →
 * Google → `GET /auth/google/callback`), so there is no request body for it
 * to validate here — the browser navigates, it never calls `fetch`. This
 * file only carries the shapes for the two endpoints that are real JSON
 * calls.
 */

export const logoutResponseSchema = z.object({
  loggedOut: z.literal(true),
});
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
