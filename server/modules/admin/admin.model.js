import db from '../../config/db.js';

export const AdminModel = {
  async getStats() {
    const [animeCount] = await db.query('SELECT COUNT(*) as total FROM anime');
    const [userCount] = await db.query('SELECT COUNT(*) as total FROM users');
    const [epCount] = await db.query('SELECT COUNT(*) as total FROM episodes');
    const [brokenErrors] = await db.query('SELECT COUNT(*) as total FROM stream_error_logs WHERE is_resolved = FALSE');

    return {
      totalAnime: animeCount[0]?.total || 0,
      totalUsers: userCount[0]?.total || 0,
      totalEpisodes: epCount[0]?.total || 0,
      brokenLinksCount: brokenErrors[0]?.total || 0
    };
  },

  async getAllEpisodesForAudit() {
    const [rows] = await db.query(
      `SELECT e.anime_id, e.episode_number, e.title, e.gumlet_url, e.gumlet_asset_id, e.stream_status, e.error_message, a.title as anime_title
       FROM episodes e
       LEFT JOIN anime a ON e.anime_id = a.anime_id
       ORDER BY e.anime_id ASC, e.episode_number ASC`
    );
    return rows;
  },

  async getBrokenStreamReports() {
    const [rows] = await db.query(
      `SELECT l.*, a.title as anime_title 
       FROM stream_error_logs l
       LEFT JOIN anime a ON l.anime_id = a.anime_id
       ORDER BY l.created_at DESC LIMIT 100`
    );
    return rows;
  },

  async logStreamError({ animeId, episodeNumber, url, errorReason, httpStatus }) {
    await db.query(
      `INSERT INTO stream_error_logs (anime_id, episode_number, stream_url, error_reason, http_status)
       VALUES (?, ?, ?, ?, ?)`,
      [animeId, episodeNumber, url, errorReason, httpStatus || null]
    );
  },

  async updateEpisodeStreamStatus({ animeId, episodeNumber, streamStatus, lastCheckedAt, errorMessage, gumletAssetId }) {
    await db.query(
      `UPDATE episodes 
       SET stream_status = ?, last_checked_at = ?, error_message = ?, gumlet_asset_id = COALESCE(?, gumlet_asset_id)
       WHERE anime_id = ? AND episode_number = ?`,
      [streamStatus, lastCheckedAt || new Date(), errorMessage, gumletAssetId || null, animeId, episodeNumber]
    );
  },

  async resolveStreamError(logId) {
    await db.query(`UPDATE stream_error_logs SET is_resolved = TRUE WHERE log_id = ?`, [logId]);
  },

  async getUsers() {
    const [rows] = await db.query(
      `SELECT user_id, username, email, role, level, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 50`
    );
    return rows;
  }
};

export default AdminModel;
