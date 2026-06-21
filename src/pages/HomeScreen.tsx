import { useNavigate } from 'react-router-dom';
import { Tv, Youtube } from 'lucide-react';
import { CHANNELS } from '../data/channels';
import { ChannelCard } from '../components/ChannelCard';
import { usePlayer } from '../state/PlayerContext';
import { chooseEngine } from '../player/createEngine';
import type { Channel } from '../data/types';

export function HomeScreen() {
  const navigate = useNavigate();
  const { play } = usePlayer();

  const onSelect = (c: Channel) => {
    const url = c.wsRelayUrl ?? c.hlsUrl;
    play({
      kind: 'live-tv',
      engine: chooseEngine({ kind: 'live-tv', url }),
      url,
      title: c.name,
      subtitle: c.description ?? c.group,
      isLive: true,
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      <header className="pt-6">
        <h1 className="text-6xl font-semibold tracking-tight">Welcome</h1>
        <p className="mt-3 text-2xl text-white/45">Live TV and YouTube — for passengers.</p>
      </header>

      {/* Two large entry points */}
      <div className="grid grid-cols-2 gap-6">
        <BigTile
          icon={<Tv className="h-10 w-10" strokeWidth={1.5} />}
          label="Live TV"
          onClick={() => navigate('/live')}
        />
        <BigTile
          icon={<Youtube className="h-10 w-10" strokeWidth={1.5} />}
          label="YouTube"
          onClick={() => navigate('/youtube')}
        />
      </div>

      {/* Featured live channels */}
      <section>
        <h2 className="mb-6 text-2xl font-medium text-white/70">Featured channels</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {CHANNELS.slice(0, 3).map((c) => (
            <ChannelCard key={c.id} channel={c} onSelect={onSelect} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BigTile({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-44 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-left transition-colors hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <span className="text-white/70">{icon}</span>
      <span className="text-4xl font-semibold tracking-tight">{label}</span>
    </button>
  );
}
