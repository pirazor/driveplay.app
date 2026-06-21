import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { HttpError } from './security.js';
import { handleHlsProxy } from './hlsProxy.js';
import { handleSearch, handleResolve, handleMediaProxy } from './youtube.js';

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(
  cors({
    origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    methods: ['GET', 'HEAD', 'OPTIONS'],
  }),
);

/** Wrap async handlers so thrown HttpErrors become clean responses. */
const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    const status = err instanceof HttpError ? err.status : 502;
    if (!res.headersSent) res.status(status).json({ error: err.message ?? 'Upstream error' });
    else res.end();
  });

app.get('/health', (_req, res) => res.json({ ok: true, youtube: config.youtubeEnabled }));

// Live TV / IPTV HLS proxy.
app.get('/api/track/proxy', wrap(handleHlsProxy));

// YouTube.
if (config.youtubeEnabled) {
  app.get('/api/youtube/search', wrap(handleSearch));
  app.get('/api/youtube/resolve', wrap(handleResolve));
  app.get('/api/youtube/proxy', wrap(handleMediaProxy));
} else {
  const disabled = (_req, res) => res.status(503).json({ error: 'YouTube subsystem disabled' });
  app.get('/api/youtube/*', disabled);
}

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(config.port, () => {
  console.log(`media-proxy listening on :${config.port} (youtube=${config.youtubeEnabled})`);
});
