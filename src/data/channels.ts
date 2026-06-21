import type { Channel } from './types';

/**
 * Live TV catalog — replicates the sefirox.com channel lineup
 * (source: sefirox.com /api/channels). Mostly Turkish free-to-air majors
 * plus a few international public channels. Most stream URLs geo-block to
 * Turkey, so they need the media proxy with a Turkey egress to play reliably.
 */
export const CHANNELS: Channel[] = [
  { id: 'trt-1', name: 'TRT 1', group: 'General', hlsUrl: 'https://trt.daioncdn.net/trt-1/master.m3u8?app=web', logo: 'https://cdn.technettv.com/channel/19958/logo_256_1699961525.png' },
  { id: 'now', name: 'NOW', group: 'General', hlsUrl: 'https://uycyyuuzyh.turknet.ercdn.net/nphindgytw/nowtv/nowtv_360p.m3u8', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0b53AgDyq9TRHmkF6t4YKFRXmCzlbRQvnOw&s' },
  { id: 'show-tv', name: 'SHOW TV', group: 'General', hlsUrl: 'https://rmtftbjlne.turknet.ercdn.net/bpeytmnqyp/showtv/showtv.m3u8', logo: 'https://cdn.technettv.com/channel/29716/logo_256_1734935547.jpg' },
  { id: 'atv', name: 'ATV', group: 'General', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/atv/atv_360p.m3u8', logo: 'https://cdn.technettv.com/channel/33825/logo_256.png' },
  { id: 'kanald', name: 'KANALD', group: 'General', hlsUrl: 'https://ackaxsqacw.turknet.ercdn.net/ozfkfbbjba/kanald/kanald_720p.m3u8', logo: 'https://cdn.technettv.com/channel/20483/logo_256_1707397616.png' },
  { id: 'ntv', name: 'NTV', group: 'News', hlsUrl: 'https://dogus.daioncdn.net/ntv/ntv_720p.m3u8?&sid=89u6b6yru4yz&app=7c4bb802-0c41-409e-8cd2-799984995694&ce=2', logo: 'https://cdn.technettv.com/channel/20546/logo_256_1707397575.png' },
  { id: 'kanal-7', name: 'KANAL 7', group: 'General', hlsUrl: 'https://kanal7-live.daioncdn.net/kanal7/kanal7.m3u8', logo: 'https://mediacms01.digiturkplay.com/channel_logo/Kanal1_7.png' },
  { id: 'tv360', name: 'TV360', group: 'General', hlsUrl: 'http://turkmedya-live.ercdn.net/tv360/tv360_1080p.m3u8', logo: 'https://cdn.technettv.com/channel/20637/logo_256_1699962172.png' },
  { id: 'tv8', name: 'TV8', group: 'General', hlsUrl: 'https://tv8.daioncdn.net/tv8/tv8_720p.m3u8?&sid=89u4y8txpmx5&app=7ddc255a-ef47-4e81-ab14-c0e5f2949788&ce=3', logo: 'https://cdn.technettv.com/channel/33790/logo_256.png' },
  { id: 'cnbc-e', name: 'CNBC E', group: 'News', hlsUrl: 'https://hnpsechtsc.turknet.ercdn.net/xpnvudnlsv/cnbc-e/cnbc-e.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/CNBC-e-Logo.png' },
  { id: 'tv100', name: 'TV100', group: 'News', hlsUrl: 'https://tv100-live.daioncdn.net/tv100/tv100.m3u8', logo: 'https://cdn.technettv.com/channel/22926/logo_256_1707397437.png' },
  { id: 'halktv', name: 'HALKTV', group: 'News', hlsUrl: 'https://halktv-live.daioncdn.net/halktv/halktv.m3u8', logo: 'https://cdn.technettv.com/channel/22975/logo_256_1707397382.png' },
  { id: 'bloomberg-ht', name: 'BLOOMBERG HT', group: 'News', hlsUrl: 'https://tv.ensonhaber.com/bloomberght/bloomberght.m3u8', logo: 'https://cdn.technettv.com/channel/20322/logo_256_1699957451.png' },
  { id: 'benguturk', name: 'BENGÜTÜRK', group: 'News', hlsUrl: 'http://tv.ensonhaber.com/benguturk/benguturk.m3u8', logo: 'https://i.ibb.co/0MHPk8y/benguturk.png' },
  { id: 'haber-global', name: 'HABER GLOBAL', group: 'News', hlsUrl: 'https://ensonhaber-live.ercdn.net/haberglobal/haberglobal.m3u8', logo: 'https://i.ibb.co/k58p7P2/hglobal.png' },
  { id: 'haberturk', name: 'HABERTÜRK', group: 'News', hlsUrl: 'https://tv.ensonhaber.com/haberturk/haberturk.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/tr/0/03/Haberturk.com_logo.jpg' },
  { id: 'trt-cocuk', name: 'TRT ÇOCUK', group: 'Kids', hlsUrl: 'https://tv-trtcocuk.medya.trt.com.tr/master_720.m3u8', logo: 'https://cdn.technettv.com/channel/20616/logo_256_1707397583.png' },
  { id: 'minika-go', name: 'MİNİKA GO', group: 'Kids', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/minikago/minikago.m3u8', logo: 'https://yt3.googleusercontent.com/6Ci6NdBP5dl_pY3TLFxWa6NdSm9IsG182yNUE5qmOKFiQLPscSkRyerA4AWgI2h9IFpFXN82uA=s900-c-k-c0x00ffffff-no-rj' },
  { id: 'bbc-news', name: 'BBC NEWS', group: 'News', hlsUrl: 'https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/t=3840/v=pv14/b=5070016/main.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/BBC_News_2022_%28Alt%29.svg/250px-BBC_News_2022_%28Alt%29.svg.png' },
  { id: 'tele-1', name: 'TELE 1', group: 'News', hlsUrl: 'https://tele1-live.ercdn.net/tele1/tele1.m3u8', logo: 'https://basinkonseyi.org.tr/wp-content/uploads/2020/07/tele1-kanali-logo-D4DE153D5D-seeklogo.com_.png' },
  { id: '24', name: '24', group: 'News', hlsUrl: 'https://turkmedya-live.ercdn.net/tv24/tv24.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/tr/a/a6/24_TV_logosu.png' },
  { id: 'trtspor', name: 'TRTSPOR', group: 'Sports', hlsUrl: 'https://trt.daioncdn.net/trtspor/master.m3u8?app=web', logo: 'https://cdn.technettv.com/channel/20770/logo_256_1699963394.png' },
  { id: 'aspor', name: 'ASPOR', group: 'Sports', hlsUrl: 'https://rnttwmjcin.turknet.ercdn.net/lcpmvefbyo/aspor/aspor_480p.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/tr/e/e9/A_Spor_logosu.png' },
  { id: 'ht-spor', name: 'HT SPOR', group: 'Sports', hlsUrl: 'https://ciner.daioncdn.net/ht-spor/ht-spor.m3u8?app=web&ppid=675956db19f9bb686edda21d15d911e8&dfp_paln=AQzzBGQEBm1BO0E2iVe9tLfcsqJ3gAOMJ63P8Ch', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiFZOKcoVeRqlfcwUBNXoQZGZPguNXzdDz9w&s' },
  { id: 'power-tv', name: 'POWER TV', group: 'Music', hlsUrl: 'https://live.artidijitalmedya.com/artidijital_powertv/powertv/playlist.m3u8', logo: 'https://cdn.powergroup.com.tr/image/500x500/powerapp/channels/v3/logo_44.png?v=1' },
  { id: 'number-1', name: 'NUMBER 1', group: 'Music', hlsUrl: 'https://b01c02nl.mediatriple.net/videoonlylive/mtkgeuihrlfwlive/broadcast_5c9e17cd59e8b.smil/playlist.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Nr1_logo_vector.svg' },
  { id: 'powerturk-tv', name: 'POWERTURK TV', group: 'Music', hlsUrl: 'https://live.artidijitalmedya.com/artidijital_powerturktv/powerturktv/playlist.m3u8', logo: 'https://i.ibb.co/B6N9KsN/powerturk22.png' },
  { id: 'trt-belgesel', name: 'TRT BELGESEL', group: 'Documentary', hlsUrl: 'https://tv-trtbelgesel.medya.trt.com.tr/master_1080.m3u8', logo: 'https://cdn.technettv.com/channel/20609/logo_256_1699961655.png' },
  { id: 'nh-niews', name: 'NH Niews', group: 'News', hlsUrl: 'https://takeoff.jetstre.am/?account=nhnieuws&file=live&output=playlist.m3u8&protocol=https&service=wowza&type=live', logo: 'https://i.imgur.com/SPkK4md.png' },
  { id: 'citynews-toronto', name: 'CITYNEWS TORONTO', group: 'News', hlsUrl: 'https://citynewsregional.akamaized.net/hls/live/1024052/Regional_Live_7/master.m3u8', logo: 'https://m.media-amazon.com/images/I/51Icdznow+L.png' },
  { id: 'pbs-kids', name: 'PBS KIDS', group: 'Kids', hlsUrl: 'https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8', logo: 'https://i.imgur.com/q4cUQKW.png' },
  { id: 'rtl-bel', name: 'RTL-BEL', group: 'General', hlsUrl: 'https://bel-live-hls.akamaized.net/hls/live/2038650/BEL-Live-HLS/master.m3u8', logo: 'https://content.sudinfo.be/logotheque/files/dl_logos/dl_logos_rtlbelgium/logo_bel-rtl_cmyk_pos.jpg' },
  { id: 'tagesschau24', name: 'tagesschau24', group: 'News', hlsUrl: 'https://tagesschau.akamaized.net/hls/live/2020115/tagesschau/tagesschau_1/master-720p-3328.m3u8', logo: 'https://www.designtagebuch.de/wp-content/uploads/2012/05/tagesschau24-logo-blau.jpg' },
  { id: 'tvi', name: 'TVI', group: 'General', hlsUrl: 'https://raw.githubusercontent.com/thomraider12/canaistvpt/main/m3u8s/tvi.m3u8', logo: 'https://i.imgur.com/H8Tgl7m.png' },
  { id: 'sic', name: 'SIC', group: 'General', hlsUrl: 'https://d1zx6l1dn8vaj5.cloudfront.net/out/v1/b89cc37caa6d418eb423cf092a2ef970/index.m3u8', logo: 'https://i.imgur.com/SPMqiDG.png' },
  { id: 'arte-austria', name: 'ARTE AUSTRIA', group: 'Documentary', hlsUrl: 'https://dash4.antik.sk/live/test_arte_avc_25p/playlist.m3u8', logo: 'https://i.imgur.com/ecXMjNl.png' },
  { id: 'ard-alpha', name: 'ARD Alpha', group: 'Documentary', hlsUrl: 'https://mcdn.br.de/br/fs/ard_alpha/hls/int/master.m3u8', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ARD_alpha.svg/1280px-ARD_alpha.svg.png' },
];

const GROUP_ORDER = ['News', 'General', 'Sports', 'World', 'Documentary', 'Kids', 'Music', 'Education'];

export const CHANNEL_GROUPS = Array.from(new Set(CHANNELS.map((c) => c.group))).sort(
  (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
);

export function getChannel(id: string): Channel | undefined {
  return CHANNELS.find((c) => c.id === id);
}
