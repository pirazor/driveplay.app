import Hls from 'hls.js';
import type { MediaSourceSpec } from '../data/types';
import { BaseEngine, type RenderTargets } from './engine';
import { proxyHls } from './proxyClient';

/**
 * HLS engine — drives a real <video> element via hls.js (or native HLS on
 * Safari/iOS). This is the primary path for free-to-air live TV today.
 *
 * Resilience mirrors what keeps sefirox.com playing without interruptions:
 * automatic recovery on network/media errors instead of surfacing a hard stop.
 */
export class HlsEngine extends BaseEngine {
  readonly kind = 'hls' as const;
  readonly surface = 'video' as const;
  private hls: Hls | null = null;
  private video: HTMLVideoElement | null = null;

  async load(source: MediaSourceSpec, targets: RenderTargets): Promise<void> {
    this.emit('loading');
    const video = targets.video;
    this.video = video;
    video.playsInline = true;
    const url = source.kind === 'live-tv' ? proxyHls(source.url) : source.url;

    // Native HLS (Safari / some smart-TV browsers).
    if (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      this.bindVideoEvents(video);
      return;
    }

    if (!Hls.isSupported()) {
      this.emit('error', { error: 'HLS not supported in this browser.' });
      return;
    }

    const hls = new Hls({
      // Conservative, broadly-compatible live config (lowLatencyMode breaks
      // ordinary live playlists). Generous retries keep channels resilient.
      backBufferLength: 30,
      manifestLoadingMaxRetry: 8,
      manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 8,
      fragLoadingMaxRetry: 8,
      fragLoadingRetryDelay: 1000,
    });
    this.hls = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    this.bindVideoEvents(video);

    hls.on(Hls.Events.ERROR, (_evt, data) => {
      if (!data.fatal) return;
      switch (data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          hls.recoverMediaError();
          break;
        default:
          this.emit('error', { error: data.details ?? 'Fatal HLS error' });
      }
    });
  }

  private bindVideoEvents(video: HTMLVideoElement): void {
    video.onplaying = () => this.emit('playing');
    video.onpause = () => this.emit('paused');
    video.onwaiting = () => this.emit('waiting');
    video.onended = () => this.emit('ended');
    video.ontimeupdate = () =>
      this.emit('playing', { currentTime: video.currentTime, duration: video.duration });
    video.onerror = () => this.emit('error', { error: 'Video element error' });
  }

  async play(): Promise<void> {
    await this.video?.play().catch(() => {});
  }
  pause(): void {
    this.video?.pause();
  }
  setMuted(muted: boolean): void {
    if (this.video) this.video.muted = muted;
  }
  setVolume(volume: number): void {
    if (this.video) this.video.volume = volume;
  }
  destroy(): void {
    this.hls?.destroy();
    this.hls = null;
    if (this.video) {
      this.video.removeAttribute('src');
      this.video.load();
      this.video = null;
    }
  }
}
