import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './state/PlayerContext';
import { CarShell } from './components/CarShell';
import { HomeScreen } from './pages/HomeScreen';
import { LiveTvScreen } from './pages/LiveTvScreen';
import { YouTubeScreen } from './pages/YouTubeScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { MediaPlayer } from './player/MediaPlayer';

/**
 * DrivePlay — in-car media app. Live TV + YouTube for passengers, mounted at
 * the domain root.
 *
 * Safety guardrails (passenger confirmation, motion gating) are intentionally
 * deferred — they land after the UI is tested and optimized.
 */
export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route element={<CarShell />}>
            <Route index element={<HomeScreen />} />
            <Route path="live" element={<LiveTvScreen />} />
            <Route path="youtube" element={<YouTubeScreen />} />
            <Route path="settings" element={<SettingsScreen />} />
          </Route>
        </Routes>
        <PlayerOverlay />
      </PlayerProvider>
    </BrowserRouter>
  );
}

/** Fullscreen player shown above the shell whenever something is playing. */
function PlayerOverlay() {
  const { current, stop } = usePlayer();
  if (!current) return null;
  return (
    <div className="fixed inset-0 z-40">
      <MediaPlayer source={current} onBack={stop} />
    </div>
  );
}
