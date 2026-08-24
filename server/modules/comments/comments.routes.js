import express from 'express';
import { CommentsController } from './comments.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Mounted at:
// 1. /api/anime/:id/episodes/:epNumber/comments
// 2. /api/comments/:animeId/:episodeNumber
// 3. /api/comments/:commentId/like

router.get('/', optionalAuthenticate, CommentsController.getComments);
router.post('/', authenticate, CommentsController.postComment);
router.get('/:animeId/:episodeNumber', optionalAuthenticate, CommentsController.getComments);
router.post('/like/:commentId', authenticate, CommentsController.toggleLike);
router.post('/:commentId/like', authenticate, CommentsController.toggleLike);
router.delete('/:commentId', authenticate, CommentsController.deleteComment);

export default router;
