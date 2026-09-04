import { isIP } from 'node:net';

/**
 * SSRF guard for URLs the API is about to fetch on the server's behalf.
 *
 * The News Engine's fetcher (a later phase) will call this before issuing any
 * request to a feed URL. Written now, ahead of the fetcher, because a feed
 * URL is operator-entered data (`news_sources.feedUrl`) that this service
 * will make outbound HTTP requests to, which is exactly the shape of request
 * that turns into an internal-network probe or a cloud metadata credential
 * leak if a malicious or compromised URL is accepted uncritically.
 *
 * This only validates a URL string. It intentionally does not resolve DNS and
 * check the resolved address is safe *at request time*, which is the
 * stronger guarantee a real fetcher needs (a hostname can resolve to a public
 * IP during this check and a private one when the HTTP client actually
 * connects — DNS rebinding). That belongs in the fetcher itself, which
 * controls the connection and can re-validate on the socket it actually
 * opens; this module is the shared, testable predicate both that check and
 * this Phase 1 validation are built from.
 */

export type UrlGuardFailureReason =
  | 'invalid_url'
  | 'disallowed_protocol'
  | 'loopback_address'
  | 'private_address'
  | 'link_local_address'
  | 'cloud_metadata_address'
  | 'unspecified_address'
  | 'multicast_address'
  | 'disallowed_hostname';

export type UrlGuardResult =
  { allowed: true } | { allowed: false; reason: UrlGuardFailureReason; detail: string };

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Hostnames that never resolve safely regardless of what DNS says today.
 * `localhost` is included because Node's own DNS resolution can hand it back
 * as ::1 or 127.0.0.1 depending on platform, and it costs nothing to reject
 * the name outright rather than trust that resolution.
 */
const DISALLOWED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

/** AWS/GCP/Azure/DigitalOcean instance-metadata address. The single highest-value SSRF target. */
const CLOUD_METADATA_ADDRESSES = new Set(['169.254.169.254', 'fd00:ec2::254']);

/**
 * Validates that a URL is safe for the API to fetch server-side.
 *
 * Checks, in order: the string parses as a URL; the protocol is http or
 * https; the hostname is not a name or literal address that resolves inside
 * the loopback, private, link-local, unspecified, multicast, or cloud
 * metadata ranges.
 */
export function guardOutboundUrl(candidate: string): UrlGuardResult {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { allowed: false, reason: 'invalid_url', detail: `"${candidate}" is not a valid URL` };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return {
      allowed: false,
      reason: 'disallowed_protocol',
      detail: `protocol "${url.protocol}" is not http: or https:`,
    };
  }

  // Strip brackets from an IPv6 literal host (`[::1]` -> `::1`) before either
  // the hostname check or the IP-literal check below.
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const lowerHostname = hostname.toLowerCase();

  if (DISALLOWED_HOSTNAMES.has(lowerHostname)) {
    return {
      allowed: false,
      reason: 'disallowed_hostname',
      detail: `hostname "${hostname}" is never permitted`,
    };
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4 || ipVersion === 6) {
    return guardIpLiteral(hostname, ipVersion);
  }

  // A non-literal hostname (a real domain name) is allowed at this layer.
  // Whether the name resolves to a private address is a DNS-rebinding
  // concern the fetcher must re-check at connection time; see the module
  // doc comment.
  return { allowed: true };
}

function guardIpLiteral(address: string, version: 4 | 6): UrlGuardResult {
  if (CLOUD_METADATA_ADDRESSES.has(address)) {
    return {
      allowed: false,
      reason: 'cloud_metadata_address',
      detail: `"${address}" is a cloud metadata endpoint`,
    };
  }

  return version === 4 ? guardIpv4Literal(address) : guardIpv6Literal(address);
}

function guardIpv4Literal(address: string): UrlGuardResult {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return {
      allowed: false,
      reason: 'invalid_url',
      detail: `"${address}" is not a valid IPv4 address`,
    };
  }
  const [a, b] = octets as [number, number, number, number];

  if (a === 127) {
    return {
      allowed: false,
      reason: 'loopback_address',
      detail: `"${address}" is a loopback address`,
    };
  }
  if (a === 0) {
    return {
      allowed: false,
      reason: 'unspecified_address',
      detail: `"${address}" is the unspecified address`,
    };
  }
  if (a === 169 && b === 254) {
    return {
      allowed: false,
      reason: 'link_local_address',
      detail: `"${address}" is a link-local address`,
    };
  }
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
    return {
      allowed: false,
      reason: 'private_address',
      detail: `"${address}" is a private address`,
    };
  }
  if (a >= 224 && a <= 239) {
    return {
      allowed: false,
      reason: 'multicast_address',
      detail: `"${address}" is a multicast address`,
    };
  }

  return { allowed: true };
}

function guardIpv6Literal(address: string): UrlGuardResult {
  const normalised = address.toLowerCase();

  if (normalised === '::1') {
    return {
      allowed: false,
      reason: 'loopback_address',
      detail: `"${address}" is a loopback address`,
    };
  }
  if (normalised === '::' || normalised === '0:0:0:0:0:0:0:0') {
    return {
      allowed: false,
      reason: 'unspecified_address',
      detail: `"${address}" is the unspecified address`,
    };
  }
  // Unique local addresses (fc00::/7) and link-local (fe80::/10): the private
  // and internal-only ranges for IPv6.
  if (normalised.startsWith('fc') || normalised.startsWith('fd')) {
    return {
      allowed: false,
      reason: 'private_address',
      detail: `"${address}" is a unique local address`,
    };
  }
  if (
    normalised.startsWith('fe8') ||
    normalised.startsWith('fe9') ||
    normalised.startsWith('fea') ||
    normalised.startsWith('feb')
  ) {
    return {
      allowed: false,
      reason: 'link_local_address',
      detail: `"${address}" is a link-local address`,
    };
  }
  // ::ffff:a.b.c.d — an IPv4-mapped IPv6 address. Re-run the IPv4 rules
  // against the embedded address so an SSRF attempt cannot bypass the IPv4
  // checks by wrapping the same address in this form. The WHATWG URL parser
  // normalises the embedded address into two hex groups (`::ffff:a00:5`
  // rather than `::ffff:10.0.0.5`), so both the dotted-decimal and the hex
  // group forms are matched here.
  const mappedDotted = normalised.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted) {
    return guardIpv4Literal(mappedDotted[1]!);
  }
  const mappedHex = normalised.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const high = parseInt(mappedHex[1]!, 16);
    const low = parseInt(mappedHex[2]!, 16);
    const octets = [high >> 8, high & 0xff, low >> 8, low & 0xff];
    return guardIpv4Literal(octets.join('.'));
  }

  return { allowed: true };
}
