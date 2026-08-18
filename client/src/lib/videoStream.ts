export type StreamProvider = 'gdrive' | 'personal_server' | 'direct' | 'embed';

export interface StreamSource {
  id: string;
  name: string;
  provider: StreamProvider;
  url: string;
  quality?: string;
  isEmbed?: boolean;
}

/**
 * Extracts a Google Drive File ID from various link formats:
 * - https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing
 * - https://drive.google.com/file/d/1a2b3c4d5e/preview
 * - https://drive.google.com/open?id=1a2b3c4d5e
 * - https://drive.google.com/uc?id=1a2b3c4d5e
 * - Raw ID: 1a2b3c4d5e
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already a clean alphanumeric/dashes file ID (typically 25-45 chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch && idQueryMatch[1]) {
    return idQueryMatch[1];
  }

  return null;
}

/**
 * Formats a Google Drive link into an embeddable preview stream URL
 */
export function getGoogleDrivePreviewUrl(urlOrId: string): string {
  const fileId = extractGoogleDriveId(urlOrId) || urlOrId;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Formats a Google Drive link into a direct download/open stream URL
 */
export function getGoogleDriveDirectStreamUrl(urlOrId: string): string {
  const fileId = extractGoogleDriveId(urlOrId) || urlOrId;
  return `https://drive.google.com/uc?id=${fileId}&export=download`;
}

/**
 * Detects the stream provider from a given URL
 */
export function detectStreamProvider(url: string): StreamProvider {
  if (!url) return 'direct';
  const u = url.toLowerCase().trim();

  if (u.includes('drive.google.com') || extractGoogleDriveId(url)) {
    return 'gdrive';
  }

  if (
    u.includes('.mp4') ||
    u.includes('.webm') ||
    u.includes('.m3u8') ||
    u.includes('.mkv') ||
    u.startsWith('blob:')
  ) {
    return 'direct';
  }

  if (u.includes('/stream/') || u.includes('/api/video') || u.includes('personal-server') || u.includes('hls')) {
    return 'personal_server';
  }

  return 'embed';
}

// Sample fallback public Google Drive & high-speed direct streams for demonstration
export const SAMPLE_GDRIVE_PUBLIC_LINK = 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview'; // Google Drive public video preview
export const SAMPLE_DIRECT_VIDEO_LINK = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
export const SAMPLE_PERSONAL_SERVER_TEMPLATE = 'https://stream.yourserver.com/anime/{animeId}/ep{episode}.mp4';

/**
 * Generates stream sources for an anime episode.
 * Supports Google Drive links, personal server streams, and external sources.
 */
export function resolveEpisodeStreams(
  animeId: number,
  episodeNumber: number,
  customLinks?: { gdrive?: string; personalServer?: string; direct?: string }
): StreamSource[] {
  const sources: StreamSource[] = [];

  // 1. Google Drive Public Stream Source
  const gdriveUrl = customLinks?.gdrive || SAMPLE_GDRIVE_PUBLIC_LINK;
  const gdriveEmbed = gdriveUrl.includes('/preview')
    ? gdriveUrl
    : getGoogleDrivePreviewUrl(gdriveUrl);

  sources.push({
    id: 'gdrive-preview',
    name: 'Google Drive (Cloud Stream)',
    provider: 'gdrive',
    url: gdriveEmbed,
    quality: '1080p (HD)',
    isEmbed: true,
  });

  // 2. Personal Server Stream Source (for your future server)
  const personalServerUrl =
    customLinks?.personalServer ||
    `https://stream.yourserver.com/anime/${animeId}/ep${episodeNumber}.mp4`;

  sources.push({
    id: 'personal-server',
    name: 'Personal Server (Self-Hosted)',
    provider: 'personal_server',
    url: personalServerUrl,
    quality: 'Source (High Bitrate)',
    isEmbed: false,
  });

  // 3. Fast Direct HTML5 Video Stream Source (Active demonstration fallback)
  sources.push({
    id: 'direct-stream',
    name: 'Fast Direct CDN (HTML5)',
    provider: 'direct',
    url: customLinks?.direct || SAMPLE_DIRECT_VIDEO_LINK,
    quality: '1080p',
    isEmbed: false,
  });

  // 4. StreamSB / VidStream backup player
  sources.push({
    id: 'vidstream-backup',
    name: 'VidStream (Backup)',
    provider: 'embed',
    url: gdriveEmbed,
    quality: '720p',
    isEmbed: true,
  });

  return sources;
}
