import { CommentsModel } from './comments.model.js';

export const CommentsController = {
  async getComments(req, res, next) {
    try {
      const animeId = parseInt(req.params.id || req.params.animeId, 10);
      const episodeNumber = parseInt(req.params.epNumber || req.params.episodeNumber || '1', 10);

      if (isNaN(animeId) || isNaN(episodeNumber)) {
        return res.status(400).json({ error: 'Invalid anime or episode parameter' });
      }

      const currentUserId = req.user?.user_id || null;
      const { totalComments, comments } = await CommentsModel.getCommentsByEpisode(animeId, episodeNumber, currentUserId);

      return res.json({
        success: true,
        animeId,
        episodeNumber,
        totalComments,
        comments
      });
    } catch (err) {
      next(err);
    }
  },

  async postComment(req, res, next) {
    try {
      const animeId = parseInt(req.params.id || req.params.animeId || req.body.animeId, 10);
      const episodeNumber = parseInt(req.params.epNumber || req.params.episodeNumber || req.body.episodeNumber || '1', 10);
      const { text, parentId, isSpoiler } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Comment text cannot be empty' });
      }

      if (text.trim().length > 1000) {
        return res.status(400).json({ error: 'Comment cannot exceed 1000 characters' });
      }

      const commentId = await CommentsModel.createComment({
        animeId,
        episodeNumber,
        userId: req.user.user_id,
        parentId: parentId ? parseInt(parentId, 10) : null,
        text: text.trim(),
        isSpoiler: Boolean(isSpoiler)
      });

      const newComment = {
        id: commentId,
        animeId,
        episodeNumber,
        userId: req.user.user_id,
        parentId: parentId || null,
        text: text.trim(),
        isSpoiler: Boolean(isSpoiler),
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: req.user.user_id,
          username: req.user.username,
          avatarUrl: req.user.avatar_url || null,
          avatarInitial: (req.user.username[0] || 'U').toUpperCase(),
          level: req.user.level || 1,
          role: req.user.role || 'member'
        },
        hasLiked: false,
        replies: []
      };

      return res.status(201).json({
        success: true,
        message: 'Comment posted successfully!',
        comment: newComment
      });
    } catch (err) {
      next(err);
    }
  },

  async toggleLike(req, res, next) {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }

      const result = await CommentsModel.toggleLike(commentId, req.user.user_id);
      return res.json({
        success: true,
        commentId,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteComment(req, res, next) {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ error: 'Invalid comment ID' });
      }

      const comment = await CommentsModel.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.user_id !== req.user.user_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to delete this comment' });
      }

      await CommentsModel.softDelete(commentId);
      return res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
      next(err);
    }
  }
};

export default CommentsController;
