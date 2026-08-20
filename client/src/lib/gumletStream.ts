export interface GumletPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  preload?: boolean;
  muted?: boolean;
  subtitles?: boolean;
  branding?: boolean;
  color?: string; // hex color for player accent
}

export interface SubtitleTrack {
  label: string;
  src: string;
  srclang: string;
  default?: boolean;
}

export interface GumletStreamSource {
  id: string;
  name: string;
  assetId: string;
  embedUrl: string;
  streamStatus: 'healthy' | 'broken' | 'unverified' | 'pending';
  errorMessage?: string | null;
  subtitleTracks?: SubtitleTrack[];
}

/**
 * Default sample public Gumlet embed for active live demonstration.
 */
export const SAMPLE_GUMLET_EMBED = 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8';
export const SAMPLE_GUMLET_ASSET_ID = '65719bc42b91866ef114bca8';

/**
 * Extracts a Gumlet Asset ID from various link formats:
 * - https://play.gumlet.io/embed/65719bc42b91866ef114bca8
 * - https://video.gumlet.io/6389f/65719bc42b91866ef114bca8/main.m3u8
 * - 65719bc42b91866ef114bca8 (raw ID)
 */
/**
 * Extracts a Gumlet Asset ID from various link formats:
 * - https://gumlet.tv/watch/6a870965ba1e4a1341b3642f/
 * - https://gumlet.tv/watch/6a870965ba1e4a1341b3642f
 * - https://play.gumlet.io/embed/6a870965ba1e4a1341b3642f
 * - https://video.gumlet.io/6389f/6a870965ba1e4a1341b3642f/main.m3u8
 * - Raw 24-32 char hex/alphanumeric ID
 */
export function extractGumletAssetId(url: string | undefined | null): string | null {
  if (!url) return null;
  let trimmed = url.trim().split('?')[0].split('#')[0];
  trimmed = trimmed.replace(/\/+$/, '');

  // 1. Hex or alphanumeric ID (typically 24-32 chars)
  if (/^[a-fA-F0-9]{24,32}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. gumlet.tv/watch/:asset_id or gumlet.tv/embed/:asset_id
  const tvMatch = trimmed.match(/gumlet\.tv\/(?:watch|embed)\/([a-zA-Z0-9_-]+)/i);
  if (tvMatch && tvMatch[1]) {
    return tvMatch[1];
  }

  // 3. play.gumlet.io/embed/:asset_id
  const embedMatch = trimmed.match(/play\.gumlet\.io\/embed\/([a-zA-Z0-9_-]+)/i);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // 4. video.gumlet.io/:collection_id/:asset_id/...
  const videoMatch = trimmed.match(/video\.gumlet\.io\/[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/i);
  if (videoMatch && videoMatch[1]) {
    return videoMatch[1];
  }

  // 5. Generic gumlet.tv or gumlet.io link
  const genericMatch = trimmed.match(/gumlet\.(?:tv|io)\/(?:embed\/|watch\/)?([a-zA-Z0-9_-]{12,36})/i);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return null;
}

/**
 * Formats a Gumlet URL or asset ID into an embed URL with player options.
 */
export function formatGumletEmbedUrl(
  urlOrId: string | undefined | null,
  options: GumletPlayerOptions = {}
): string {
  if (!urlOrId) return SAMPLE_GUMLET_EMBED;
  const assetId = extractGumletAssetId(urlOrId) || urlOrId.trim();

  const {
    autoplay = false,
    loop = false,
    preload = true,
    muted = false,
    subtitles = true,
    branding = true,
    color = '6d3bff',
  } = options;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', 'true');
  if (loop) params.set('loop', 'true');
  if (preload) params.set('preload', 'true');
  if (muted) params.set('muted', 'true');
  if (!branding) params.set('branding', 'false');
  if (subtitles) params.set('subtitles', 'true');
  if (color) params.set('color', color.replace('#', ''));

  const query = params.toString();
  return `https://play.gumlet.io/embed/${assetId}${query ? `?${query}` : ''}`;
}

/**
 * Fast client-side URL validator for Gumlet links.
 */
export function validateGumletUrlClient(url: string | undefined | null): {
  isValid: boolean;
  assetId: string | null;
  error?: string;
} {
  if (!url || !url.trim()) {
    return { isValid: false, assetId: null, error: 'Link cannot be empty' };
  }

  const trimmed = url.trim();
  const assetId = extractGumletAssetId(trimmed);

  const isGumletPattern =
    trimmed.includes('gumlet.tv') ||
    trimmed.includes('gumlet.io') ||
    /^[a-fA-F0-9]{24,32}$/.test(trimmed) ||
    trimmed.startsWith('https://play.gumlet.io') ||
    trimmed.startsWith('https://gumlet.tv');

  if (!isGumletPattern && !assetId) {
    return {
      isValid: false,
      assetId: null,
      error: 'Invalid Gumlet URL format. Expected a gumlet.tv/watch link or valid Gumlet Asset ID.',
    };
  }

  return {
    isValid: true,
    assetId: assetId || 'custom',
  };
}

/**
 * Resolves episode Gumlet stream source with strict per-episode link isolation.
 */
export function resolveGumletEpisodeStream(
  animeId: number,
  episodeNumber: number,
  defaultAnimeUrl?: string,
  streamSourcesMap?: Record<number, any>
): GumletStreamSource {
  const epData = streamSourcesMap?.[episodeNumber];
  // 1. Specific Episode Gumlet URL
  let urlToUse = epData?.gumletUrl?.trim() || '';

  // 2. Default whole-anime URL ONLY applies to Episode 1 if not explicitly set
  if (!urlToUse && episodeNumber === 1 && defaultAnimeUrl?.trim()) {
    urlToUse = defaultAnimeUrl.trim();
  }

  // 3. Built-in sample fallback only for mock demo IDs 1..3 on Episode 1
  if (!urlToUse && animeId <= 3 && episodeNumber === 1) {
    urlToUse = SAMPLE_GUMLET_EMBED;
  }

  if (!urlToUse) {
    return {
      id: `gumlet-ep-${episodeNumber}`,
      name: `Gumlet Stream (Ep ${episodeNumber})`,
      assetId: null,
      embedUrl: '',
      streamStatus: 'unverified',
      errorMessage: `Episode ${episodeNumber} video has not been uploaded or configured yet.`,
      subtitleTracks: [],
    };
  }

  const assetId = extractGumletAssetId(urlToUse) || epData?.gumletAssetId || 'custom';
  const status = epData?.streamStatus || 'healthy';

  return {
    id: `gumlet-ep-${episodeNumber}`,
    name: `Gumlet Adaptive Stream (Ep ${episodeNumber})`,
    assetId,
    embedUrl: formatGumletEmbedUrl(urlToUse),
    streamStatus: status,
    errorMessage: epData?.errorMessage,
    subtitleTracks: epData?.subtitleTracks || [
      { label: 'English', src: '', srclang: 'en', default: true },
      { label: 'Japanese', src: '', srclang: 'ja' },
    ],
  };
}
