import express from 'express';
import db from '../db.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function formatAnimeRow(conn, animeRow) {
  const animeId = animeRow.anime_id;

  // Studio
  let studioName = '';
  if (animeRow.studio_id) {
    const [studios] = await conn.query('SELECT name FROM studios WHERE studio_id = ?', [animeRow.studio_id]);
    if (studios.length > 0) studioName = studios[0].name;
  }

  // Producers
  let producerName = '';
  const [producers] = await conn.query(
    `SELECT p.name FROM producers p JOIN anime_producers ap ON p.producer_id = ap.producer_id WHERE ap.anime_id = ?`,
    [animeId]
  );
  if (producers.length > 0) producerName = producers[0].name;

  // Genres
  const [genres] = await conn.query(
    `SELECT g.name FROM genres g JOIN anime_genres ag ON g.genre_id = ag.genre_id WHERE ag.anime_id = ?`,
    [animeId]
  );
  const genreList = genres.map(g => g.name);

  // Tags
  const [tags] = await conn.query(
    `SELECT t.name FROM tags t JOIN anime_tags at ON t.tag_id = at.tag_id WHERE at.anime_id = ?`,
    [animeId]
  );
  const tagList = tags.map(t => t.name);

  // Episodes
  const [episodes] = await conn.query(
    `SELECT episode_number, title FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC`,
    [animeId]
  );
  const episodeTitles = episodes.map(e => e.title || `Episode ${e.episode_number}`);

  // Relations
  const [relations] = await conn.query(
    `SELECT relation_type, related_anime_id FROM related_anime WHERE anime_id = ?`,
    [animeId]
  );
  const relationList = relations.map(r => ({
    type: r.relation_type.split('_').map(capitalize).join(' '),
    animeId: r.related_anime_id
  }));

  // Mock staff & characters if none in DB
  const characters = [
    { name: 'Kaito Shiro', role: 'Main', va: 'Yuuki Kaji' },
    { name: 'Aria Vesper', role: 'Main', va: 'Ai Kayano' },
    { name: 'Lord Varath', role: 'Antagonist', va: 'Tomokazu Sugita' },
  ];
  const staff = [
    { name: 'Hiroshi Tanaka', role: 'Director' },
    { name: 'Kenji Watanabe', role: 'Series Composition' },
    { name: 'Yuki Sato', role: 'Character Design' },
  ];

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
    producer: producerName || 'Aniplex',
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
    characters,
    staff,
    episodeTitles: episodeTitles.length > 0 ? episodeTitles : Array.from({ length: animeRow.episode_count || 12 }, (_, i) => `Episode ${i + 1}`),
    relations: relationList
  };
}

// 1. GET CATALOG (/api/anime)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20')));
    const offset = (page - 1) * limit;

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM anime');
    const total = countResult[0].total;

    const [rows] = await db.query(
      `SELECT * FROM anime ORDER BY popularity_rank ASC, site_score DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const data = [];
    for (const row of rows) {
      data.push(await formatAnimeRow(db, row));
    }

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Fetch anime catalog error:', err);
    return res.status(500).json({ error: 'Failed to fetch anime catalog' });
  }
});

// 2. SEARCH ANIME (/api/anime/search)
router.get('/search', async (req, res) => {
  try {
    const queryStr = (req.query.q || '').toString().trim();
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20')));
    const offset = (page - 1) * limit;

    if (!queryStr) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    const searchPattern = `%${queryStr}%`;

    // Query main title, japanese_title, alternative titles, description
    const [countRes] = await db.query(
      `SELECT COUNT(DISTINCT a.anime_id) as total
       FROM anime a
       LEFT JOIN anime_alternative_titles alt ON a.anime_id = alt.anime_id
       WHERE a.title LIKE ? OR a.japanese_title LIKE ? OR a.description LIKE ? OR alt.title LIKE ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    const total = countRes[0].total;

    const [rows] = await db.query(
      `SELECT DISTINCT a.*
       FROM anime a
       LEFT JOIN anime_alternative_titles alt ON a.anime_id = alt.anime_id
       WHERE a.title LIKE ? OR a.japanese_title LIKE ? OR a.description LIKE ? OR alt.title LIKE ?
       ORDER BY a.popularity_rank ASC, a.site_score DESC
       LIMIT ? OFFSET ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]
    );

    const data = [];
    for (const row of rows) {
      data.push(await formatAnimeRow(db, row));
    }

    return res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Anime search error:', err);
    return res.status(500).json({ error: 'Failed to execute anime search' });
  }
});

// 3. GET ANIME BY ID (/api/anime/:id)
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) {
      return res.status(400).json({ error: 'Invalid anime ID' });
    }

    const [rows] = await db.query('SELECT * FROM anime WHERE anime_id = ?', [animeId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    const animeObj = await formatAnimeRow(db, rows[0]);

    let userState = { isFavorite: false, isBookmarked: false };

    if (req.user) {
      const [favs] = await db.query('SELECT 1 FROM favorites WHERE user_id = ? AND anime_id = ?', [req.user.user_id, animeId]);
      const [bms] = await db.query('SELECT 1 FROM bookmarks WHERE user_id = ? AND anime_id = ?', [req.user.user_id, animeId]);

      userState.isFavorite = favs.length > 0;
      userState.isBookmarked = bms.length > 0;
    }

    return res.json({ anime: animeObj, userState });
  } catch (err) {
    console.error('Fetch anime details error:', err);
    return res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

export default router;
