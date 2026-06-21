import { Readable } from 'node:stream';
import { config } from './config.js';
import { assertSafeUrl, HttpError } from './security.js';
import { installYouTubeRuntime } from './youtubeRuntime.js';

/**
 * YouTube subsystem — search + stream resolution via the youtubei.js
 * (InnerTube) library, plus a media proxy for the resolved googlevideo URLs.
 *
 * This is the "third-party library" path: youtubei.js handles signature
 * deciphering and stream selection. YouTube changes often, so treat this as
 * best-effort — the Live TV proxy is the load-bearing part of this service.
 */

let innertubePromise = null;
async function getYouTube() {
  if (!innertubePromise) {
    installYouTubeRuntime();
    innertubePromise = import('youtubei.js').then(({ Innertube }) =>
      Innertube.create({ retrieve_player: true }),
    );
  }
  return innertubePromise;
}

function videoIdFromInput(input) {
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

function baseUrlFromReq(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

/** GET /api/youtube/search?q=...&limit=... */
export async function handleSearch(req, res) {
  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(Number(req.query.limit) || 24, 50);
  if (!q) throw new HttpError(400, 'Missing q');

  const yt = await getYouTube();
  const search = await yt.search(q, { type: 'video' });
  const results = (search.results ?? [])
    .filter((n) => n.id && (n.type === 'Video' || n.type === 'ReelItem'))
    .slice(0, limit)
    .map((n) => ({
      videoId: n.id,
      title: n.title?.text ?? n.title?.toString?.() ?? 'Untitled',
      channel: n.author?.name ?? '',
      thumbnail: n.thumbnails?.[0]?.url ?? n.thumbnail?.[0]?.url ?? '',
      duration: n.duration?.text,
      isLive: Boolean(n.is_live),
    }));

  res.json({ results });
}

/** GET /api/youtube/resolve?url=<watch url or id> */
export async function handleResolve(req, res) {
  const input = String(req.query.url ?? '');
  const videoId = videoIdFromInput(input);
  if (!videoId) throw new HttpError(400, 'Invalid video id/url');

  const yt = await getYouTube();
  const info = await yt.getInfo(videoId);

  if (info.basic_info?.is_live) {
    // Live YouTube (DASH/HLS) isn't wired through the WebCodecs engine yet.
    throw new HttpError(409, 'YouTube live streams are not supported yet');
  }

  const base = baseUrlFromReq(req);
  const proxied = (u) => `${base}/api/youtube/proxy?url=${encodeURIComponent(u)}`;

  // decipher() resolves the (possibly signature-protected) stream URL.
  const decipher = async (format) => await format.decipher(yt.session.player);

  // Prefer a single muxed stream (one URL, both tracks); fall back to adaptive
  // video-only + audio-only, which the WebCodecs engine plays together.
  let videoUrl;
  let audioUrl;
  try {
    try {
      const muxed = info.chooseFormat({ type: 'video+audio', quality: 'best' });
      videoUrl = proxied(await decipher(muxed));
    } catch {
      const v = info.chooseFormat({ type: 'video', quality: 'best' });
      const a = info.chooseFormat({ type: 'audio', quality: 'best' });
      videoUrl = proxied(await decipher(v));
      audioUrl = proxied(await decipher(a));
    }
  } catch {
    // Signature deciphering depends on YouTube's player script, which changes
    // often and can outpace the interpreter. Surface a clean, honest error.
    throw new HttpError(
      502,
      'YouTube stream extraction failed (player script changed). Search works; playback needs a youtubei.js/jintr update.',
    );
  }

  res.json({
    videoUrl,
    audioUrl,
    title: info.basic_info?.title ?? 'Video',
    channel: info.basic_info?.author ?? '',
    isLive: false,
  });
}

/** GET /api/youtube/proxy?url=<googlevideo url> — stream media with range support. */
export async function handleMediaProxy(req, res) {
  const raw = String(req.query.url ?? '');
  const target = await assertSafeUrl(raw);
  if (!/(\.googlevideo\.com|\.youtube\.com)$/i.test(target.hostname)) {
    throw new HttpError(403, 'Only googlevideo/youtube hosts allowed');
  }

  const headers = { 'User-Agent': config.upstreamUserAgent };
  if (req.headers.range) headers.Range = req.headers.range;

  const upstream = await fetch(target.toString(), { headers, redirect: 'follow' });
  res.status(upstream.status);
  for (const h of ['content-type', 'content-length', 'accept-ranges', 'content-range']) {
    const v = upstream.headers.get(h);
    if (v) res.set(h, v);
  }
  if (upstream.body) Readable.fromWeb(upstream.body).pipe(res);
  else res.end();
}
