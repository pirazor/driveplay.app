// Core domain types for the in-car media app.

export type MediaKind = 'live-tv' | 'youtube' | 'youtube-live';

/**
 * Which decode/transport engine should play a given source.
 *
 * Mirrors the architecture observed on sefirox.com, which uses three engines:
 *  - `hls`      : hls.js -> <video>            (Twitch / generic HLS, works today)
 *  - `jsmpeg`   : JSMpeg -> <canvas> over ws   (low-latency live TV relay)
 *  - `webcodecs`: mediabunny (WebCodecs) -> <canvas> + Web Audio (YouTube VOD)
 */
export type EngineKind = 'hls' | 'jsmpeg' | 'webcodecs' | 'native';

export interface Channel {
  id: string;
  name: string;
  group: string;
  /** Public HLS playlist for the broadcaster. */
  hlsUrl: string;
  /** Optional low-latency MPEG1-TS WebSocket relay (backend phase). */
  wsRelayUrl?: string;
  logo?: string;
  /** Accent used for the channel card gradient. */
  accent?: string;
  description?: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration?: string;
  isLive?: boolean;
}

/** A fully-resolved thing the player can play. */
export interface MediaSourceSpec {
  kind: MediaKind;
  engine: EngineKind;
  /** Primary media URL (HLS playlist, ws relay, or direct media stream). */
  url: string;
  /** Optional separate audio track URL (YouTube serves audio/video apart). */
  audioUrl?: string;
  title: string;
  subtitle?: string;
  poster?: string;
  isLive?: boolean;
}
