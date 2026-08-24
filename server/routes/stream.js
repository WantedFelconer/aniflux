import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { formatGumletEmbedUrl, extractGumletAssetId } from '../services/gumletService.js';

const router = express.Router();
const STREAM_SECRET = process.env.STREAM_SECRET || process.env.JWT_SECRET || 'aniflux-secure-stream-key-2024';

/**
 * Creates a cryptographically signed HMAC token for a given anime + episode and user.
 * @param {number|string} animeId
 * @param {number|string} episodeNumber
 * @param {number|string} userId
 * @param {number} expiresInSeconds
 * @returns {string}
 */
export function generateStreamToken(animeId, episodeNumber, userId, expiresInSeconds = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${animeId}:${episodeNumber}:${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', STREAM_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ a: animeId, e: episodeNumber, u: userId, exp: expiresAt, sig: signature })).toString('base64url');
}

/**
 * Validates a signed stream token.
 * @param {string} tokenString
 * @param {number|string} animeId
 * @param {number|string} episodeNumber
 * @returns {boolean}
 */
export function verifyStreamToken(tokenString, animeId, episodeNumber) {
  if (!tokenString) return false;
  try {
    const decoded = JSON.parse(Buffer.from(tokenString, 'base64url').toString('utf8'));
    if (!decoded || !decoded.exp || !decoded.sig || !decoded.u) return false;

    // Check expiry
    if (Math.floor(Date.now() / 1000) > decoded.exp) return false;

    // Check matching anime and episode
    if (String(decoded.a) !== String(animeId) || String(decoded.e) !== String(episodeNumber)) return false;

    // Verify HMAC signature
    const payload = `${decoded.a}:${decoded.e}:${decoded.u}:${decoded.exp}`;
    const expectedSig = crypto.createHmac('sha256', STREAM_SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(decoded.sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

// 1. GET SIGNED STREAM TOKEN (/api/stream/token/:animeId/:episodeNumber)
// Requires authenticated user session
router.get('/token/:animeId/:episodeNumber', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const episodeNumber = parseInt(req.params.episodeNumber);

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return res.status(400).json({ error: 'Invalid anime or episode ID' });
    }

    const token = generateStreamToken(animeId, episodeNumber, req.user.user_id, 3600);

    return res.json({
      success: true,
      token,
      playerUrl: `/api/stream/player/${animeId}/${episodeNumber}?token=${encodeURIComponent(token)}`,
      expiresIn: 3600
    });
  } catch (err) {
    console.error('Error generating stream token:', err);
    return res.status(500).json({ error: 'Failed to generate secure stream token' });
  }
});

// 2. SECURE PLAYER GATEWAY EMBED (/api/stream/player/:animeId/:episodeNumber)
// Validates session via Cookie, Bearer header, or signed token.
// If unauthenticated or token expired, immediately denies access.
router.get('/player/:animeId/:episodeNumber', optionalAuthenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const episodeNumber = parseInt(req.params.episodeNumber);
    const streamToken = req.query.token;

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return res.status(400).send('Invalid anime or episode identifier.');
    }

    // Check authorization: User must either have a valid active session or a valid signed stream token
    const isSessionValid = Boolean(req.user);
    const isTokenValid = streamToken ? verifyStreamToken(streamToken, animeId, episodeNumber) : false;

    if (!isSessionValid && !isTokenValid) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(401).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Authentication Required - Aniflux Stream Guard</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: #090a0f; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; }
            .card { background: #12141c; border: 1px solid #232738; border-radius: 20px; padding: 40px 30px; max-width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
            .icon { width: 64px; height: 64px; border-radius: 18px; background: rgba(109, 59, 255, 0.15); border: 1px solid rgba(109, 59, 255, 0.35); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
            h1 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: #fff; }
            p { font-size: 13px; color: #9499ad; line-height: 1.6; margin-bottom: 24px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #6d3bff, #ff4db8); color: white; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-decoration: none; transition: transform 0.2s, opacity 0.2s; }
            .btn:hover { opacity: 0.9; transform: scale(1.03); }
            .footer-note { font-size: 11px; color: #5f6377; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🔒</div>
            <h1>Authentication Required</h1>
            <p>Direct stream hotlinking is restricted. You must be logged into an active Aniflux account to watch this episode.</p>
            <a href="/#/watch/${animeId}" class="btn" target="_top">Go to Aniflux Watch Room</a>
            <div class="footer-note">Aniflux Stream Security & DRM Protection</div>
          </div>
        </body>
        </html>
      `);
    }

    // Fetch episode stream details from DB
    const [epRows] = await db.query(
      `SELECT gumlet_url, gumlet_asset_id, stream_status, subtitle_tracks FROM episodes WHERE anime_id = ? AND episode_number = ?`,
      [animeId, episodeNumber]
    );

    let targetUrl = epRows?.[0]?.gumlet_url || (animeId <= 3 ? 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8' : '');
    let assetId = epRows?.[0]?.gumlet_asset_id || extractGumletAssetId(targetUrl) || (animeId <= 3 ? '65719bc42b91866ef114bca8' : '');

    if (!targetUrl && !assetId) {
      targetUrl = 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8';
      assetId = '65719bc42b91866ef114bca8';
    }

    const embedUrl = formatGumletEmbedUrl(targetUrl || assetId, {
      autoplay: req.query.autoplay !== 'false',
      preload: true,
      subtitles: true,
      branding: true,
      color: '6d3bff'
    });

    // Set strict anti-inspection, anti-hotlinking headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aniflux Secure Stream</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
          #player-frame { width: 100%; height: 100%; border: none; }
        </style>
      </head>
      <body oncontextmenu="return false;">
        <iframe
          id="player-frame"
          src="${embedUrl}"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
        <script>
          // Anti-inspect and anti-hotlink protections
          document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
          document.addEventListener('keydown', function(e) {
            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
              e.keyCode === 123 ||
              (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
              (e.ctrlKey && e.keyCode === 85)
            ) {
              e.preventDefault();
              return false;
            }
          });
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Error rendering secure player:', err);
    return res.status(500).send('Internal server error loading stream.');
  }
});

export default router;
