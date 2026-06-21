# DrivePlay Media Proxy

Backend for the in-car media app. It does the two things a static frontend
can't: proxy live-TV HLS streams (defeating CORS so **every** channel plays,
not just CORS-enabled ones) and resolve YouTube streams.

Mirrors the request contract the frontend already speaks (`src/car/player/proxyClient.ts`).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness check |
| GET | `/api/track/proxy?url=<m3u8>&rewrite_m3u8=1` | Live TV HLS proxy + playlist rewrite |
| GET | `/api/track/proxy?url=<segment>` | Segment / key passthrough (range-aware) |
| GET | `/api/youtube/search?q=…&limit=…` | YouTube search |
| GET | `/api/youtube/resolve?url=<watch url or id>` | Resolve to playable stream URL(s) |
| GET | `/api/youtube/proxy?url=<googlevideo url>` | YouTube media passthrough |

## Run locally

```bash
cd server
cp .env.example .env
npm install
npm run dev          # or: npm start
curl localhost:8787/health
```

## Connect the frontend

Point the app at this service via either:

- **Build env:** set `VITE_MEDIA_API_BASE=https://your-proxy-host` and rebuild, or
- **Runtime (no rebuild):** in the browser console on the app,
  `localStorage.setItem('mediaApiBase','https://your-proxy-host')` and reload.

Once set, Live TV routes every stream through `/api/track/proxy` and YouTube
becomes available.

## Deploy

The frontend auto-deploys to Hostinger (static); this service needs a Node host.
Any of these work — it's a plain Node 18+ app:

- **Docker:** `docker build -t media-proxy . && docker run -p 8787:8787 media-proxy`
- **Railway / Render / Fly.io:** point at `server/`, start command `npm start`.
- **Hostinger VPS (one command):** SSH in, clone the repo, then
  `sudo bash server/deploy/setup.sh` (installs Node 20 + pm2, starts the
  service, writes `.env`). Front it with HTTPS using `server/deploy/nginx-media.conf`
  + `certbot`, and point a subdomain (e.g. `api.driveplay.app`) at the VPS.

Set `CORS_ORIGINS=https://driveplay.app` in production.

## Security & scope

- **SSRF-guarded:** only http(s); hosts resolving to private/loopback/link-local
  IPs are refused (`src/security.js`).
- The proxy moves requests to the **server's** IP. This fixes CORS for all
  channels; broadcasters that geo-block by IP still need the server (or a
  residential `via` proxy, a future addition) to sit in an allowed region.
- YouTube extraction depends on `youtubei.js` + the `jintr` interpreter and is
  best-effort — YouTube's player script changes frequently. **Search works
  today**; stream *resolution* can break when YouTube ships a new player (the
  endpoint then returns a clean 502 — bump `youtubei.js`/`jintr` to recover).
  Live YouTube isn't wired yet (returns 409).
