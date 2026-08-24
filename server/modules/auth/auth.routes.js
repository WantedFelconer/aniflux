import express from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
