import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MediaSourceSpec } from '../data/types';

interface PlayerState {
  current: MediaSourceSpec | null;
  play: (source: MediaSourceSpec) => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<MediaSourceSpec | null>(null);
  const play = useCallback((source: MediaSourceSpec) => setCurrent(source), []);
  const stop = useCallback(() => setCurrent(null), []);
  return (
    <PlayerContext.Provider value={{ current, play, stop }}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
