import { NavLink, Outlet } from 'react-router-dom';
import { Home, Tv, Youtube, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/live', label: 'Live TV', icon: Tv, end: false },
  { to: '/youtube', label: 'YouTube', icon: Youtube, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

/**
 * Minimalist car-display shell: a quiet left rail with a few large, clearly
 * labelled destinations and generous spacing. Built for a wide landscape Tesla
 * screen — large type, high contrast, low visual noise.
 */
export function CarShell() {
  const clock = useClock();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0c10] text-white antialiased">
      {/* Left navigation rail */}
      <nav className="flex w-[208px] shrink-0 flex-col gap-3 px-5 py-8">
        <div className="mb-8 px-3 text-2xl font-semibold tracking-tight text-white/90">
          Drive<span className="text-white/40">Play</span>
        </div>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl px-4 py-4 text-lg font-medium transition-colors ${
                isActive ? 'bg-white text-black' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-7 w-7 shrink-0" strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex justify-end px-12 pt-8">
          <span className="text-2xl font-light tabular-nums tracking-tight text-white/40">{clock}</span>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-12 pb-12 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function useClock(): string {
  const [now, setNow] = useState(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(formatTime(new Date())), 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
