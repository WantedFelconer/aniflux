import express from 'express';
import { AdminController } from './admin.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.js';

const router = express.Router();

router.use(optionalAuthenticate);

router.get('/stats', AdminController.getStats);
router.post('/episodes/validate', AdminController.validateGumlet);
router.get('/broken-links', AdminController.getBrokenStreams);
router.post('/broken-links/scan-now', AdminController.scanNow);
router.post('/stream-errors/:id/resolve', AdminController.resolveError);
router.get('/users', AdminController.getUsers);

export default router;
