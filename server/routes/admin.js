import express from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply requireAdmin middleware to all routes in this router
router.use(requireAdmin);

// 1. GET SYSTEM / CATALOG STATS
router.get('/stats', async (req, res) => {
  try {
    const [animeCountRes] = await db.query('SELECT COUNT(*) as total FROM anime');
    const [userCountRes] = await db.query('SELECT COUNT(*) as total FROM users');
    const [epCountRes] = await db.query('SELECT COUNT(*) as total FROM episodes');

    return res.json({
      stats: {
        totalAnime: animeCountRes[0]?.total || 0,
        totalUsers: userCountRes[0]?.total || 0,
        totalEpisodes: epCountRes[0]?.total || 0,
        activeStreams: (animeCountRes[0]?.total || 0) * 2,
        storageMode: process.env.DB_HOST ? 'MySQL Cloud' : 'In-Memory Mock',
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// 2. CREATE NEW ANIME
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
      gdriveUrl,
      personalServerUrl
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Anime title is required' });
    }

    const [insertResult] = await db.query(
      `INSERT INTO anime (
        title, japanese_title, description, poster_url, banner_url,
        type, status, episode_count, duration_minutes, season, season_year,
        site_score, mal_score, age_rating, studio_name
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
        studio
      ]
    );

    const newAnimeId = insertResult.insertId;

    return res.status(201).json({
      success: true,
      message: `Anime "${title}" created successfully`,
      anime: {
        id: newAnimeId,
        title,
        titleJp: japaneseTitle || '',
        synopsis: description || '',
        poster: posterUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        banner: bannerUrl || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
        type,
        status: status === 'airing' ? 'Airing' : status === 'upcoming' ? 'Upcoming' : 'Completed',
        episodes: parseInt(episodeCount) || 12,
        duration: `${durationMinutes || 24} min`,
        season,
        year: parseInt(seasonYear) || 2024,
        rating: parseFloat(siteScore) || 8.5,
        malScore: parseFloat(malScore) || 8.5,
        contentRating: ageRating,
        studio,
        genres: Array.isArray(genres) ? genres : ['Action', 'Fantasy'],
        tags: Array.isArray(tags) ? tags : ['Adventure'],
        gdriveUrl,
        personalServerUrl
      }
    });
  } catch (err) {
    console.error('Create anime error:', err);
    return res.status(500).json({ error: 'Failed to create anime' });
  }
});

// 3. UPDATE ANIME
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

    await db.query(
      `UPDATE anime SET
        title = ?, japanese_title = ?, description = ?, poster_url = ?, banner_url = ?,
        type = ?, status = ?, episode_count = ?, duration_minutes = ?, season = ?,
        season_year = ?, site_score = ?, mal_score = ?, age_rating = ?, studio_name = ?
       WHERE anime_id = ?`,
      [
        title,
        japaneseTitle || '',
        description || '',
        posterUrl,
        bannerUrl,
        type || 'TV',
        status ? status.toLowerCase() : 'airing',
        parseInt(episodeCount) || 12,
        parseInt(durationMinutes) || 24,
        season ? season.toLowerCase() : 'winter',
        parseInt(seasonYear) || 2024,
        parseFloat(siteScore) || 8.5,
        parseFloat(malScore) || 8.5,
        ageRating || 'PG-13',
        studio || 'Aniflux Studio',
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

// 4. DELETE ANIME
router.delete('/anime/:id', async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

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

export default router;
