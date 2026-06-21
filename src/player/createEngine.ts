import type { EngineKind, MediaKind } from '../data/types';
import type { PlaybackEngine } from './engine';
import { HlsEngine } from './HlsEngine';
import { JSMpegEngine } from './JSMpegEngine';
import { WebCodecsEngine } from './WebCodecsEngine';

/**
 * Pick the right engine for a source — the dispatch sefirox.com performs:
 *   live TV  → JSMpeg (ws relay) when available, else HLS
 *   YouTube  → WebCodecs (mediabunny) when supported, else HLS/native fallback
 */
export function chooseEngine(source: { kind: MediaKind; url: string; engine?: EngineKind }): EngineKind {
  if (source.engine) return source.engine;
  if (source.kind === 'live-tv') {
    return source.url.startsWith('ws') ? 'jsmpeg' : 'hls';
  }
  if (source.kind === 'youtube' || source.kind === 'youtube-live') {
    return typeof VideoDecoder !== 'undefined' ? 'webcodecs' : 'hls';
  }
  return 'hls';
}

export function createEngine(kind: EngineKind): PlaybackEngine {
  switch (kind) {
    case 'jsmpeg':
      return new JSMpegEngine();
    case 'webcodecs':
      return new WebCodecsEngine();
    case 'hls':
    case 'native':
    default:
      return new HlsEngine();
  }
}
