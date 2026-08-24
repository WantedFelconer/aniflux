import express from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// All user library routes require authentication
router.use(authenticate);

router.get('/favorites', UserController.getFavorites);
router.post('/favorites/:animeId', UserController.addFavorite);
router.delete('/favorites/:animeId', UserController.removeFavorite);

router.get('/bookmarks', UserController.getBookmarks);
router.post('/bookmarks/:animeId', UserController.addBookmark);
router.delete('/bookmarks/:animeId', UserController.removeBookmark);

router.get('/preferences', UserController.getPreferences);
router.patch('/preferences', UserController.updatePreferences);

router.get('/library', UserController.getLibrary);
router.put('/library/:animeId', UserController.updateLibrary);

export default router;
