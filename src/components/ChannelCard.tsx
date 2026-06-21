import type { Channel } from '../data/types';

interface Props {
  channel: Channel;
  onSelect: (channel: Channel) => void;
}

/**
 * Calm, uniform channel tile: large name, a single small LIVE marker, no
 * decorative noise. Big tap target for a moving vehicle.
 */
export function ChannelCard({ channel, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className="group flex aspect-[16/10] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-left transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/45">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        LIVE
      </span>
      <span className="text-3xl font-semibold tracking-tight text-white">{channel.name}</span>
    </button>
  );
}
