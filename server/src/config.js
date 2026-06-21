// Centralised configuration from environment variables.

export const config = {
  port: Number(process.env.PORT) || 8787,

  /**
   * Allowed CORS origins for browser requests to this proxy.
   * Comma-separated list, or "*" to allow any (default — the proxy serves
   * public media and carries no credentials).
   */
  corsOrigins: (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  /** Browser-like UA used for upstream fetches (some CDNs reject odd UAs). */
  upstreamUserAgent:
    process.env.UPSTREAM_USER_AGENT ??
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',

  /** Cache-Control (seconds) applied to proxied HLS playlists. */
  playlistCacheSeconds: Number(process.env.PLAYLIST_CACHE_SECONDS) || 2,

  /** Toggle the YouTube subsystem (search/resolve/proxy). */
  youtubeEnabled: (process.env.YOUTUBE_ENABLED ?? 'true') !== 'false',
};
