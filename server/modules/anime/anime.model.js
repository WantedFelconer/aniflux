import db from '../../config/db.js';
import { extractGumletAssetId } from '../../services/gumletService.js';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const AnimeModel = {
  async formatAnimeRow(conn, row, isAuthenticated = false) {
    const animeId = row.anime_id;

    // Studio
    let studioName = row.studio_name || '';
    if (row.studio_id) {
      try {
        const [studios] = await conn.query('SELECT name FROM studios WHERE studio_id = ?', [row.studio_id]);
        if (studios && studios.length > 0) studioName = studios[0].name;
      } catch {}
    }

    // Producers
    let producerName = row.producer_name || '';
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
      title: row.title || 'Untitled Anime',
      titleJp: row.japanese_title || '',
      synopsis: row.description || '',
      genres: genreList.length > 0 ? genreList : (row.genres || ['Action', 'Fantasy']),
      tags: tagList.length > 0 ? tagList : (row.tags || ['Adventure']),
      rating: parseFloat(row.site_score) || 8.5,
      malScore: parseFloat(row.mal_score) || 8.5,
      popularity: row.popularity_rank || 1,
      membersK: 1200,
      studio: studioName || row.studio_name || 'Aniflux Studio',
      producer: producerName || 'Aniplex',
      year: row.season_year || 2024,
      season: row.season || 'Fall',
      episodes: row.episode_count || episodes.length || 12,
      currentEpisode: episodes.length > 0 ? episodes.length : (row.episode_count || 12),
      status: row.status || 'Airing',
      duration: row.duration_minutes ? `${row.duration_minutes} min` : '24 min',
      poster: row.poster_url || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      banner: row.banner_url || row.poster_url || 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      type: row.type || 'TV',
      source: row.source_type || 'Manga',
      contentRating: row.age_rating || 'PG-13',
      language: 'Both',
      isNew: row.status === 'Airing',
      isDub: true,
      gumletUrl: defaultGumletUrl,
      streamLocked: !isAuthenticated,
      episodeList: episodeTitles.length > 0 ? episodeTitles : Array.from({ length: row.episode_count || 12 }, (_, i) => `Episode ${i + 1}`),
      streamSources,
      relations: relationList
    };
  },

  async findAll({ search, genre, status, type, season, sort = 'popularity', page = 1, limit = 24 }, isAuthenticated = false) {
    const offset = (page - 1) * limit;
    let whereClauses = ['1=1'];
    let params = [];

    if (search) {
      const q = `%${search.trim().toLowerCase()}%`;
      whereClauses.push(`(
        LOWER(a.title) LIKE ? 
        OR LOWER(a.japanese_title) LIKE ? 
        OR LOWER(a.description) LIKE ?
        OR EXISTS (SELECT 1 FROM anime_alternative_titles alt WHERE alt.anime_id = a.anime_id AND LOWER(alt.title) LIKE ?)
      )`);
      params.push(q, q, q, q);
    }

    if (genre) {
      whereClauses.push(`EXISTS (
        SELECT 1 FROM anime_genres ag 
        JOIN genres g ON ag.genre_id = g.genre_id 
        WHERE ag.anime_id = a.anime_id AND LOWER(g.name) = LOWER(?)
      )`);
      params.push(genre);
    }

    if (status) {
      whereClauses.push(`LOWER(a.status) = LOWER(?)`);
      params.push(status);
    }

    if (type) {
      whereClauses.push(`LOWER(a.type) = LOWER(?)`);
      params.push(type);
    }

    if (season) {
      whereClauses.push(`LOWER(a.season) = LOWER(?)`);
      params.push(season);
    }

    let orderBy = 'a.popularity_rank ASC';
    if (sort === 'score' || sort === 'rating') orderBy = 'a.site_score DESC';
    if (sort === 'mal') orderBy = 'a.mal_score DESC';
    if (sort === 'newest') orderBy = 'a.season_year DESC, a.anime_id DESC';
    if (sort === 'title') orderBy = 'a.title ASC';

    const whereSql = whereClauses.join(' AND ');

    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM anime a WHERE ${whereSql}`, params);
    const total = countRows[0]?.total || 0;

    const [rows] = await db.query(
      `SELECT a.* FROM anime a WHERE ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const animeList = [];
    for (const row of rows) {
      animeList.push(await this.formatAnimeRow(db, row, isAuthenticated));
    }

    return {
      anime: animeList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async findById(id, isAuthenticated = false) {
    const [rows] = await db.query('SELECT * FROM anime WHERE anime_id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    return await this.formatAnimeRow(db, rows[0], isAuthenticated);
  },

  async createAnime(data) {
    const [result] = await db.query(
      `INSERT INTO anime (
        title, japanese_title, description, poster_url, banner_url,
        type, status, episode_count, duration_minutes, season, season_year,
        site_score, mal_score, age_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.japaneseTitle || data.titleJp || null,
        data.description || data.synopsis || null,
        data.posterUrl || data.poster || null,
        data.bannerUrl || data.banner || null,
        data.type || 'TV',
        data.status || 'Airing',
        data.episodeCount || data.episodes || 12,
        data.durationMinutes || 24,
        data.season || 'Fall',
        data.seasonYear || data.year || 2024,
        data.siteScore || data.rating || 8.5,
        data.malScore || 8.5,
        data.ageRating || data.contentRating || 'PG-13'
      ]
    );

    const animeId = result.insertId;

    if (data.genres && Array.isArray(data.genres)) {
      for (const g of data.genres) {
        try {
          const [gRows] = await db.query('SELECT genre_id FROM genres WHERE LOWER(name) = LOWER(?)', [g.trim()]);
          let genreId = gRows[0]?.genre_id;
          if (!genreId) {
            const [gIns] = await db.query('INSERT INTO genres (name, slug) VALUES (?, ?)', [g.trim(), g.trim().toLowerCase()]);
            genreId = gIns.insertId;
          }
          await db.query('INSERT IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)', [animeId, genreId]);
        } catch {}
      }
    }

    if (data.gumletUrl) {
      try {
        const assetId = extractGumletAssetId(data.gumletUrl);
        await db.query(
          `INSERT INTO episodes (anime_id, episode_number, title, gumlet_url, gumlet_asset_id, stream_status)
           VALUES (?, 1, 'Episode 1', ?, ?, 'healthy')
           ON DUPLICATE KEY UPDATE gumlet_url = VALUES(gumlet_url), gumlet_asset_id = VALUES(gumlet_asset_id)`,
          [animeId, data.gumletUrl, assetId]
        );
      } catch {}
    }

    return animeId;
  },

  async updateAnime(id, patch) {
    const fields = [];
    const values = [];

    if (patch.title !== undefined) { fields.push('title = ?'); values.push(patch.title); }
    if (patch.synopsis !== undefined || patch.description !== undefined) {
      fields.push('description = ?'); values.push(patch.synopsis || patch.description);
    }
    if (patch.status !== undefined) { fields.push('status = ?'); values.push(patch.status); }
    if (patch.rating !== undefined || patch.siteScore !== undefined) {
      fields.push('site_score = ?'); values.push(patch.rating || patch.siteScore);
    }
    if (patch.poster !== undefined || patch.posterUrl !== undefined) {
      fields.push('poster_url = ?'); values.push(patch.poster || patch.posterUrl);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(`UPDATE anime SET ${fields.join(', ')} WHERE anime_id = ?`, values);
    }
  },

  async deleteAnime(id) {
    await db.query('DELETE FROM anime WHERE anime_id = ?', [id]);
  },

  async updateEpisodeStreams(animeId, epNumber, { gumletUrl, gumletAssetId, streamStatus, errorMessage, subtitleTracks }) {
    const assetId = gumletAssetId || (gumletUrl ? extractGumletAssetId(gumletUrl) : null);
    const subTracksJson = subtitleTracks ? JSON.stringify(subtitleTracks) : null;

    await db.query(
      `INSERT INTO episodes (anime_id, episode_number, title, gumlet_url, gumlet_asset_id, stream_status, error_message, subtitle_tracks, last_checked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         gumlet_url = COALESCE(VALUES(gumlet_url), gumlet_url),
         gumlet_asset_id = COALESCE(VALUES(gumlet_asset_id), gumlet_asset_id),
         stream_status = COALESCE(VALUES(stream_status), stream_status),
         error_message = VALUES(error_message),
         subtitle_tracks = COALESCE(VALUES(subtitle_tracks), subtitle_tracks),
         last_checked_at = NOW()`,
      [animeId, epNumber, `Episode ${epNumber}`, gumletUrl || null, assetId || null, streamStatus || 'healthy', errorMessage || null, subTracksJson]
    );
  }
};

export default AnimeModel;
