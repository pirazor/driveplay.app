import { useState } from 'react';
import { Search, Youtube, Loader2 } from 'lucide-react';
import { searchYouTube, resolveYouTube, proxyEnabled, type YouTubeSearchResult } from '../player/proxyClient';
import { usePlayer } from '../state/PlayerContext';

export function YouTubeScreen() {
  const { play } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchYouTube(query.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const openVideo = async (r: YouTubeSearchResult) => {
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${r.videoId}`;
      const resolved = await resolveYouTube(watchUrl);
      play({
        kind: r.isLive ? 'youtube-live' : 'youtube',
        engine: 'webcodecs',
        url: resolved.videoUrl,
        audioUrl: resolved.audioUrl,
        title: resolved.title,
        subtitle: resolved.channel,
        isLive: resolved.isLive,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open video');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <h1 className="pt-6 text-5xl font-semibold tracking-tight">YouTube</h1>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5">
          <Search className="h-6 w-6 text-white/35" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Search videos"
            className="w-full bg-transparent text-2xl text-white placeholder-white/25 outline-none"
          />
        </div>
        <button
          onClick={runSearch}
          className="rounded-2xl bg-white px-10 text-xl font-semibold text-black transition-colors hover:bg-white/90"
        >
          Search
        </button>
      </div>

      {error && <p className="text-lg text-white/50">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-white/50" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {results.map((r) => (
            <button
              key={r.videoId}
              onClick={() => openVideo(r)}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] text-left transition-colors hover:border-white/20"
            >
              <div className="relative aspect-video bg-black/40">
                {r.thumbnail && <img src={r.thumbnail} alt="" className="h-full w-full object-cover" />}
                {r.isLive && (
                  <span className="absolute left-3 top-3 rounded bg-red-600 px-2.5 py-1 text-sm font-bold">
                    LIVE
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-medium text-white">{r.title}</h3>
                <p className="mt-1.5 text-base text-white/40">{r.channel}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="flex flex-col items-center gap-4 py-28 text-center text-white/30">
            <Youtube className="h-16 w-16" strokeWidth={1.25} />
            <p className="text-xl">
              {proxyEnabled ? 'Search for something to start watching' : 'Connect the media backend to enable YouTube'}
            </p>
          </div>
        )
      )}
    </div>
  );
}
