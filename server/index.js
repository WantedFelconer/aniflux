import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import animeRoutes from './routes/anime.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';
import commentsRoutes from './routes/comments.js';
import streamSupervisor from './services/supervisor.js';
import db from './db.js';

dotenv.config();

// Start background stream health supervisor
streamSupervisor.start();

const app = express();
const PORT = process.env.BACKEND_PORT || process.env.PORT_API || 5000;

// CORS setup supporting local development and Vercel deployments
const allowedOrigins = [
  'http://localhost:8443',
  'http://localhost:5173',
  'http://127.0.0.1:8443',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
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

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous limit to prevent false positives during active browsing
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/anime/:id/episodes/:epNumber/comments', commentsRoutes);
app.use('/api', commentsRoutes);

// Health check endpoint with live database verification
app.get('/api/health', async (req, res) => {
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
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Aniflux Backend API running on http://localhost:${PORT}`);
  });
}
