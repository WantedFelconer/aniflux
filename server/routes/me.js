import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function formatAnimeRow(conn, animeRow) {
  const animeId = animeRow.anime_id;

  let studioName = '';
  if (animeRow.studio_id) {
    const [studios] = await conn.query('SELECT name FROM studios WHERE studio_id = ?', [animeRow.studio_id]);
    if (studios.length > 0) studioName = studios[0].name;
  }

  const [genres] = await conn.query(
    `SELECT g.name FROM genres g JOIN anime_genres ag ON g.genre_id = ag.genre_id WHERE ag.anime_id = ?`,
    [animeId]
  );
  const genreList = genres.map(g => g.name);

  const [tags] = await conn.query(
    `SELECT t.name FROM tags t JOIN anime_tags at ON t.tag_id = at.tag_id WHERE at.anime_id = ?`,
    [animeId]
  );
  const tagList = tags.map(t => t.name);

  const [episodes] = await conn.query(
    `SELECT episode_number, title FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC`,
    [animeId]
  );
  const episodeTitles = episodes.map(e => e.title || `Episode ${e.episode_number}`);

  return {
    id: animeId,
    title: animeRow.title,
    titleJp: animeRow.japanese_title || '',
    synopsis: animeRow.description || '',
    genres: genreList.length > 0 ? genreList : ['Action', 'Fantasy'],
    tags: tagList.length > 0 ? tagList : ['Adventure'],
    rating: parseFloat(animeRow.site_score) || 8.5,
    malScore: parseFloat(animeRow.mal_score) || 8.5,
    popularity: animeRow.popularity_rank || 1,
    membersK: 1200,
    studio: studioName || 'Aniflux Studio',
    producer: 'Aniplex',
    year: animeRow.season_year || 2024,
    episodes: animeRow.episode_count || episodeTitles.length || 12,
    status: animeRow.status === 'airing' ? 'Airing' : animeRow.status === 'upcoming' ? 'Upcoming' : 'Completed',
    duration: `${animeRow.duration_minutes || 24} min`,
    poster: animeRow.poster_url || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
    banner: animeRow.banner_url || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
    type: animeRow.type || 'TV',
    source: 'Light Novel',
    contentRating: animeRow.age_rating || 'PG-13',
    season: capitalize(animeRow.season) || 'Winter',
    isNew: animeRow.status === 'airing',
    isDub: true,
    characters: [],
    staff: [],
    episodeTitles: episodeTitles.length > 0 ? episodeTitles : Array.from({ length: animeRow.episode_count || 12 }, (_, i) => `Episode ${i + 1}`),
    relations: []
  };
}

// ---------------- FAVORITES ----------------

// GET /api/me/favorites
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.* FROM anime a
       JOIN favorites f ON a.anime_id = f.anime_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.user_id]
    );

    const favorites = [];
    for (const r of rows) {
      favorites.push(await formatAnimeRow(db, r));
    }

    return res.json({ favorites, animeIds: favorites.map(a => a.id) });
  } catch (err) {
    console.error('Fetch favorites error:', err);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/me/favorites/:animeId
router.post('/favorites/:animeId', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    const [animeRows] = await db.query('SELECT anime_id FROM anime WHERE anime_id = ?', [animeId]);
    if (animeRows.length === 0) return res.status(404).json({ error: 'Anime not found' });

    await db.query(
      'INSERT IGNORE INTO favorites (user_id, anime_id) VALUES (?, ?)',
      [req.user.user_id, animeId]
    );

    return res.json({ success: true, isFavorite: true, animeId });
  } catch (err) {
    console.error('Add favorite error:', err);
    return res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/me/favorites/:animeId
router.delete('/favorites/:animeId', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND anime_id = ?',
      [req.user.user_id, animeId]
    );

    return res.json({ success: true, isFavorite: false, animeId });
  } catch (err) {
    console.error('Remove favorite error:', err);
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// ---------------- BOOKMARKS ----------------

// GET /api/me/bookmarks
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.* FROM anime a
       JOIN bookmarks b ON a.anime_id = b.anime_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.user_id]
    );

    const bookmarks = [];
    for (const r of rows) {
      bookmarks.push(await formatAnimeRow(db, r));
    }

    return res.json({ bookmarks, animeIds: bookmarks.map(a => a.id) });
  } catch (err) {
    console.error('Fetch bookmarks error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// POST /api/me/bookmarks/:animeId
router.post('/bookmarks/:animeId', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    const [animeRows] = await db.query('SELECT anime_id FROM anime WHERE anime_id = ?', [animeId]);
    if (animeRows.length === 0) return res.status(404).json({ error: 'Anime not found' });

    await db.query(
      'INSERT IGNORE INTO bookmarks (user_id, anime_id) VALUES (?, ?)',
      [req.user.user_id, animeId]
    );

    return res.json({ success: true, isBookmarked: true, animeId });
  } catch (err) {
    console.error('Add bookmark error:', err);
    return res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// DELETE /api/me/bookmarks/:animeId
router.delete('/bookmarks/:animeId', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    await db.query(
      'DELETE FROM bookmarks WHERE user_id = ? AND anime_id = ?',
      [req.user.user_id, animeId]
    );

    return res.json({ success: true, isBookmarked: false, animeId });
  } catch (err) {
    console.error('Remove bookmark error:', err);
    return res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// ---------------- USER LIBRARY ----------------

// GET /api/me/library
router.get('/library', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, a.* FROM user_library l
       JOIN anime a ON l.anime_id = a.anime_id
       WHERE l.user_id = ?
       ORDER BY l.updated_at DESC`,
      [req.user.user_id]
    );

    const library = [];
    for (const row of rows) {
      const animeFormatted = await formatAnimeRow(db, row);
      library.push({
        anime: animeFormatted,
        status: row.status,
        episodesWatched: row.episodes_watched,
        score: row.score ? parseFloat(row.score) : null,
        addedAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime()
      });
    }

    return res.json({ library });
  } catch (err) {
    console.error('Fetch user library error:', err);
    return res.status(500).json({ error: 'Failed to fetch user library' });
  }
});

// POST /api/me/library
router.post('/library', authenticate, async (req, res) => {
  try {
    const { animeId, status, episodesWatched, score } = req.body;
    const aId = parseInt(animeId);

    if (isNaN(aId)) return res.status(400).json({ error: 'Invalid anime ID' });

    const validStatuses = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid library status' });
    }

    await db.query(
      `INSERT INTO user_library (user_id, anime_id, status, episodes_watched, score)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         episodes_watched = VALUES(episodes_watched),
         score = VALUES(score),
         updated_at = NOW()`,
      [req.user.user_id, aId, status, episodesWatched || 0, score || null]
    );

    return res.json({ success: true, animeId: aId, status });
  } catch (err) {
    console.error('Update library error:', err);
    return res.status(500).json({ error: 'Failed to update library' });
  }
});

// DELETE /api/me/library/:animeId
router.delete('/library/:animeId', authenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    await db.query('DELETE FROM user_library WHERE user_id = ? AND anime_id = ?', [req.user.user_id, animeId]);

    return res.json({ success: true, animeId });
  } catch (err) {
    console.error('Remove from library error:', err);
    return res.status(500).json({ error: 'Failed to remove from library' });
  }
});

export default router;
