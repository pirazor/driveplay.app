import { useEffect, useRef, useState } from 'react';

export interface VehicleMotion {
  /** Speed in km/h, or null when unknown / permission denied. */
  speedKmh: number | null;
  /** True once speed crosses the motion threshold. */
  inMotion: boolean;
  /** Geolocation availability / permission state. */
  available: boolean;
}

/**
 * Reads vehicle speed from the browser Geolocation API (`coords.speed`, m/s).
 *
 * This is the one hard motion signal a web app can actually obtain in a Tesla,
 * and it's the foundation for the upcoming guardrails (pause / audio-only while
 * moving). For now it only *observes* — it doesn't gate playback yet.
 */
export function useVehicleMotion(thresholdKmh = 8): VehicleMotion {
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [available, setAvailable] = useState(false);
  const watchId = useRef<number>();

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setAvailable(false);
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setAvailable(true);
        const mps = pos.coords.speed; // metres/second, may be null
        setSpeedKmh(mps != null && !Number.isNaN(mps) ? Math.max(0, mps * 3.6) : null);
      },
      () => setAvailable(false),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return {
    speedKmh,
    available,
    inMotion: speedKmh != null && speedKmh > thresholdKmh,
  };
}
