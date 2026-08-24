import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes.js';
import animeRoutes from './modules/anime/anime.routes.js';
import streamRoutes from './modules/stream/stream.routes.js';
import commentsRoutes from './modules/comments/comments.routes.js';
import userRoutes from './modules/user/user.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

import streamSupervisor from './services/supervisor.js';
import { errorHandler } from './middleware/errorHandler.js';
import db from './config/db.js';

dotenv.config();

// Start background stream health supervisor
streamSupervisor.start();

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT_API || '5000', 10);

// CORS configuration supporting local development and cloud deployments
const allowedOrigins = [
  'http://localhost:8443',
  'http://localhost:5173',
  'http://127.0.0.1:8443',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL))
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Domain API Modules
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/anime', '/anime', '/api/admin/anime', '/admin/anime'], animeRoutes);
app.use(['/api/stream', '/stream'], streamRoutes);
app.use(['/api/me', '/me'], userRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/anime/:id/episodes/:epNumber/comments', '/anime/:id/episodes/:epNumber/comments'], commentsRoutes);
app.use(['/api/comments', '/comments'], commentsRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], async (req, res) => {
  const isEnvConfigured = Boolean(process.env.DB_HOST);
  let dbStatus = 'In-Memory Fallback';
  let dbError = null;
  let latencyMs = null;
  let userCount = 0;
  let animeCount = 0;

  if (isEnvConfigured) {
    const start = Date.now();
    try {
      const [uRows] = await db.query('SELECT COUNT(*) as count FROM users');
      const [aRows] = await db.query('SELECT COUNT(*) as count FROM anime');
      latencyMs = Date.now() - start;
      dbStatus = 'MySQL Connected';
      userCount = uRows[0]?.count || 0;
      animeCount = aRows[0]?.count || 0;
    } catch (err) {
      dbStatus = 'MySQL Error';
      dbError = err.message;
    }
  }

  res.json({
    status: 'ok',
    service: 'Aniflux API',
    mode: dbStatus,
    database: {
      status: dbStatus,
      host: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 10)}...` : 'none',
      database: process.env.DB_NAME || 'aniflux',
      latencyMs,
      totalUsers: userCount,
      totalAnime: animeCount,
      error: dbError
    },
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Aniflux Backend API running on http://localhost:${PORT}`);
  });
}
