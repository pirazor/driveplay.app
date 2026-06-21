import { Readable } from 'node:stream';
import { config } from './config.js';
import { assertSafeUrl, HttpError } from './security.js';

/**
 * HLS / live-TV proxy. Mirrors sefirox.com's `/api/track/proxy`:
 *   GET /api/track/proxy?url=<m3u8 or segment>&rewrite_m3u8=1
 *
 * - For playlists (`rewrite_m3u8=1`): fetch, then rewrite every variant /
 *   segment / key URI to point back through this proxy. This is what defeats
 *   CORS and lets every channel play in the browser, not just CORS-enabled CDNs.
 * - For segments / keys: stream the bytes through with range support.
 */

const looksLikePlaylist = (u) => /\.m3u8(\?|$)/i.test(u);

function proxify(absUrl) {
  const base = `/api/track/proxy?url=${encodeURIComponent(absUrl)}`;
  return looksLikePlaylist(absUrl) ? `${base}&rewrite_m3u8=1` : base;
}

/**
 * Rewrite playlist URIs (relative or absolute) to proxied, root-relative URLs.
 * hls.js resolves these against the playlist URL, which is already on this
 * proxy's origin — so nested playlists and segments all route back here.
 */
export function rewritePlaylist(text, baseUrl) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      if (line === '') return line;
      if (line.startsWith('#')) {
        // Rewrite URI="..." attributes (EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP, …).
        return line.replace(/URI="([^"]+)"/g, (_m, uri) => {
          const abs = new URL(uri, baseUrl).toString();
          return `URI="${proxify(abs)}"`;
        });
      }
      // A resource line (variant playlist or media segment).
      const abs = new URL(line, baseUrl).toString();
      return proxify(abs);
    })
    .join('\n');
}

function isPlaylistResponse(url, contentType) {
  if (looksLikePlaylist(url)) return true;
  return /mpegurl|vnd\.apple\.mpegurl/i.test(contentType ?? '');
}

export async function handleHlsProxy(req, res) {
  const raw = req.query.url;
  if (typeof raw !== 'string' || !raw) throw new HttpError(400, 'Missing url');
  const target = await assertSafeUrl(raw);

  const headers = { 'User-Agent': config.upstreamUserAgent, Accept: '*/*' };
  if (req.headers.range) headers.Range = req.headers.range;

  const upstream = await fetch(target.toString(), { headers, redirect: 'follow' });

  const contentType = upstream.headers.get('content-type') ?? '';
  const wantsRewrite = req.query.rewrite_m3u8 === '1';

  if (wantsRewrite && isPlaylistResponse(target.toString(), contentType)) {
    const text = await upstream.text();
    // Resolve relatives against the *final* URL after redirects.
    const baseUrl = upstream.url || target.toString();
    res.status(upstream.status);
    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.set('Cache-Control', `public, max-age=${config.playlistCacheSeconds}`);
    res.send(rewritePlaylist(text, baseUrl));
    return;
  }

  // Binary passthrough (segments, keys, init maps).
  res.status(upstream.status);
  for (const h of ['content-type', 'content-length', 'accept-ranges', 'content-range']) {
    const v = upstream.headers.get(h);
    if (v) res.set(h, v);
  }
  res.set('Cache-Control', 'public, max-age=15');
  if (upstream.body) {
    Readable.fromWeb(upstream.body).pipe(res);
  } else {
    res.end();
  }
}
