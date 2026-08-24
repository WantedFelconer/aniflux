import express from 'express';
import db from '../db.js';
import { optionalAuthenticate, requireAdmin } from '../middleware/auth.js';
import { validateGumletUrl, formatGumletEmbedUrl, extractGumletAssetId } from '../services/gumletService.js';

const router = express.Router();

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function formatAnimeRow(conn, animeRow, isAuthenticated = false) {
  const animeId = animeRow.anime_id;

  // Studio
  let studioName = animeRow.studio_name || '';
  if (animeRow.studio_id) {
    try {
      const [studios] = await conn.query('SELECT name FROM studios WHERE studio_id = ?', [animeRow.studio_id]);
      if (studios && studios.length > 0) studioName = studios[0].name;
    } catch {}
  }

  // Producers
  let producerName = animeRow.producer_name || '';
  try {
    const [producers] = await conn.query(
      `SELECT p.name FROM producers p JOIN anime_producers ap ON p.producer_id = ap.producer_id WHERE ap.anime_id = ?`,
      [animeId]
    );
    if (producers && producers.length > 0) producerName = producers[0].name;
  } catch {}

  // Genres
  let genreList = [];
  try {
    const [genres] = await conn.query(
      `SELECT g.name FROM genres g JOIN anime_genres ag ON g.genre_id = ag.genre_id WHERE ag.anime_id = ?`,
      [animeId]
    );
    if (genres && genres.length > 0) genreList = genres.map(g => g.name);
  } catch {}

  // Tags
  let tagList = [];
  try {
    const [tags] = await conn.query(
      `SELECT t.name FROM tags t JOIN anime_tags at ON t.tag_id = at.tag_id WHERE at.anime_id = ?`,
      [animeId]
    );
    if (tags && tags.length > 0) tagList = tags.map(t => t.name);
  } catch {}

  // Episodes
  let episodes = [];
  try {
    const [epRows] = await conn.query(
      `SELECT episode_number, title, gumlet_url, gumlet_asset_id, stream_status, subtitle_tracks, error_message
       FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC`,
      [animeId]
    );
    if (epRows && epRows.length > 0) episodes = epRows;
  } catch {}

  const episodeTitles = episodes.map(e => e.title || `Episode ${e.episode_number}`);
  const streamSources = {};

  // Only expose stream endpoints to authenticated users
  if (isAuthenticated) {
    for (const ep of episodes) {
      const targetUrl = ep.gumlet_url || (animeId <= 3 ? 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8' : '');
      const assetId = ep.gumlet_asset_id || extractGumletAssetId(targetUrl) || (animeId <= 3 ? '65719bc42b91866ef114bca8' : '');
      let subTracks = [];
      try {
        subTracks = typeof ep.subtitle_tracks === 'string' ? JSON.parse(ep.subtitle_tracks) : (ep.subtitle_tracks || []);
      } catch {}
      streamSources[ep.episode_number] = {
        playerUrl: `/api/stream/player/${animeId}/${ep.episode_number}`,
        gumletAssetId: assetId ? 'protected' : '',
        streamStatus: ep.stream_status || (targetUrl ? 'healthy' : 'unverified'),
        errorMessage: ep.error_message || null,
        subtitleTracks: Array.isArray(subTracks) ? subTracks : []
      };
    }
  }

  // Relations
  let relationList = [];
  try {
    const [relations] = await conn.query(
      `SELECT relation_type, related_anime_id FROM related_anime WHERE anime_id = ?`,
      [animeId]
    );
    if (relations && relations.length > 0) {
      relationList = relations.map(r => ({
        type: r.relation_type.split('_').map(capitalize).join(' '),
        animeId: r.related_anime_id
      }));
    }
  } catch {}

  const ep1 = episodes.find(e => e.episode_number === 1);
  const defaultGumletUrl = isAuthenticated
    ? (ep1?.gumlet_url || (animeId <= 3 ? 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8' : ''))
    : null;

  return {
    id: animeId,
    title: animeRow.title || 'Untitled Anime',
    titleJp: animeRow.japanese_title || '',
    synopsis: animeRow.description || '',
    genres: genreList.length > 0 ? genreList : (animeRow.genres || ['Action', 'Fantasy']),
    tags: tagList.length > 0 ? tagList : (animeRow.tags || ['Adventure']),
    rating: parseFloat(animeRow.site_score) || 8.5,
    malScore: parseFloat(animeRow.mal_score) || 8.5,
    popularity: animeRow.popularity_rank || 1,
    membersK: 1200,
    studio: studioName || animeRow.studio_name || 'Aniflux Studio',
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
    streamLocked: !isAuthenticated,
    characters: [
      { name: 'Kaito Shiro', role: 'Main', va: 'Yuuki Kaji' },
      { name: 'Aria Vesper', role: 'Main', va: 'Ai Kayano' },
      { name: 'Lord Varath', role: 'Antagonist', va: 'Tomokazu Sugita' },
    ],
    staff: [
      { name: 'Hiroshi Tanaka', role: 'Director' },
      { name: 'Kenji Watanabe', role: 'Series Composition' },
      { name: 'Yuki Sato', role: 'Character Design' },
    ],
    episodeTitles: episodeTitles.length > 0 ? episodeTitles : Array.from({ length: animeRow.episode_count || 12 }, (_, i) => `Episode ${i + 1}`),
    relations: relationList,
    playerUrl: isAuthenticated ? `/api/stream/player/${animeId}/1` : null,
    gumletUrl: defaultGumletUrl,
    streamSources
  };
}

// 1. GET CATALOG (/api/anime)
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const isAuthenticated = Boolean(req.user);
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '50')));
    const offset = (page - 1) * limit;

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM anime');
    const total = countResult[0]?.total || 0;

    const [rows] = await db.query(
      `SELECT * FROM anime ORDER BY anime_id DESC, site_score DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const data = [];
    for (const row of rows) {
      try {
        data.push(await formatAnimeRow(db, row, isAuthenticated));
      } catch (err) {
        console.error('Format row error for anime:', row.anime_id, err);
        data.push({
          id: row.anime_id,
          title: row.title,
          titleJp: row.japanese_title || '',
          synopsis: row.description || '',
          poster: row.poster_url,
          banner: row.banner_url,
          genres: ['Action', 'Fantasy'],
          tags: ['Adventure'],
          rating: parseFloat(row.site_score) || 8.5,
          year: row.season_year || 2024,
          episodes: row.episode_count || 12,
          status: 'Airing',
          streamLocked: !isAuthenticated
        });
      }
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
router.get('/search', optionalAuthenticate, async (req, res) => {
  try {
    const isAuthenticated = Boolean(req.user);
    const queryStr = (req.query.q || '').toString().trim();
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20')));
    const offset = (page - 1) * limit;

    if (!queryStr) {
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    const searchPattern = `%${queryStr}%`;

    const [countRes] = await db.query(
      `SELECT COUNT(DISTINCT a.anime_id) as total
       FROM anime a
       LEFT JOIN anime_alternative_titles alt ON a.anime_id = alt.anime_id
       WHERE a.title LIKE ? OR a.japanese_title LIKE ? OR a.description LIKE ? OR alt.title LIKE ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern]
    );
    const total = countRes[0]?.total || 0;

    const [rows] = await db.query(
      `SELECT DISTINCT a.*
       FROM anime a
       LEFT JOIN anime_alternative_titles alt ON a.anime_id = alt.anime_id
       WHERE a.title LIKE ? OR a.japanese_title LIKE ? OR a.description LIKE ? OR alt.title LIKE ?
       ORDER BY a.anime_id DESC
       LIMIT ? OFFSET ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]
    );

    const data = [];
    for (const row of rows) {
      try {
        data.push(await formatAnimeRow(db, row, isAuthenticated));
      } catch (err) {
        data.push({
          id: row.anime_id,
          title: row.title,
          titleJp: row.japanese_title || '',
          synopsis: row.description || '',
          poster: row.poster_url,
          banner: row.banner_url,
          genres: ['Action', 'Fantasy'],
          tags: ['Adventure'],
          rating: parseFloat(row.site_score) || 8.5,
          year: row.season_year || 2024,
          episodes: row.episode_count || 12,
          status: 'Airing',
          streamLocked: !isAuthenticated
        });
      }
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

    const isAuthenticated = Boolean(req.user);
    const animeObj = await formatAnimeRow(db, rows[0], isAuthenticated);

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

// 4. GET EPISODES WITH SECURE STREAMS (/api/anime/:id/episodes)
router.get('/:id/episodes', optionalAuthenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) {
      return res.status(400).json({ error: 'Invalid anime ID' });
    }

    const [animeRows] = await db.query('SELECT * FROM anime WHERE anime_id = ?', [animeId]);
    if (animeRows.length === 0) {
      return res.status(404).json({ error: 'Anime not found' });
    }

    const [episodes] = await db.query(
      `SELECT episode_number, title, gumlet_url, gumlet_asset_id, stream_status, last_checked_at, error_message, subtitle_tracks
       FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC`,
      [animeId]
    );

    const isAuthenticated = Boolean(req.user);

    const formattedEpisodes = episodes.map(ep => {
      const targetUrl = ep.gumlet_url || (animeId <= 3 ? 'https://play.gumlet.io/embed/65719bc42b91866ef114bca8' : '');
      const assetId = ep.gumlet_asset_id || extractGumletAssetId(targetUrl);

      if (!isAuthenticated) {
        return {
          episodeNumber: ep.episode_number,
          title: ep.title || `Episode ${ep.episode_number}`,
          playerUrl: null,
          gumletUrl: null,
          embedUrl: null,
          assetId: null,
          isLocked: true,
          requiresAuth: true,
          streamStatus: 'locked'
        };
      }

      return {
        episodeNumber: ep.episode_number,
        title: ep.title || `Episode ${ep.episode_number}`,
        playerUrl: `/api/stream/player/${animeId}/${ep.episode_number}`,
        gumletUrl: null, // Masked from direct client exposure
        embedUrl: `/api/stream/player/${animeId}/${ep.episode_number}`,
        assetId: assetId ? 'protected' : '',
        isLocked: false,
        requiresAuth: false,
        streamStatus: ep.stream_status || (targetUrl ? 'healthy' : 'unverified'),
        lastCheckedAt: ep.last_checked_at,
        errorMessage: ep.error_message,
        subtitleTracks: typeof ep.subtitle_tracks === 'string' ? JSON.parse(ep.subtitle_tracks) : ep.subtitle_tracks || []
      };
    });

    return res.json({
      animeId,
      animeTitle: animeRows[0].title,
      totalEpisodes: formattedEpisodes.length,
      streamLocked: !isAuthenticated,
      episodes: formattedEpisodes
    });
  } catch (err) {
    console.error('Fetch anime episodes error:', err);
    return res.status(500).json({ error: 'Failed to fetch anime episodes' });
  }
});

// 5. POST / UPDATE EPISODE WITH GUMLET LINK (/api/anime/:id/episodes)
router.post('/:id/episodes', optionalAuthenticate, async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    if (isNaN(animeId)) return res.status(400).json({ error: 'Invalid anime ID' });

    const {
      episodeNumber,
      title,
      gumletUrl,
      subtitleTracks,
      autoValidate = true
    } = req.body;

    const epNum = parseInt(episodeNumber);
    if (isNaN(epNum) || epNum < 1) {
      return res.status(400).json({ error: 'Valid episode number is required' });
    }

    let validationResult = { valid: true, status: 'unverified', assetId: null };
    if (gumletUrl && autoValidate) {
      validationResult = await validateGumletUrl(gumletUrl, true);
    }

    const assetId = validationResult.assetId || extractGumletAssetId(gumletUrl);
    const streamStatus = validationResult.valid ? 'healthy' : 'broken';
    const errorReason = validationResult.valid ? null : validationResult.error;

    await db.upsertEpisode({
      animeId,
      episodeNumber: epNum,
      title: title?.trim() || `Episode ${epNum}`,
      gumletUrl: gumletUrl?.trim() || '',
      gumletAssetId: assetId,
      streamStatus,
      subtitleTracks: subtitleTracks || []
    });

    if (!validationResult.valid && gumletUrl) {
      await db.logStreamError({
        animeId,
        episodeNumber: epNum,
        url: gumletUrl,
        errorReason,
        httpStatus: validationResult.httpStatus || 0
      });
    }

    return res.json({
      success: true,
      message: `Episode ${epNum} stream saved successfully!`,
      episode: {
        animeId,
        episodeNumber: epNum,
        title: title || `Episode ${epNum}`,
        gumletUrl,
        embedUrl: gumletUrl ? formatGumletEmbedUrl(gumletUrl) : '',
        assetId,
        streamStatus,
        validation: validationResult
      }
    });
  } catch (err) {
    console.error('Save episode stream error:', err);
    return res.status(500).json({ error: 'Failed to save episode stream' });
  }
});

export default router;
