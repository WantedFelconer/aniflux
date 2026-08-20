import express from 'express';
import db from '../db.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// 1. GET ALL COMMENTS FOR AN EPISODE
// Supports both /anime/:id/episodes/:epNumber/comments and /:id/episodes/:epNumber/comments
const handleGetComments = async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    const episodeNumber = parseInt(req.params.epNumber);
    const sort = req.query.sort === 'top' ? 'top' : 'newest';
    const currentUserId = req.user?.user_id || null;

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return res.status(400).json({ error: 'Valid anime ID and episode number are required' });
    }

    const orderBy = sort === 'top' ? 'c.likes_count DESC, c.created_at DESC' : 'c.created_at DESC';

    // Fetch all comments for this episode
    const [rows] = await db.query(
      `SELECT
        c.comment_id, c.anime_id, c.episode_number, c.user_id, c.parent_id,
        c.comment_text, c.is_spoiler, c.likes_count, c.created_at, c.updated_at,
        u.username, u.avatar_url, u.level, u.role
       FROM episode_comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.anime_id = ? AND c.episode_number = ?
       ORDER BY ${orderBy}`,
      [animeId, episodeNumber]
    );

    // Fetch user likes for these comments if user is logged in
    let likedCommentIds = new Set();
    if (currentUserId && rows && rows.length > 0) {
      try {
        const commentIds = rows.map(r => r.comment_id);
        const [likes] = await db.query(
          `SELECT comment_id FROM episode_comment_likes WHERE user_id = ? AND comment_id IN (?)`,
          [currentUserId, commentIds]
        );
        if (Array.isArray(likes)) {
          likedCommentIds = new Set(likes.map(l => l.comment_id));
        }
      } catch {
        // Fallback
      }
    }

    // Organize into top-level comments and nested replies
    const topLevelComments = [];
    const replyMap = new Map();

    if (Array.isArray(rows)) {
      for (const row of rows) {
        const formatted = {
          id: row.comment_id,
          animeId: row.anime_id,
          episodeNumber: row.episode_number,
          userId: row.user_id,
          parentId: row.parent_id,
          text: row.comment_text,
          isSpoiler: Boolean(row.is_spoiler),
          likesCount: row.likes_count || 0,
          createdAt: row.created_at,
          user: {
            id: row.user_id,
            username: row.username,
            avatarUrl: row.avatar_url,
            avatarInitial: (row.username?.[0] || 'U').toUpperCase(),
            level: row.level || 1,
            role: row.role || 'member'
          },
          hasLiked: likedCommentIds.has(row.comment_id),
          replies: []
        };

        if (!row.parent_id) {
          topLevelComments.push(formatted);
        } else {
          if (!replyMap.has(row.parent_id)) {
            replyMap.set(row.parent_id, []);
          }
          replyMap.get(row.parent_id).push(formatted);
        }
      }
    }

    // Attach replies
    for (const parent of topLevelComments) {
      if (replyMap.has(parent.id)) {
        parent.replies = replyMap.get(parent.id);
      }
    }

    return res.json({
      success: true,
      animeId,
      episodeNumber,
      totalComments: rows ? rows.length : 0,
      comments: topLevelComments
    });
  } catch (err) {
    console.error('Fetch episode comments error:', err);
    return res.status(500).json({ error: 'Failed to fetch episode comments' });
  }
};

router.get('/anime/:id/episodes/:epNumber/comments', optionalAuthenticate, handleGetComments);
router.get('/:id/episodes/:epNumber/comments', optionalAuthenticate, handleGetComments);
router.get('/', optionalAuthenticate, handleGetComments);

// 2. POST A NEW COMMENT FOR AN EPISODE (Registered Users Only)
const handlePostComment = async (req, res) => {
  try {
    const animeId = parseInt(req.params.id);
    const episodeNumber = parseInt(req.params.epNumber);
    const user = req.user;
    const { commentText, isSpoiler = false, parentId = null } = req.body;

    if (isNaN(animeId) || isNaN(episodeNumber)) {
      return res.status(400).json({ error: 'Valid anime ID and episode number are required' });
    }

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Please sign in or register to join the discussion.' });
    }

    if (commentText.trim().length > 2000) {
      return res.status(400).json({ error: 'Comment cannot exceed 2000 characters' });
    }

    const [insertResult] = await db.query(
      `INSERT INTO episode_comments (anime_id, episode_number, user_id, parent_id, comment_text, is_spoiler)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [animeId, episodeNumber, user.user_id, parentId ? parseInt(parentId) : null, commentText.trim(), Boolean(isSpoiler)]
    );

    const commentId = insertResult?.insertId || Date.now();

    const createdComment = {
      id: commentId,
      animeId,
      episodeNumber,
      userId: user.user_id,
      parentId: parentId ? parseInt(parentId) : null,
      text: commentText.trim(),
      isSpoiler: Boolean(isSpoiler),
      likesCount: 0,
      createdAt: new Date().toISOString(),
      user: {
        id: user.user_id,
        username: user.username,
        avatarUrl: user.avatar_url,
        avatarInitial: (user.username?.[0] || 'U').toUpperCase(),
        level: user.level || 1,
        role: user.role || 'member'
      },
      hasLiked: false,
      replies: []
    };

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully!',
      comment: createdComment
    });
  } catch (err) {
    console.error('Post comment error:', err);
    return res.status(500).json({ error: `Failed to post comment: ${err.message}` });
  }
};

router.post('/anime/:id/episodes/:epNumber/comments', optionalAuthenticate, handlePostComment);
router.post('/:id/episodes/:epNumber/comments', optionalAuthenticate, handlePostComment);
router.post('/', optionalAuthenticate, handlePostComment);

// 3. TOGGLE LIKE ON A COMMENT
router.post('/comments/:commentId/like', optionalAuthenticate, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const user = req.user;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Please log in to like comments' });
    }

    const userId = user.user_id;

    // Check if user already liked
    const [existing] = await db.query(
      'SELECT * FROM episode_comment_likes WHERE comment_id = ? AND user_id = ?',
      [commentId, userId]
    );

    let hasLiked = false;
    if (existing && existing.length > 0) {
      // Unlike
      await db.query('DELETE FROM episode_comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
      await db.query('UPDATE episode_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE comment_id = ?', [commentId]);
      hasLiked = false;
    } else {
      // Like
      await db.query('INSERT INTO episode_comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
      await db.query('UPDATE episode_comments SET likes_count = likes_count + 1 WHERE comment_id = ?', [commentId]);
      hasLiked = true;
    }

    const [commentRow] = await db.query('SELECT likes_count FROM episode_comments WHERE comment_id = ?', [commentId]);
    const likesCount = commentRow[0]?.likes_count || 0;

    return res.json({
      success: true,
      commentId,
      hasLiked,
      likesCount
    });
  } catch (err) {
    console.error('Like comment error:', err);
    return res.status(500).json({ error: 'Failed to update comment like' });
  }
});

// 4. DELETE A COMMENT
router.delete('/comments/:commentId', optionalAuthenticate, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const user = req.user;

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [commentRow] = await db.query('SELECT user_id FROM episode_comments WHERE comment_id = ?', [commentId]);
    if (!commentRow || commentRow.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentRow[0].user_id !== user.user_id && user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this comment' });
    }

    await db.query('DELETE FROM episode_comments WHERE comment_id = ? OR parent_id = ?', [commentId, commentId]);

    return res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;

