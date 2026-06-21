import type { EngineKind, MediaSourceSpec } from '../data/types';

export type PlayerEvent =
  | 'loading'
  | 'playing'
  | 'paused'
  | 'waiting'
  | 'ended'
  | 'error';

export interface PlayerEventPayload {
  error?: string;
  /** Current time in seconds (VOD only). */
  currentTime?: number;
  duration?: number;
}

export type PlayerListener = (event: PlayerEvent, payload?: PlayerEventPayload) => void;

/**
 * A render surface the engine draws into. Engines either drive a <video>
 * element (HLS / native) or a <canvas> (JSMpeg / WebCodecs). Both are mounted;
 * the engine shows whichever it owns and hides the other.
 */
export interface RenderTargets {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

/**
 * Common surface every playback engine implements, so the React layer never
 * has to know whether it's talking to hls.js, JSMpeg or mediabunny/WebCodecs.
 */
export interface PlaybackEngine {
  readonly kind: EngineKind;
  /** Whichever element this engine paints into — used to toggle visibility. */
  readonly surface: 'video' | 'canvas';
  load(source: MediaSourceSpec, targets: RenderTargets): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  destroy(): void;
  on(listener: PlayerListener): () => void;
}

/** Small base that manages the listener set for concrete engines. */
export abstract class BaseEngine implements PlaybackEngine {
  abstract readonly kind: EngineKind;
  abstract readonly surface: 'video' | 'canvas';
  private listeners = new Set<PlayerListener>();

  abstract load(source: MediaSourceSpec, targets: RenderTargets): Promise<void>;
  abstract play(): Promise<void>;
  abstract pause(): void;
  abstract setMuted(muted: boolean): void;
  abstract setVolume(volume: number): void;
  abstract destroy(): void;

  on(listener: PlayerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  protected emit(event: PlayerEvent, payload?: PlayerEventPayload): void {
    this.listeners.forEach((l) => l(event, payload));
  }
}
