import {
  Input,
  UrlSource,
  ALL_FORMATS,
  CanvasSink,
  AudioBufferSink,
  type InputVideoTrack,
  type InputAudioTrack,
} from 'mediabunny';
import type { MediaSourceSpec } from '../data/types';
import { BaseEngine, type RenderTargets } from './engine';

/**
 * WebCodecs engine (mediabunny) — sefirox.com's YouTube path.
 *
 * YouTube's adaptive streams are often separate video-only and audio-only
 * tracks that the Tesla browser handles poorly through <video>/MSE. So instead
 * we demux with mediabunny, decode via WebCodecs, paint frames onto a <canvas>
 * (CanvasSink) and play audio through the Web Audio API (AudioBufferSink),
 * using the AudioContext clock as the master timeline for A/V sync.
 *
 * `Input` + `UrlSource` + `CanvasSink` + `AudioBufferSink` + `ALL_FORMATS` are
 * the exact primitives Sefirox's bundle uses.
 */
export class WebCodecsEngine extends BaseEngine {
  readonly kind = 'webcodecs' as const;
  readonly surface = 'canvas' as const;

  private disposed = false;
  private paused = false;
  private muted = false;
  private volume = 1;

  private audioCtx: AudioContext | null = null;
  private gain: GainNode | null = null;
  /** Maps media timestamp 0 → this AudioContext time. */
  private baseTime = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  async load(source: MediaSourceSpec, targets: RenderTargets): Promise<void> {
    this.emit('loading');
    this.canvas = targets.canvas;
    this.ctx = targets.canvas.getContext('2d');

    try {
      const videoInput = new Input({ source: new UrlSource(source.url), formats: ALL_FORMATS });
      // Audio may live in the same container or in a separate adaptive stream.
      const audioInput = source.audioUrl
        ? new Input({ source: new UrlSource(source.audioUrl), formats: ALL_FORMATS })
        : videoInput;

      const videoTrack = await videoInput.getPrimaryVideoTrack();
      const audioTrack = await audioInput.getPrimaryAudioTrack();
      if (!videoTrack) {
        this.emit('error', { error: 'No decodable video track.' });
        return;
      }

      this.audioCtx = new AudioContext();
      this.gain = this.audioCtx.createGain();
      this.gain.connect(this.audioCtx.destination);
      this.applyVolume();

      // Anchor the timeline a short lead ahead so the first frames have room.
      this.baseTime = this.audioCtx.currentTime + 0.2;

      void this.pumpVideo(videoTrack);
      if (audioTrack) void this.pumpAudio(audioTrack);
      this.emit('playing');
    } catch (err) {
      this.emit('error', { error: err instanceof Error ? err.message : 'WebCodecs decode failed' });
    }
  }

  /** Schedule decoded audio buffers on the Web Audio clock (master timeline). */
  private async pumpAudio(track: InputAudioTrack): Promise<void> {
    const sink = new AudioBufferSink(track);
    for await (const wrapped of sink.buffers(0)) {
      if (this.disposed) return;
      while (this.paused && !this.disposed) await sleep(60);
      const ctx = this.audioCtx;
      const gain = this.gain;
      if (!ctx || !gain) return;

      const src = ctx.createBufferSource();
      src.buffer = wrapped.buffer;
      src.connect(gain);
      const when = this.baseTime + wrapped.timestamp;
      src.start(Math.max(when, ctx.currentTime));

      // Throttle: don't decode too far ahead of the playhead.
      const lead = when - ctx.currentTime;
      if (lead > 1) await sleep((lead - 1) * 1000);
    }
  }

  /** Draw decoded frames onto the canvas, paced to the audio clock. */
  private async pumpVideo(track: InputVideoTrack): Promise<void> {
    const sink = new CanvasSink(track, { fit: 'contain' });
    for await (const frame of sink.canvases(0)) {
      if (this.disposed) return;
      while (this.paused && !this.disposed) await sleep(60);
      const ctx = this.audioCtx;
      if (!ctx || !this.ctx || !this.canvas) return;

      // Wait until this frame's presentation time arrives on the master clock.
      const target = this.baseTime + frame.timestamp;
      let wait = target - ctx.currentTime;
      while (wait > 0 && !this.disposed) {
        await sleep(Math.min(wait * 1000, 50));
        if (this.paused) continue;
        wait = target - ctx.currentTime;
      }
      if (this.disposed) return;

      const fc = frame.canvas as HTMLCanvasElement;
      if (this.canvas.width !== fc.width || this.canvas.height !== fc.height) {
        this.canvas.width = fc.width;
        this.canvas.height = fc.height;
      }
      this.ctx.drawImage(fc, 0, 0);
      this.emit('playing', { currentTime: frame.timestamp });
    }
    this.emit('ended');
  }

  private applyVolume(): void {
    if (this.gain) this.gain.gain.value = this.muted ? 0 : this.volume;
  }

  async play(): Promise<void> {
    this.paused = false;
    await this.audioCtx?.resume().catch(() => {});
  }
  pause(): void {
    this.paused = true;
    void this.audioCtx?.suspend().catch(() => {});
    this.emit('paused');
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
    this.disposed = true;
    void this.audioCtx?.close().catch(() => {});
    this.audioCtx = null;
    this.gain = null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
