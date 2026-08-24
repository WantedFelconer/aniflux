import db from '../../config/db.js';

export const StreamModel = {
  async findEpisodeStream(animeId, episodeNumber) {
    const [rows] = await db.query(
      `SELECT gumlet_url, gumlet_asset_id, stream_status, subtitle_tracks FROM episodes WHERE anime_id = ? AND episode_number = ?`,
      [animeId, episodeNumber]
    );
    return rows[0] || null;
  }
};

export default StreamModel;
