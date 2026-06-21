import type { MediaSourceSpec } from '../data/types';
import { BaseEngine, type RenderTargets } from './engine';

/**
 * JSMpeg engine — software MPEG1/MP2 decode straight to a <canvas>, fed by a
 * WebSocket relay (`wss://host/stream`). This is sefirox.com's low-latency
 * live-TV path: a server runs ffmpeg to transcode the source into MPEG1-TS and
 * pushes it frame-by-frame over the socket, so there's no HLS segment buffering
 * latency. It also avoids the Tesla browser's native <video> pipeline entirely.
 *
 * JSMpeg ships as a UMD bundle (not a clean ESM), so — like Sefirox — we load
 * it from a CDN on demand rather than bundling it.
 */
const JSMPEG_CDN = 'https://cdn.jsdelivr.net/npm/jsmpeg-player@3.0.3/build/jsmpeg-player.min.js';

interface JSMpegPlayer {
  play(): void;
  pause(): void;
  destroy(): void;
  volume: number;
}

declare global {
  interface Window {
    JSMpeg?: {
      Player: new (url: string, opts: Record<string, unknown>) => JSMpegPlayer;
    };
  }
}

let loaderPromise: Promise<void> | null = null;
function loadJSMpeg(): Promise<void> {
  if (window.JSMpeg) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = JSMPEG_CDN;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load JSMpeg'));
    document.head.appendChild(s);
  });
  return loaderPromise;
}

export class JSMpegEngine extends BaseEngine {
  readonly kind = 'jsmpeg' as const;
  readonly surface = 'canvas' as const;
  private player: JSMpegPlayer | null = null;
  private muted = false;
  private volume = 1;

  async load(source: MediaSourceSpec, targets: RenderTargets): Promise<void> {
    this.emit('loading');
    if (!source.url.startsWith('ws')) {
      this.emit('error', {
        error: 'JSMpeg engine requires a WebSocket relay (wss://…/stream).',
      });
      return;
    }
    await loadJSMpeg();
    if (!window.JSMpeg) {
      this.emit('error', { error: 'JSMpeg unavailable.' });
      return;
    }
    this.player = new window.JSMpeg.Player(source.url, {
      canvas: targets.canvas,
      autoplay: true,
      audio: true,
      videoBufferSize: 512 * 1024,
      onPlay: () => this.emit('playing'),
      onStalled: () => this.emit('waiting'),
      onSourceEstablished: () => this.emit('playing'),
    });
    this.applyVolume();
  }

  private applyVolume(): void {
    if (this.player) this.player.volume = this.muted ? 0 : this.volume;
  }

  async play(): Promise<void> {
    this.player?.play();
  }
  pause(): void {
    this.player?.pause();
  }
  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyVolume();
  }
  setVolume(volume: number): void {
    this.volume = volume;
    this.applyVolume();
  }
  destroy(): void {
    this.player?.destroy();
    this.player = null;
  }
}
