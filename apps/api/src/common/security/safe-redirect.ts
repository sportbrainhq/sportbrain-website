/**
 * Open-redirect guard for the one place this API redirects a browser
 * somewhere caller-influenced: the post-login `next` (and modal-resume
 * `resume`) query params on `/auth/google` and its callback.
 *
 * A `next` value is attacker-controllable (it's a query param on a link
 * anyone can send), so it must never be followed unless it stays on the
 * configured frontend origin — otherwise a phished login link can look like
 * `sportbrainhq.com/auth/google?next=...` and land the victim, cookie and
 * all, on an attacker's page after a real, successful login.
 */
export function resolveSafeRedirect(candidate: string | undefined, frontendUrl: string): string {
  const fallback = frontendUrl;
  if (!candidate) return fallback;

  // A bare path (`/profile`) is the common case and always safe: it can only
  // resolve relative to the frontend origin. Reject anything that parses as
  // an absolute URL to a different origin, and anything protocol-relative
  // (`//evil.com`) which a naive relative-path check would let through.
  if (candidate.startsWith('//')) return fallback;
  if (!candidate.startsWith('/')) return fallback;

  try {
    const resolved = new URL(candidate, frontendUrl);
    const allowedOrigin = new URL(frontendUrl).origin;
    return resolved.origin === allowedOrigin ? resolved.toString() : fallback;
  } catch {
    return fallback;
  }
}
