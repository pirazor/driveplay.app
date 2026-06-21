# DrivePlay

In-car media streaming — **Live TV + YouTube** for passengers, built for Tesla
and other infotainment browsers. Minimalist, large-font, low-distraction UI.

- **Frontend:** Vite + React + TypeScript + Tailwind (static, deploys anywhere).
- **Backend:** `server/` — a Node media proxy (Live TV HLS proxy + YouTube),
  deployable on a VPS. See [`server/README.md`](server/README.md).

> Safety guardrails (passenger confirmation, in-motion gating) are intentionally
> deferred until the UI is finalized. The building blocks (`HoldToConfirmButton`,
> `SafetyContext`, `useVehicleMotion`) remain in the tree for that phase.

## Routes

```
/           Home      – hero + featured live channels
/live       Live TV   – free-to-air channels (TRT + international public TV)
/youtube    YouTube   – search + play (needs the backend)
/settings   Settings  – backend status, scope notes
```

## Player architecture (mirrors sefirox.com)

One `PlaybackEngine` interface, three interchangeable engines (`src/player`):

| Engine | Library | Surface | Used for |
|--------|---------|---------|----------|
| `HlsEngine` | hls.js | `<video>` | Live TV (works today) |
| `JSMpegEngine` | JSMpeg (CDN) | `<canvas>` | Low-latency MPEG1-TS WebSocket relay |
| `WebCodecsEngine` | mediabunny | `<canvas>` + Web Audio | YouTube (decode to canvas) |

No-interruption tricks (`src/player/MediaPlayer.tsx`): one-time gesture unlock
for audio autoplay, resume on `visibilitychange`/`focus`, hls.js auto-recovery.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # -> dist/
npm run typecheck
```

## Deploy

**Frontend** (static) — build and serve `dist/` anywhere. On Hostinger/Apache,
`public/.htaccess` provides the SPA fallback so deep links resolve. Point the
domain (e.g. `driveplay.app`) at it; for git auto-deploy use build command
`npm run build`, publish dir `dist`.

**Backend** — deploy `server/` on a VPS (Docker / pm2 / alongside n8n via
Traefik). Then connect the app to it via either:

- build env `VITE_MEDIA_API_BASE=https://api.driveplay.app`, or
- runtime (no rebuild): `localStorage.setItem('mediaApiBase','https://api.driveplay.app')`.

Without a backend, CORS-enabled Live TV channels still play directly; the proxy
makes **every** channel work and enables YouTube.

## Content scope

Free, publicly-broadcast TV (TRT family + international public channels) and
content played through licensed third-party libraries. Watching video while
driving is dangerous and may be illegal — this app is for passengers.
