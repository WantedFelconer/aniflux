import crypto from 'crypto';
import db from '../config/db.js';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.aniflux_session;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tokenHash = hashToken(token);
    const [sessions] = await db.query(
      `SELECT s.session_id, s.token_hash, u.user_id, u.username, u.email, u.avatar_url, u.bio, u.level, u.role, u.created_at
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW() AND u.is_active = TRUE`,
      [tokenHash]
    );

    if (!sessions || sessions.length === 0) {
      res.clearCookie('aniflux_session');
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = sessions[0];
    req.sessionToken = token;
    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function optionalAuthenticate(req, res, next) {
  try {
    let token = req.cookies?.aniflux_session;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const tokenHash = hashToken(token);
      const [sessions] = await db.query(
        `SELECT s.session_id, s.token_hash, u.user_id, u.username, u.email, u.avatar_url, u.bio, u.level, u.role, u.created_at
         FROM user_sessions s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > NOW() AND u.is_active = TRUE`,
        [tokenHash]
      );
      if (sessions && sessions.length > 0) {
        req.user = sessions[0];
        req.sessionToken = token;
      }
    }
    next();
  } catch (err) {
    next();
  }
}

export async function requireAdmin(req, res, next) {
  try {
    await authenticate(req, res, () => {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
      }
      next();
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error in authorization' });
  }
}
