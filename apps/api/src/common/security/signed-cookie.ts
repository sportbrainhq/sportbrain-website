import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * HMAC signing for cookie values, so a tampered session id is rejected
 * before it ever reaches the database.
 *
 * The cookie carries `<value>.<signature>`, never a JWT: the value itself
 * (a session id) is meaningless without the corresponding database row, so
 * there is nothing to encode or encrypt here, only to authenticate. Mirrors
 * the `timingSafeEqual` comparison already used in
 * `common/guards/internal-api-key.guard.ts`, for the same reason: a
 * naive `===` on a signature leaks timing information an attacker can use to
 * forge one byte at a time.
 */

export function signCookieValue(value: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(value).digest('base64url');
  return `${value}.${signature}`;
}

export function verifySignedCookieValue(signed: string, secret: string): string | null {
  const separatorIndex = signed.lastIndexOf('.');
  if (separatorIndex === -1) return null;

  const value = signed.slice(0, separatorIndex);
  const signature = signed.slice(separatorIndex + 1);
  const expectedSignature = createHmac('sha256', secret).update(value).digest('base64url');

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  return value;
}
