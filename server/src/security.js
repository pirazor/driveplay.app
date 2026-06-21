import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * SSRF protection. The proxy fetches arbitrary URLs on behalf of the browser,
 * so we must refuse anything that could reach internal infrastructure:
 *  - only http(s)
 *  - never a hostname that resolves to a private / loopback / link-local IP
 */

function ipv4ToParts(ip) {
  return ip.split('.').map((n) => parseInt(n, 10));
}

/** True for private, loopback, link-local, CGNAT and other non-public ranges. */
export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ipv4ToParts(ip);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
    if (a === 192 && b === 168) return true; // 192.168/16
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
    if (a === 192 && b === 0) return true; // 192.0.0/24 (special)
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fe80')) return true; // link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA fc00::/7
    // IPv4-mapped (::ffff:a.b.c.d)
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    return false;
  }
  return true; // unknown format — refuse
}

/**
 * Validate and parse a target URL, rejecting non-http(s) schemes and any host
 * that resolves to a non-public address. Returns the parsed URL.
 * @param {string} raw
 */
export async function assertSafeUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new HttpError(400, 'Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HttpError(400, 'Only http(s) URLs are allowed');
  }

  const host = url.hostname;
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new HttpError(403, 'Blocked host');
    return url;
  }

  let addrs;
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new HttpError(502, 'DNS resolution failed');
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new HttpError(403, 'Blocked host');
  }
  return url;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
