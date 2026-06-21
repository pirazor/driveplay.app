import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Pause, Play, Volume2, VolumeX, Maximize2, Loader2, AlertTriangle } from 'lucide-react';
import type { MediaSourceSpec } from '../data/types';
import type { PlaybackEngine, PlayerEvent } from './engine';
import { chooseEngine, createEngine } from './createEngine';

interface Props {
  source: MediaSourceSpec;
  onBack: () => void;
}

type Status = 'loading' | 'playing' | 'paused' | 'waiting' | 'error';

/**
 * Unified player surface. Mounts both a <video> (HLS/native) and a <canvas>
 * (JSMpeg/WebCodecs); the active engine reveals whichever it owns.
 *
 * Implements the behaviours that keep sefirox.com playing without
 * interruptions on Tesla:
 *  - one-time pointer "unlock" so the browser allows audio autoplay
 *  - resume + reconnect when the tab returns to the foreground
 */
export function MediaPlayer({ source, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);

  const [status, setStatus] = useState<Status>('loading');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number>();

  const surface = engineRef.current?.surface ?? 'video';

  // --- engine lifecycle -----------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setStatus('loading');
    setError(null);
    const kind = chooseEngine(source);
    const engine = createEngine(kind);
    engineRef.current = engine;

    const off = engine.on((evt: PlayerEvent, payload) => {
      if (evt === 'error') {
        setStatus('error');
        setError(payload?.error ?? 'Playback error');
      } else if (evt === 'playing') setStatus('playing');
      else if (evt === 'paused') setStatus('paused');
      else if (evt === 'waiting' || evt === 'loading') setStatus('waiting');
    });

    engine
      .load(source, { video, canvas })
      .then(() => engine.play())
      .catch((e) => {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Failed to load');
      });

    return () => {
      off();
      engine.destroy();
      engineRef.current = null;
    };
  }, [source]);

  // --- Tesla / autoplay gesture unlock (one-time) ---------------------------
  useEffect(() => {
    const unlock = () => {
      engineRef.current?.play();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchend', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchend', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchend', unlock);
    };
  }, []);

  // --- resume when the tab returns to the foreground ------------------------
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) engineRef.current?.play();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  // --- auto-hide controls ---------------------------------------------------
  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 3500);
  }, []);
  useEffect(() => {
    showControls();
    return () => window.clearTimeout(hideTimer.current);
  }, [showControls]);

  const togglePlay = () => {
    const e = engineRef.current;
    if (!e) return;
    if (status === 'playing') {
      e.pause();
      setStatus('paused');
    } else {
      e.play();
    }
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    engineRef.current?.setMuted(next);
  };
  const goFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
      onPointerMove={showControls}
      onClick={showControls}
    >
      {/* HLS / native surface */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ display: surface === 'video' ? 'block' : 'none' }}
        playsInline
      />
      {/* JSMpeg / WebCodecs surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ display: surface === 'canvas' ? 'block' : 'none' }}
      />

      {/* Loading / error overlays */}
      {(status === 'loading' || status === 'waiting') && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-white/80" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400" />
          <p className="max-w-md text-lg font-medium text-white">{error}</p>
          <p className="max-w-md text-sm text-white/60">
            Free-to-air streams may require the proxy backend (set VITE_MEDIA_API_BASE) to bypass
            CORS / geo-blocking.
          </p>
        </div>
      )}

      {/* Top gradient + back / title */}
      <div
        className={`absolute inset-x-0 top-0 flex items-center gap-4 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={onBack}
          className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Back"
        >
          <ArrowLeft className="h-7 w-7" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold text-white">{source.title}</h2>
          {source.subtitle && <p className="truncate text-base text-white/55">{source.subtitle}</p>}
        </div>
        {source.isLive && (
          <span className="ml-auto flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-base font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> LIVE
          </span>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={togglePlay}
          className="grid h-20 w-20 place-items-center rounded-full bg-white text-black transition hover:scale-105"
          aria-label={status === 'playing' ? 'Pause' : 'Play'}
        >
          {status === 'playing' ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 pl-0.5" />}
        </button>
        <button
          onClick={toggleMute}
          className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
        </button>
        <button
          onClick={goFullscreen}
          className="ml-auto grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
