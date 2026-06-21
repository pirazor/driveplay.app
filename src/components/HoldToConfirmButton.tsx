import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  onConfirmed: () => void;
  /** Hold duration in ms. */
  duration?: number;
  label?: string;
  holdingLabel?: string;
}

/**
 * Press-and-hold confirmation. Requires a deliberate sustained touch (default
 * 2.5s) so it can't be dismissed by a reflexive tap — the friction is the
 * point. A progress ring fills as the user holds.
 */
export function HoldToConfirmButton({
  onConfirmed,
  duration = 2500,
  label = 'Onaylamak için basılı tutun',
  holdingLabel = 'Basılı tutmaya devam edin…',
}: Props) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);
  const doneRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    if (!doneRef.current) setProgress(0);
  }, []);

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const p = Math.min(1, elapsed / duration);
    setProgress(p);
    if (p >= 1) {
      doneRef.current = true;
      setHolding(false);
      onConfirmed();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, onConfirmed]);

  const start = useCallback(() => {
    if (doneRef.current) return;
    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => stop(), [stop]);

  const size = 280;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <button
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="group relative inline-flex select-none items-center justify-center"
      style={{ width: size, height: 64 }}
    >
      {/* progress ring drawn as a pill outline */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span
          className="absolute inset-0 origin-left bg-cyan-400/90 transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
      </span>
      <span
        className={`relative z-10 w-full rounded-full px-8 py-4 text-center text-lg font-semibold transition-colors ${
          progress > 0.05 ? 'text-black' : 'text-white'
        }`}
      >
        {holding ? holdingLabel : label}
      </span>
      <span
        className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-cyan-400/60"
        aria-hidden
      />
      <svg width="0" height="0" className="hidden">
        <circle r={r} strokeDasharray={circ} />
      </svg>
    </button>
  );
}
