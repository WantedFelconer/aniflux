import express from 'express';
import { StreamController } from './stream.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router();

router.get('/token/:animeId/:episodeNumber', authenticate, StreamController.getToken);
router.get('/player/:animeId/:episodeNumber', optionalAuthenticate, StreamController.renderPlayer);

export default router;
