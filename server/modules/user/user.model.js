import db from '../../config/db.js';
import { AnimeModel } from '../anime/anime.model.js';

export const UserModel = {
  async getFavorites(userId) {
    const [rows] = await db.query(
      `SELECT a.* FROM anime a
       JOIN favorites f ON a.anime_id = f.anime_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const favorites = [];
    for (const r of rows) {
      favorites.push(await AnimeModel.formatAnimeRow(db, r, true));
    }
    return favorites;
  },

  async addFavorite(userId, animeId) {
    await db.query(`INSERT IGNORE INTO favorites (user_id, anime_id) VALUES (?, ?)`, [userId, animeId]);
  },

  async removeFavorite(userId, animeId) {
    await db.query(`DELETE FROM favorites WHERE user_id = ? AND anime_id = ?`, [userId, animeId]);
  },

  async getBookmarks(userId) {
    const [rows] = await db.query(
      `SELECT a.* FROM anime a
       JOIN bookmarks b ON a.anime_id = b.anime_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    const bookmarks = [];
    for (const r of rows) {
      bookmarks.push(await AnimeModel.formatAnimeRow(db, r, true));
    }
    return bookmarks;
  },

  async addBookmark(userId, animeId) {
    await db.query(`INSERT IGNORE INTO bookmarks (user_id, anime_id) VALUES (?, ?)`, [userId, animeId]);
  },

  async removeBookmark(userId, animeId) {
    await db.query(`DELETE FROM bookmarks WHERE user_id = ? AND anime_id = ?`, [userId, animeId]);
  },

  async getPreferences(userId) {
    const [rows] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async updatePreferences(userId, patch) {
    const fields = [];
    const values = [];

    const allowed = ['preferred_audio', 'preferred_sub_lang', 'auto_next', 'auto_play', 'player_quality', 'theme', 'email_notifications'];
    for (const key of allowed) {
      if (patch[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(patch[key]);
      }
    }

    if (fields.length > 0) {
      values.push(userId);
      await db.query(
        `INSERT INTO user_preferences (user_id, ${fields.map(f => f.split(' ')[0]).join(', ')})
         VALUES (?, ${values.slice(0, -1).map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${fields.join(', ')}`,
        [userId, ...values]
      );
    }
  },

  async getLibrary(userId) {
    const [rows] = await db.query(
      `SELECT l.*, a.title, a.poster_url, a.type, a.episode_count, a.site_score
       FROM user_library l
       JOIN anime a ON l.anime_id = a.anime_id
       WHERE l.user_id = ?
       ORDER BY l.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async updateLibraryEntry(userId, animeId, { status, episodesWatched, userScore }) {
    await db.query(
      `INSERT INTO user_library (user_id, anime_id, status, episodes_watched, user_score)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         status = COALESCE(VALUES(status), status),
         episodes_watched = COALESCE(VALUES(episodes_watched), episodes_watched),
         user_score = COALESCE(VALUES(user_score), user_score),
         updated_at = NOW()`,
      [userId, animeId, status || 'plan_to_watch', episodesWatched || 0, userScore || null]
    );
  }
};

export default UserModel;
