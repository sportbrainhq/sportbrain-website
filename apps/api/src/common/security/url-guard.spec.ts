import { describe, expect, it } from 'vitest';
import { guardOutboundUrl } from './url-guard';

describe('guardOutboundUrl', () => {
  it('allows an ordinary https URL', () => {
    expect(guardOutboundUrl('https://www.bbc.co.uk/sport/football/rss.xml')).toEqual({
      allowed: true,
    });
  });

  it('allows an ordinary http URL', () => {
    expect(guardOutboundUrl('http://example.com/feed')).toEqual({ allowed: true });
  });

  it('rejects a malformed URL', () => {
    const result = guardOutboundUrl('not a url');
    expect(result.allowed).toBe(false);
    expect(result).toMatchObject({ reason: 'invalid_url' });
  });

  it.each([
    'ftp://example.com/feed',
    'file:///etc/passwd',
    'gopher://example.com',
    'javascript:alert(1)',
  ])('rejects the %s scheme', (url) => {
    const result = guardOutboundUrl(url);
    expect(result.allowed).toBe(false);
    expect(result).toMatchObject({ reason: 'disallowed_protocol' });
  });

  it('rejects the localhost hostname', () => {
    expect(guardOutboundUrl('http://localhost/feed')).toMatchObject({
      allowed: false,
      reason: 'disallowed_hostname',
    });
  });

  it('rejects 127.0.0.1', () => {
    expect(guardOutboundUrl('http://127.0.0.1/feed')).toMatchObject({
      allowed: false,
      reason: 'loopback_address',
    });
  });

  it('rejects the IPv6 loopback address', () => {
    expect(guardOutboundUrl('http://[::1]/feed')).toMatchObject({
      allowed: false,
      reason: 'loopback_address',
    });
  });

  it('rejects the unspecified address', () => {
    expect(guardOutboundUrl('http://0.0.0.0/feed')).toMatchObject({
      allowed: false,
      reason: 'unspecified_address',
    });
  });

  it.each([
    'http://10.0.0.5/feed',
    'http://172.16.0.1/feed',
    'http://172.31.255.255/feed',
    'http://192.168.1.1/feed',
  ])('rejects the private address %s', (url) => {
    expect(guardOutboundUrl(url)).toMatchObject({ allowed: false, reason: 'private_address' });
  });

  it('allows a public address in the 172.x range outside the private block', () => {
    expect(guardOutboundUrl('http://172.15.0.1/feed')).toEqual({ allowed: true });
    expect(guardOutboundUrl('http://172.32.0.1/feed')).toEqual({ allowed: true });
  });

  it('rejects the link-local range', () => {
    expect(guardOutboundUrl('http://169.254.1.1/feed')).toMatchObject({
      allowed: false,
      reason: 'link_local_address',
    });
  });

  it('rejects the AWS/GCP/Azure metadata address explicitly, even though it is also link-local', () => {
    expect(guardOutboundUrl('http://169.254.169.254/latest/meta-data/')).toMatchObject({
      allowed: false,
      reason: 'cloud_metadata_address',
    });
  });

  it('rejects a multicast address', () => {
    expect(guardOutboundUrl('http://224.0.0.1/feed')).toMatchObject({
      allowed: false,
      reason: 'multicast_address',
    });
  });

  it('rejects an IPv4-mapped IPv6 address pointing at a private range', () => {
    expect(guardOutboundUrl('http://[::ffff:10.0.0.5]/feed')).toMatchObject({
      allowed: false,
      reason: 'private_address',
    });
  });

  it('rejects an IPv6 unique local address', () => {
    expect(guardOutboundUrl('http://[fd00::1]/feed')).toMatchObject({
      allowed: false,
      reason: 'private_address',
    });
  });

  it('rejects an IPv6 link-local address', () => {
    expect(guardOutboundUrl('http://[fe80::1]/feed')).toMatchObject({
      allowed: false,
      reason: 'link_local_address',
    });
  });

  it('allows a public IPv4 address', () => {
    expect(guardOutboundUrl('http://8.8.8.8/feed')).toEqual({ allowed: true });
  });

  it('allows an ordinary hostname without resolving it', () => {
    // DNS resolution and rebinding protection are the fetcher's job at
    // connection time; this layer only rejects what is unsafe from the
    // string alone. See the module doc comment.
    expect(guardOutboundUrl('https://internal.example.com/feed')).toEqual({ allowed: true });
  });
});
