import express from 'express';
import { AnimeController } from './anime.controller.js';
import { optionalAuthenticate, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuthenticate, AnimeController.list);
router.get('/:id', optionalAuthenticate, AnimeController.getById);
router.post('/', requireAdmin, AnimeController.create);
router.patch('/:id', requireAdmin, AnimeController.update);
router.put('/:id', requireAdmin, AnimeController.update);
router.delete('/:id', requireAdmin, AnimeController.remove);
router.post('/:id/episodes/:epNumber/streams', requireAdmin, AnimeController.updateStreams);

export default router;
