import { useMemo, useState } from 'react';
import { CHANNELS, CHANNEL_GROUPS } from '../data/channels';
import type { Channel } from '../data/types';
import { ChannelCard } from '../components/ChannelCard';
import { usePlayer } from '../state/PlayerContext';
import { chooseEngine } from '../player/createEngine';

export function LiveTvScreen() {
  const { play } = usePlayer();
  const [group, setGroup] = useState<string>('All');

  const channels = useMemo(
    () => (group === 'All' ? CHANNELS : CHANNELS.filter((c) => c.group === group)),
    [group],
  );

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
    <div className="mx-auto max-w-6xl">
      <h1 className="pt-6 text-5xl font-semibold tracking-tight">Live TV</h1>

      {/* Group filter */}
      <div className="mb-10 mt-8 flex flex-wrap gap-3">
        {['All', ...CHANNEL_GROUPS].map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`rounded-full px-6 py-3 text-lg font-medium transition-colors ${
              group === g ? 'bg-white text-black' : 'text-white/45 hover:bg-white/5 hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {channels.map((c) => (
          <ChannelCard key={c.id} channel={c} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
