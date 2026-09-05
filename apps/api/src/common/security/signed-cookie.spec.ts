import { describe, expect, it } from 'vitest';
import { signCookieValue, verifySignedCookieValue } from './signed-cookie';

describe('signed cookie values', () => {
  const secret = 'a'.repeat(32);

  it('round-trips a signed value', () => {
    const signed = signCookieValue('session-id-123', secret);
    expect(verifySignedCookieValue(signed, secret)).toBe('session-id-123');
  });

  it('rejects a tampered value', () => {
    const signed = signCookieValue('session-id-123', secret);
    const tampered = signed.replace('session-id-123', 'session-id-999');
    expect(verifySignedCookieValue(tampered, secret)).toBeNull();
  });

  it('rejects a tampered signature', () => {
    const signed = signCookieValue('session-id-123', secret);
    const [value] = signed.split('.');
    expect(verifySignedCookieValue(`${value}.wrongsignature`, secret)).toBeNull();
  });

  it('rejects a value signed with a different secret', () => {
    const signed = signCookieValue('session-id-123', secret);
    expect(verifySignedCookieValue(signed, 'b'.repeat(32))).toBeNull();
  });

  it('rejects a value with no signature separator', () => {
    expect(verifySignedCookieValue('not-a-signed-value', secret)).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(verifySignedCookieValue('', secret)).toBeNull();
  });
});
