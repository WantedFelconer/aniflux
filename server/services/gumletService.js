/**
 * Gumlet Video Streaming Service
 * Provides URL parsing, asset ID extraction, embed formatting, and reachability validation.
 */

// Supported standard Gumlet embed domains and URL formats:
// - https://play.gumlet.io/embed/:asset_id
// - https://play.gumlet.io/embed/:asset_id?autoplay=false&preload=true
// - https://video.gumlet.io/:collection_id/:asset_id/index.m3u8
// - https://video.gumlet.io/:collection_id/:asset_id/main.mp4
// - Raw Asset ID: 65123abc456def789...

/**
 * Extracts a Gumlet Asset ID from a given URL or raw string.
 * @param {string} url
 * @returns {string|null}
 */
export function extractGumletAssetId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Check if it's already a clean hex/alphanumeric asset ID (24-32 chars)
  if (/^[a-fA-F0-9]{24,32}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Match play.gumlet.io/embed/:asset_id
  const playMatch = trimmed.match(/play\.gumlet\.io\/embed\/([a-zA-Z0-9_-]+)/i);
  if (playMatch && playMatch[1]) {
    return playMatch[1];
  }

  // 3. Match video.gumlet.io/:collection_id/:asset_id/...
  const videoMatch = trimmed.match(/video\.gumlet\.io\/[a-zA-Z0-9_-]+\/([a-zA-Z0-9_-]+)/i);
  if (videoMatch && videoMatch[1]) {
    return videoMatch[1];
  }

  // 4. Generic gumlet.io URL path segment
  const genericMatch = trimmed.match(/gumlet\.io\/(?:embed\/)?([a-zA-Z0-9_-]{12,36})/i);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  return null;
}

/**
 * Formats a Gumlet asset or URL into an embeddable player URL with customizable playback options.
 * @param {string} urlOrId
 * @param {object} options
 * @returns {string}
 */
export function formatGumletEmbedUrl(urlOrId, options = {}) {
  if (!urlOrId) return '';
  const assetId = extractGumletAssetId(urlOrId) || urlOrId.trim();

  const {
    autoplay = false,
    loop = false,
    preload = true,
    mute = false,
    branding = true,
    subtitles = true,
    colors = '6d3bff' // Accent color hex
  } = options;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', 'true');
  if (loop) params.set('loop', 'true');
  if (preload) params.set('preload', 'true');
  if (mute) params.set('muted', 'true');
  if (!branding) params.set('branding', 'false');
  if (subtitles) params.set('subtitles', 'true');
  if (colors) params.set('color', colors);

  const queryString = params.toString();
  return `https://play.gumlet.io/embed/${assetId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Validates whether a Gumlet URL or asset is formatted properly and optionally verifies reachability.
 * @param {string} url
 * @param {boolean} [checkReachability=true]
 * @returns {Promise<{ valid: boolean, assetId: string|null, embedUrl: string, status: string, error?: string, httpStatus?: number }>}
 */
export async function validateGumletUrl(url, checkReachability = true) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      valid: false,
      assetId: null,
      embedUrl: '',
      status: 'broken',
      error: 'URL or Asset ID cannot be empty.'
    };
  }

  const trimmed = url.trim();
  const assetId = extractGumletAssetId(trimmed);

  // Must be recognized as a valid Gumlet link or asset ID
  const isGumletPattern =
    trimmed.includes('gumlet.io') ||
    /^[a-fA-F0-9]{24,32}$/.test(trimmed) ||
    trimmed.startsWith('https://play.gumlet.io');

  if (!isGumletPattern && !assetId) {
    return {
      valid: false,
      assetId: null,
      embedUrl: trimmed,
      status: 'broken',
      error: 'Invalid Gumlet URL format. Expected a play.gumlet.io embed link or valid Gumlet Asset ID.'
    };
  }

  const embedUrl = formatGumletEmbedUrl(assetId || trimmed);

  if (!checkReachability) {
    return {
      valid: true,
      assetId: assetId || 'custom',
      embedUrl,
      status: 'unverified'
    };
  }

  // Live Reachability Check using fetch with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(embedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Aniflux-StreamSupervisor/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status >= 200 && response.status < 400) {
      return {
        valid: true,
        assetId: assetId || 'custom',
        embedUrl,
        status: 'healthy',
        httpStatus: response.status
      };
    } else if (response.status === 404) {
      return {
        valid: false,
        assetId,
        embedUrl,
        status: 'broken',
        httpStatus: 404,
        error: 'Gumlet Asset not found (HTTP 404). Check if video was deleted or asset ID is incorrect.'
      };
    } else {
      return {
        valid: false,
        assetId,
        embedUrl,
        status: 'broken',
        httpStatus: response.status,
        error: `Gumlet server returned unexpected response (HTTP ${response.status}).`
      };
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        valid: false,
        assetId,
        embedUrl,
        status: 'broken',
        error: 'Connection timed out while verifying Gumlet stream reachability.'
      };
    }

    return {
      valid: false,
      assetId,
      embedUrl,
      status: 'broken',
      error: `Network validation error: ${err.message}`
    };
  }
}
