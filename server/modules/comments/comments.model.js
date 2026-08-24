import db from '../../config/db.js';

export const CommentsModel = {
  async getCommentsByEpisode(animeId, episodeNumber, currentUserId = null) {
    const [rows] = await db.query(
      `SELECT 
        c.comment_id, c.anime_id, c.episode_number, c.user_id, c.parent_id,
        c.comment_text, c.is_spoiler, c.likes_count, c.created_at,
        u.username, u.avatar_url, u.level, u.role
       FROM episode_comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.anime_id = ? AND c.episode_number = ?
       ORDER BY c.created_at ASC`,
      [animeId, episodeNumber]
    );

    let likedCommentIds = new Set();
    if (currentUserId && rows.length > 0) {
      try {
        const commentIds = rows.map(r => r.comment_id);
        const [likes] = await db.query(
          `SELECT comment_id FROM episode_comment_likes WHERE user_id = ? AND comment_id IN (?)`,
          [currentUserId, commentIds]
        );
        likedCommentIds = new Set(likes.map(l => l.comment_id));
      } catch {}
    }

    const commentMap = new Map();
    const rootComments = [];

    for (const r of rows) {
      const formatted = {
        id: r.comment_id,
        animeId: r.anime_id,
        episodeNumber: r.episode_number,
        userId: r.user_id,
        parentId: r.parent_id,
        text: r.comment_text,
        isSpoiler: Boolean(r.is_spoiler),
        likesCount: r.likes_count || 0,
        createdAt: r.created_at,
        user: {
          id: r.user_id,
          username: r.username,
          avatarUrl: r.avatar_url,
          avatarInitial: (r.username[0] || 'U').toUpperCase(),
          level: r.level || 1,
          role: r.role || 'member'
        },
        hasLiked: likedCommentIds.has(r.comment_id),
        replies: []
      };

      commentMap.set(r.comment_id, formatted);
    }

    for (const r of rows) {
      const comment = commentMap.get(r.comment_id);
      if (r.parent_id && commentMap.has(r.parent_id)) {
        commentMap.get(r.parent_id).replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    }

    return {
      totalComments: rows.length,
      comments: rootComments.reverse()
    };
  },

  async createComment({ animeId, episodeNumber, userId, parentId = null, text, isSpoiler = false }) {
    const [result] = await db.query(
      `INSERT INTO episode_comments (anime_id, episode_number, user_id, parent_id, comment_text, is_spoiler)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [animeId, episodeNumber, userId, parentId, text.trim(), isSpoiler ? 1 : 0]
    );
    return result.insertId;
  },

  async findById(commentId) {
    const [rows] = await db.query(
      `SELECT c.*, u.username, u.avatar_url, u.level, u.role
       FROM episode_comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = ?`,
      [commentId]
    );
    return rows[0] || null;
  },

  async toggleLike(commentId, userId) {
    const [existing] = await db.query(
      `SELECT 1 FROM episode_comment_likes WHERE comment_id = ? AND user_id = ?`,
      [commentId, userId]
    );

    let hasLiked = false;
    if (existing && existing.length > 0) {
      await db.query(`DELETE FROM episode_comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, userId]);
      await db.query(`UPDATE episode_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE comment_id = ?`, [commentId]);
      hasLiked = false;
    } else {
      await db.query(`INSERT INTO episode_comment_likes (comment_id, user_id) VALUES (?, ?)`, [commentId, userId]);
      await db.query(`UPDATE episode_comments SET likes_count = likes_count + 1 WHERE comment_id = ?`, [commentId]);
      hasLiked = true;
    }

    const [updated] = await db.query('SELECT likes_count FROM episode_comments WHERE comment_id = ?', [commentId]);
    return {
      hasLiked,
      likesCount: updated[0]?.likes_count || 0
    };
  },

  async deleteComment(commentId) {
    await db.query(`DELETE FROM episode_comments WHERE comment_id = ?`, [commentId]);
  }
};

export default CommentsModel;
