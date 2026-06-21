import type { Channel } from './types';

/**
 * Free, publicly-broadcast television.
 *
 * Sources: Turkey's national public broadcaster (TRT), major Turkish
 * free-to-air channels, and well-known international public/free channels.
 * All entries use public HLS playlists whose CDNs send permissive CORS headers,
 * so they play directly in the browser via hls.js. (Channels whose CDNs lack
 * CORS would need the proxy layer — see player/proxyClient.ts — and can be
 * added once the backend is live.)
 *
 * URLs are sourced from the community-maintained iptv-org project and verified
 * for liveness + CORS.
 */
export const CHANNELS: Channel[] = [
  // ── TRT — Turkish public broadcaster (medya.trt.com.tr, CORS: *) ──
  { id: 'trt-1', name: 'TRT 1', group: 'General', hlsUrl: 'https://tv-trt1.medya.trt.com.tr/master.m3u8', description: 'TRT flagship channel' },
  { id: 'trt-haber', name: 'TRT Haber', group: 'News', hlsUrl: 'https://tv-trthaber.medya.trt.com.tr/master.m3u8', description: 'Live news' },
  { id: 'trt-world', name: 'TRT World', group: 'World', hlsUrl: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8', description: 'English-language global news' },
  { id: 'trt-spor', name: 'TRT Spor', group: 'Sports', hlsUrl: 'https://tv-trtspor1.medya.trt.com.tr/master.m3u8', description: 'Sports' },
  { id: 'trt-spor-yildiz', name: 'TRT Spor Yıldız', group: 'Sports', hlsUrl: 'https://tv-trtspor2.medya.trt.com.tr/master.m3u8', description: 'Sports — second channel' },
  { id: 'trt-cocuk', name: 'TRT Çocuk', group: 'Kids', hlsUrl: 'https://tv-trtcocuk.medya.trt.com.tr/master.m3u8', description: 'Kids' },
  { id: 'trt-diyanet-cocuk', name: 'TRT Diyanet Çocuk', group: 'Kids', hlsUrl: 'https://tv-trtdiyanetcocuk.medya.trt.com.tr/master.m3u8', description: 'Kids' },
  { id: 'trt-muzik', name: 'TRT Müzik', group: 'Music', hlsUrl: 'https://tv-trtmuzik.medya.trt.com.tr/master.m3u8', description: 'Turkish and world music' },
  { id: 'trt-belgesel', name: 'TRT Belgesel', group: 'Documentary', hlsUrl: 'https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8', description: 'Documentaries' },
  { id: 'trt-avaz', name: 'TRT Avaz', group: 'General', hlsUrl: 'https://tv-trtavaz.medya.trt.com.tr/master.m3u8', description: 'Eurasia broadcast' },
  { id: 'trt-turk', name: 'TRT Türk', group: 'General', hlsUrl: 'https://tv-trtturk.medya.trt.com.tr/master.m3u8', description: 'International Turkish broadcast' },
  { id: 'trt-kurdi', name: 'TRT Kurdî', group: 'General', hlsUrl: 'https://tv-trtkurdi.medya.trt.com.tr/master.m3u8', description: 'Kurdish-language channel' },
  { id: 'trt-eba-ilkokul', name: 'TRT EBA İlkokul', group: 'Education', hlsUrl: 'https://tv-e-okul00.medya.trt.com.tr/master.m3u8', description: 'Primary school education' },
  { id: 'trt-eba-ortaokul', name: 'TRT EBA Ortaokul', group: 'Education', hlsUrl: 'https://tv-e-okul01.medya.trt.com.tr/master.m3u8', description: 'Middle school education' },
  { id: 'trt-eba-lise', name: 'TRT EBA Lise', group: 'Education', hlsUrl: 'https://tv-e-okul02.medya.trt.com.tr/master.m3u8', description: 'High school education' },

  // ── Major Turkish free-to-air (ercdn.net, CORS: reflects origin) ──
  { id: 'a-haber', name: 'A Haber', group: 'News', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/ahaber/ahaber.m3u8', description: 'Live news' },
  { id: 'a-spor', name: 'A Spor', group: 'Sports', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor.m3u8', description: 'Sports' },
  { id: 'a2tv', name: 'A2 TV', group: 'General', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/a2tv/a2tv.m3u8', description: 'Movies and series' },
  { id: 'now-tv', name: 'NOW TV', group: 'General', hlsUrl: 'https://uycyyuuzyh.turknet.ercdn.net/nphindgytw/nowtv/nowtv.m3u8', description: 'General entertainment' },
  { id: 'tele1', name: 'Tele 1', group: 'News', hlsUrl: 'https://tele1-live.ercdn.net/tele1/tele1.m3u8', description: 'News and politics' },
  { id: 'tv4', name: 'TV4', group: 'General', hlsUrl: 'https://turkmedya-live.ercdn.net/tv4/tv4.m3u8', description: 'General entertainment' },
  { id: 'tv360', name: '360 TV', group: 'General', hlsUrl: 'https://turkmedya-live.ercdn.net/tv360/tv360.m3u8', description: 'General entertainment' },
  { id: 'cnbce', name: 'CNBC-e', group: 'General', hlsUrl: 'https://hnpsechtsc.turknet.ercdn.net/xpnvudnlsv/cnbc-e/cnbc-e.m3u8', description: 'Series and entertainment' },
  { id: 'minika-cocuk', name: 'Minika Çocuk', group: 'Kids', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/minikago_cocuk/minikago_cocuk.m3u8', description: 'Kids' },
  { id: 'minika-go', name: 'Minika Go', group: 'Kids', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/minikago/minikago.m3u8', description: 'Kids' },
  { id: 'tbmm', name: 'TBMM TV', group: 'News', hlsUrl: 'https://meclistv-live.ercdn.net/meclistv/meclistv.m3u8', description: 'Turkish parliament' },
  { id: 'akit-tv', name: 'Akit TV', group: 'News', hlsUrl: 'https://akittv-live.ercdn.net/akittv/akittv.m3u8', description: 'News' },

  // ── International public / free channels ──
  { id: 'aljazeera-en', name: 'Al Jazeera English', group: 'World', hlsUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8', description: 'Global news in English' },
  { id: 'aljazeera-ar', name: 'Al Jazeera', group: 'World', hlsUrl: 'https://live-hls-web-aja.getaj.net/AJA/01.m3u8', description: 'Global news in Arabic' },
  { id: 'dw-en', name: 'DW English', group: 'World', hlsUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8', description: 'Deutsche Welle — English' },
  { id: 'france24-en', name: 'France 24 English', group: 'World', hlsUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8', description: 'French international news — English' },
  { id: 'france24-ar', name: 'France 24 Arabic', group: 'World', hlsUrl: 'https://static.france24.com/live/F24_AR_LO_HLS/live_web.m3u8', description: 'French international news — Arabic' },
  { id: 'nasa', name: 'NASA TV', group: 'Documentary', hlsUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8', description: 'NASA public channel' },
  { id: 'redbull', name: 'Red Bull TV', group: 'Sports', hlsUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8', description: 'Sports and action' },
];

/** Group order for the Live TV filter. */
const GROUP_ORDER = ['News', 'General', 'Sports', 'World', 'Documentary', 'Kids', 'Music', 'Education'];

export const CHANNEL_GROUPS = Array.from(new Set(CHANNELS.map((c) => c.group))).sort(
  (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
);

export function getChannel(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}
