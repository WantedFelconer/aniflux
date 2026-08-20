import express from 'express';
import db from '../db.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { validateGumletUrl, formatGumletEmbedUrl, extractGumletAssetId, generateSignedGumletUrl } from '../services/gumletService.js';
import { streamSupervisor } from '../services/supervisor.js';

const router = express.Router();

// Apply optionalAuthenticate middleware
router.use(optionalAuthenticate);

// 1. GET SYSTEM / CATALOG STATS
router.get('/stats', async (req, res) => {
  try {
    const [animeCountRes] = await db.query('SELECT COUNT(*) as total FROM anime');
    const [userCountRes] = await db.query('SELECT COUNT(*) as total FROM users');
    const [epCountRes] = await db.query('SELECT COUNT(*) as total FROM episodes');
    const brokenLogs = await db.getBrokenStreamReports();
    const unresolvedErrors = brokenLogs.filter(l => !l.is_resolved);

    return res.json({
      stats: {
        totalAnime: animeCountRes[0]?.total || 0,
        totalUsers: userCountRes[0]?.total || 0,
        totalEpisodes: epCountRes[0]?.total || 0,
        brokenLinksCount: unresolvedErrors.length,
        streamingEngine: 'Gumlet Video Adaptive Player (HLS/Dash/MP4)',
        storageMode: process.env.DB_HOST ? 'MySQL Cloud' : 'In-Memory Mock',
        supervisorStatus: streamSupervisor.getStatus(),
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// 2. REAL-TIME GUMLET URL VALIDATION ENDPOINT
router.post('/episodes/validate', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        valid: false,
        error: 'Please provide a valid Gumlet video URL or Asset ID.'
      });
    }

    const validation = await validateGumletUrl(url.trim(), true);
    return res.json({
      success: true,
      url: url.trim(),
      ...validation
    });
  } catch (err) {
    console.error('Validate Gumlet URL error:', err);
    return res.status(500).json({
      valid: false,
      error: `Validation error: ${err.message}`
    });
  }
});

// 3. GET BROKEN STREAMS / HEALTH MONITOR REPORTS
router.get('/broken-links', async (req, res) => {
  try {
    const brokenLogs = await db.getBrokenStreamReports();
    const allEpisodes = await db.getAllEpisodesForAudit();
    const brokenEpisodes = allEpisodes.filter(e => e.stream_status === 'broken');

    return res.json({
      summary: {
        totalAudited: allEpisodes.length,
        healthyCount: allEpisodes.filter(e => e.stream_status === 'healthy').length,
        brokenCount: brokenEpisodes.length,
        unverifiedCount: allEpisodes.filter(e => e.stream_status === 'unverified').length,
        lastAudit: streamSupervisor.getStatus().lastAudit
      },
      brokenEpisodes,
      errorLogs: brokenLogs
    });
  } catch (err) {
    console.error('Fetch broken streams error:', err);
    return res.status(500).json({ error: 'Failed to fetch stream health reports' });
  }
});

// 4. TRIGGER INSTANT SELF-SUPERVISED CATALOG AUDIT
router.post('/broken-links/scan-now', async (req, res) => {
  try {
    const auditResult = await streamSupervisor.runAudit('admin_manual');
    return res.json({
      success: true,
      message: 'Self-supervised catalog stream audit completed!',
      audit: auditResult
    });
  } catch (err) {
    console.error('Trigger scan error:', err);
    return res.status(500).json({ error: 'Failed to run stream audit' });
  }
});

// 5. REPAIR / UPDATE A BROKEN STREAM LINK
router.post('/broken-links/repair', async (req, res) => {
  try {
    const { animeId, episodeNumber, newGumletUrl } = req.body;
    if (!animeId || !episodeNumber || !newGumletUrl) {
      return res.status(400).json({ error: 'animeId, episodeNumber, and newGumletUrl are required' });
    }

    const validation = await validateGumletUrl(newGumletUrl, true);
    const assetId = validation.assetId || extractGumletAssetId(newGumletUrl);
    const streamStatus = validation.valid ? 'healthy' : 'broken';

    await db.upsertEpisode({
      animeId: parseInt(animeId),
      episodeNumber: parseInt(episodeNumber),
      gumletUrl: newGumletUrl.trim(),
      gumletAssetId: assetId,
      streamStatus
    });

    return res.json({
      success: true,
      message: validation.valid
        ? `Episode stream repaired and verified as healthy! ✨`
        : `Stream updated, but validation reported: ${validation.error || 'Check URL'}`,
      streamStatus,
      embedUrl: formatGumletEmbedUrl(newGumletUrl),
      validation
    });
  } catch (err) {
    console.error('Repair broken link error:', err);
    return res.status(500).json({ error: 'Failed to repair stream link' });
  }
});

// 6. CREATE NEW ANIME
router.post('/anime', async (req, res) => {
  try {
    const {
      title,
      japaneseTitle,
      description,
      posterUrl,
      bannerUrl,
      type = 'TV',
      status = 'airing',
      episodeCount = 12,
      durationMinutes = 24,
      season = 'winter',
      seasonYear = 2024,
      siteScore = 8.5,
      malScore = 8.5,
      ageRating = 'PG-13',
      studio = 'Aniflux Studio',
      genres = ['Action', 'Fantasy'],
      tags = ['Adventure'],
      gumletUrl
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Anime title is required' });
    }

    let studioId = null;
    if (studio) {
      try {
        const [stRes] = await db.query(
          'INSERT INTO studios (name) VALUES (?) ON DUPLICATE KEY UPDATE studio_id=LAST_INSERT_ID(studio_id)',
          [studio]
        );
        studioId = stRes?.insertId || null;
      } catch {
        // Fallback
      }
    }

    const [insertResult] = await db.query(
      `INSERT INTO anime (
        title, japanese_title, description, poster_url, banner_url,
        type, status, episode_count, duration_minutes, season, season_year,
        site_score, mal_score, age_rating, studio_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        japaneseTitle?.trim() || '',
        description?.trim() || '',
        posterUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        bannerUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        type,
        status.toLowerCase(),
        parseInt(episodeCount) || 12,
        parseInt(durationMinutes) || 24,
        season.toLowerCase(),
        parseInt(seasonYear) || 2024,
        parseFloat(siteScore) || 8.5,
        parseFloat(malScore) || 8.5,
        ageRating,
        studioId
      ]
    );

    const newAnimeId = insertResult.insertId || Date.now();

    // Seed default episodes
    const totalEps = parseInt(episodeCount) || 12;
    for (let i = 1; i <= totalEps; i++) {
      const epGumlet = (i === 1 && gumletUrl) ? gumletUrl.trim() : null;
      const epAsset = epGumlet ? extractGumletAssetId(epGumlet) : null;
      await db.upsertEpisode({
        animeId: newAnimeId,
        episodeNumber: i,
        title: `Episode ${i}`,
        gumletUrl: epGumlet || '',
        gumletAssetId: epAsset || '',
        streamStatus: epGumlet ? 'healthy' : 'unverified'
      });
    }

    // Insert Genres
    if (Array.isArray(genres)) {
      for (const g of genres) {
        try {
          const slug = g.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const [gRes] = await db.query(
            'INSERT INTO genres (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE genre_id=LAST_INSERT_ID(genre_id)',
            [g, slug]
          );
          const gId = gRes?.insertId;
          if (gId) {
            await db.query('INSERT IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)', [newAnimeId, gId]);
          }
        } catch {}
      }
    }

    return res.status(201).json({
      success: true,
      message: `Anime "${title}" created successfully`,
      anime: {
        id: newAnimeId,
        title: title.trim(),
        titleJp: japaneseTitle || '',
        synopsis: description || '',
        poster: posterUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        banner: bannerUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        type,
        status: status === 'airing' ? 'Airing' : status === 'upcoming' ? 'Upcoming' : 'Completed',
        episodes: totalEps,
        duration: `${durationMinutes || 24} min`,
        season,
        year: parseInt(seasonYear) || 2024,
        rating: parseFloat(siteScore) || 8.5,
        malScore: parseFloat(malScore) || 8.5,
        contentRating: ageRating,
        studio,
        genres: Array.isArray(genres) ? genres : ['Action', 'Fantasy'],
        tags: Array.isArray(tags) ? tags : ['Adventure'],
        gumletUrl: gumletUrl || undefined,
        streamSources: gumletUrl ? {
          1: {
            gumletUrl: formatGumletEmbedUrl(gumletUrl),
            gumletAssetId: extractGumletAssetId(gumletUrl),
            streamStatus: 'healthy'
          }
        } : {}
      }
    });
  } catch (err) {
    console.error('Create anime error:', err);
    return res.status(500).json({ error: `Failed to create anime: ${err.message}` });
  }
});

// 7. UPDATE ANIME
router.put('/anime/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    const {
      title,
      japaneseTitle,
      description,
      posterUrl,
      bannerUrl,
      type,
      status,
      episodeCount,
      durationMinutes,
      season,
      seasonYear,
      siteScore,
      malScore,
      ageRating,
      studio
    } = req.body;

    let studioId = null;
    if (studio) {
      try {
        const [stRes] = await db.query(
          'INSERT INTO studios (name) VALUES (?) ON DUPLICATE KEY UPDATE studio_id=LAST_INSERT_ID(studio_id)',
          [studio]
        );
        studioId = stRes?.insertId || null;
      } catch {}
    }

    await db.query(
      `UPDATE anime SET
        title = COALESCE(?, title),
        japanese_title = COALESCE(?, japanese_title),
        description = COALESCE(?, description),
        poster_url = COALESCE(?, poster_url),
        banner_url = COALESCE(?, banner_url),
        type = COALESCE(?, type),
        status = COALESCE(?, status),
        episode_count = COALESCE(?, episode_count),
        duration_minutes = COALESCE(?, duration_minutes),
        season = COALESCE(?, season),
        season_year = COALESCE(?, season_year),
        site_score = COALESCE(?, site_score),
        mal_score = COALESCE(?, mal_score),
        age_rating = COALESCE(?, age_rating),
        studio_id = COALESCE(?, studio_id)
       WHERE anime_id = ?`,
      [
        title || null,
        japaneseTitle || null,
        description || null,
        posterUrl || null,
        bannerUrl || null,
        type || null,
        status ? status.toLowerCase() : null,
        episodeCount ? parseInt(episodeCount) : null,
        durationMinutes ? parseInt(durationMinutes) : null,
        season ? season.toLowerCase() : null,
        seasonYear ? parseInt(seasonYear) : null,
        siteScore ? parseFloat(siteScore) : null,
        malScore ? parseFloat(malScore) : null,
        ageRating || null,
        studioId,
        animeId
      ]
    );

    return res.json({
      success: true,
      message: `Anime #${animeId} updated successfully`
    });
  } catch (err) {
    console.error('Update anime error:', err);
    return res.status(500).json({ error: 'Failed to update anime' });
  }
});

// 8. DELETE ANIME
router.delete('/anime/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    await db.query('DELETE FROM episodes WHERE anime_id = ?', [animeId]);
    await db.query('DELETE FROM anime WHERE anime_id = ?', [animeId]);

    return res.json({
      success: true,
      message: `Anime #${animeId} deleted successfully`
    });
  } catch (err) {
    console.error('Delete anime error:', err);
    return res.status(500).json({ error: 'Failed to delete anime' });
  }
});

// 9. SIGNED STREAM TOKEN GENERATOR (VIDEO LINK PROTECTION)
router.get('/stream-token/:assetId', (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) return res.status(400).json({ error: 'Asset ID is required' });

    const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
    const signedUrl = generateSignedGumletUrl(assetId, {
      expiresInSeconds: 3600,
      userIp: clientIp
    });

    return res.json({
      success: true,
      assetId,
      signedUrl,
      expiresIn: 3600,
      protection: 'HMAC-SHA256 Token Auth + Domain Whitelisting Enabled'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate signed token' });
  }
});

export default router;
