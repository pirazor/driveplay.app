/**
 * Client for the media proxy / extraction backend.
 *
 * This encodes the exact request contract observed on sefirox.com so the
 * backend phase is a drop-in. When `VITE_MEDIA_API_BASE` is unset we fall back
 * to playing public streams directly (works for free-to-air HLS that allows
 * cross-origin playback); when it is set, every request is routed through the
 * proxy to defeat CORS, geo-blocking and datacenter-IP bans.
 */
function resolveApiBase(): string {
  // Runtime override (set in the browser console, no rebuild needed) wins,
  // then the build-time env var.
  let runtime = '';
  try {
    runtime = localStorage.getItem('mediaApiBase') ?? '';
  } catch {
    /* localStorage unavailable */
  }
  return (runtime || import.meta.env.VITE_MEDIA_API_BASE || '').replace(/\/$/, '');
}

const API_BASE = resolveApiBase();

export const proxyEnabled = API_BASE.length > 0;

/**
 * Live TV / IPTV HLS playlist proxy.
 * Sefirox: `/api/track/proxy?url=<m3u8>&rewrite_m3u8=1`
 * `rewrite_m3u8=1` makes the backend rewrite segment URLs back through itself.
 */
export function proxyHls(url: string, opts: { via?: string } = {}): string {
  if (!proxyEnabled) return url;
  const via = opts.via && opts.via !== 'local' ? `&via=${encodeURIComponent(opts.via)}` : '';
  return `${API_BASE}/api/track/proxy?url=${encodeURIComponent(url)}&rewrite_m3u8=1${via}`;
}

/**
 * YouTube media-stream proxy.
 * Sefirox: `/api/youtube/proxy?url=<googlevideo-url>&via=<region>`
 */
export function proxyYouTube(url: string, via?: string): string {
  if (!proxyEnabled) return url;
  const region = via && via !== 'local' ? `&via=${encodeURIComponent(via)}` : '';
  return `${API_BASE}/api/youtube/proxy?url=${encodeURIComponent(url)}${region}`;
}

export interface ResolvedYouTube {
  /** Direct (proxied) progressive or video-only stream URL. */
  videoUrl: string;
  /** Separate audio stream when YouTube serves adaptive video/audio apart. */
  audioUrl?: string;
  title: string;
  channel: string;
  isLive?: boolean;
}

/**
 * Resolve a YouTube watch URL to playable stream URLs via the backend
 * (server-side extraction, like Sefirox's `/api/youtube/proxy`). Throws when no
 * backend is configured — the UI surfaces this as "needs backend".
 */
export async function resolveYouTube(watchUrl: string, via?: string): Promise<ResolvedYouTube> {
  if (!proxyEnabled) {
    throw new Error('YouTube playback requires the media backend (set VITE_MEDIA_API_BASE).');
  }
  const region = via ? `&via=${encodeURIComponent(via)}` : '';
  const res = await fetch(
    `${API_BASE}/api/youtube/resolve?url=${encodeURIComponent(watchUrl)}${region}`,
    { keepalive: true },
  );
  if (!res.ok) throw new Error(`Resolve failed: ${res.status}`);
  return (await res.json()) as ResolvedYouTube;
}

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
  isLive?: boolean;
}

/** Sefirox: `/api/youtube/search?q=...` (results cached client-side). */
export async function searchYouTube(query: string, limit = 24): Promise<YouTubeSearchResult[]> {
  if (!proxyEnabled) {
    throw new Error('YouTube search requires the media backend (set VITE_MEDIA_API_BASE).');
  }
  const res = await fetch(
    `${API_BASE}/api/youtube/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return (data.results ?? data ?? []) as YouTubeSearchResult[];
}
