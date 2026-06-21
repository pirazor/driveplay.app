import { Readable } from 'node:stream';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { config } from './config.js';
import { assertSafeUrl, HttpError } from './security.js';
import { installYouTubeRuntime } from './youtubeRuntime.js';

/**
 * YouTube subsystem.
 *
 *  - SEARCH: youtubei.js (InnerTube) — stable, doesn't need the player script.
 *  - RESOLVE: yt-dlp — robust to YouTube's frequent player-script changes,
 *    which youtubei.js/jintr can't keep up with. yt-dlp is invoked as a
 *    subprocess and returns the direct googlevideo stream URL(s), which we then
 *    serve back through /api/youtube/proxy.
 *  - PROXY: range-aware passthrough of the resolved googlevideo media.
 *
 * Set UPSTREAM_PROXY (http://user:pass@host:port) to make yt-dlp extract from a
 * different egress (e.g. a Turkey/residential IP) when YouTube bot-blocks the
 * server's datacenter IP.
 */

let innertubePromise = null;
async function getYouTube() {
  if (!innertubePromise) {
    installYouTubeRuntime();
    innertubePromise = import('youtubei.js').then(({ Innertube }) =>
      Innertube.create({ retrieve_player: false }),
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

/** Run yt-dlp and return stdout, rejecting with stderr text on failure. */
function ytdlp(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => reject(e));
    child.on('close', (code) =>
      code === 0 ? resolve(out) : reject(new Error(err.trim() || `yt-dlp exited ${code}`)),
    );
  });
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
  const watch = `https://www.youtube.com/watch?v=${videoId}`;

  const base = baseUrlFromReq(req);
  const proxied = (u) => `${base}/api/youtube/proxy?url=${encodeURIComponent(u)}`;

  let meta;
  try {
    const args = ['-J', '--no-warnings', '--no-playlist'];
    // Try alternate YouTube player clients — some are gated less aggressively
    // than the default `web` client (helps dodge the datacenter "not a bot" wall).
    const clients = process.env.YTDLP_CLIENTS || 'default,tv,mweb,web_safari';
    args.push('--extractor-args', `youtube:player_client=${clients}`);
    // Authenticate with a logged-in account's cookies (Netscape cookies.txt) —
    // clears YouTube's "confirm you're not a bot" wall on datacenter IPs.
    const cookiesFile = process.env.YT_COOKIES_FILE || '/app/cookies.txt';
    if (existsSync(cookiesFile)) args.push('--cookies', cookiesFile);
    if (process.env.UPSTREAM_PROXY) args.push('--proxy', process.env.UPSTREAM_PROXY);
    args.push(watch);
    meta = JSON.parse(await ytdlp(args));
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).slice(0, 240);
    // Common: "Sign in to confirm you're not a bot" from datacenter IPs.
    throw new HttpError(502, `YouTube extraction failed: ${msg}`);
  }

  if (meta.is_live) throw new HttpError(409, 'YouTube live streams are not supported yet');

  const formats = Array.isArray(meta.formats) ? meta.formats : [];
  const has = (c) => c && c !== 'none';

  // Prefer a single progressive (muxed) stream — simplest for the WebCodecs
  // engine. itag 18 (360p mp4) is almost always present; 22 (720p) sometimes.
  const progressive = formats
    .filter((f) => f.url && has(f.vcodec) && has(f.acodec))
    .sort(
      (a, b) =>
        (b.ext === 'mp4' ? 1 : 0) - (a.ext === 'mp4' ? 1 : 0) ||
        (b.height || 0) - (a.height || 0) ||
        (b.tbr || 0) - (a.tbr || 0),
    );

  let videoUrl;
  let audioUrl;
  if (progressive.length) {
    videoUrl = proxied(progressive[0].url);
  } else {
    // Adaptive fallback: separate video-only + audio-only (WebCodecs plays both).
    const videoOnly = formats
      .filter((f) => f.url && has(f.vcodec) && !has(f.acodec))
      .sort(
        (a, b) =>
          (a.vcodec?.startsWith('avc') ? 1 : 0) - (b.vcodec?.startsWith('avc') ? 1 : 0) === 0
            ? (b.height || 0) - (a.height || 0)
            : (b.vcodec?.startsWith('avc') ? 1 : 0) - (a.vcodec?.startsWith('avc') ? 1 : 0),
      );
    const audioOnly = formats
      .filter((f) => f.url && has(f.acodec) && !has(f.vcodec))
      .sort(
        (a, b) =>
          (b.ext === 'm4a' ? 1 : 0) - (a.ext === 'm4a' ? 1 : 0) || (b.abr || 0) - (a.abr || 0),
      );
    if (!videoOnly.length || !audioOnly.length) {
      throw new HttpError(502, 'No playable YouTube formats found');
    }
    videoUrl = proxied(videoOnly[0].url);
    audioUrl = proxied(audioOnly[0].url);
  }

  res.json({
    videoUrl,
    audioUrl,
    title: meta.title ?? 'Video',
    channel: meta.uploader ?? meta.channel ?? '',
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
