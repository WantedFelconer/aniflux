import db from '../../config/db.js';

export const AuthModel = {
  async findByEmailOrUsername(identifier) {
    const clean = identifier.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT user_id, username, email, password_hash, is_active, avatar_url, bio, level, role, created_at
       FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?`,
      [clean, clean]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const clean = email.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT user_id, username, email FROM users WHERE LOWER(email) = ?`,
      [clean]
    );
    return rows[0] || null;
  },

  async findByUsername(username) {
    const clean = username.trim().toLowerCase();
    const [rows] = await db.query(
      `SELECT user_id, username FROM users WHERE LOWER(username) = ?`,
      [clean]
    );
    return rows[0] || null;
  },

  async createUser({ username, email, passwordHash, role = 'member', level = 1 }) {
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash, role, level, is_active) VALUES (?, ?, ?, ?, ?, 1)`,
      [username.trim(), email.trim().toLowerCase(), passwordHash, role, level]
    );
    const userId = result.insertId;

    try {
      await db.query(`INSERT IGNORE INTO user_preferences (user_id) VALUES (?)`, [userId]);
    } catch (err) {
      console.warn('[AuthModel] User preferences init notice:', err.message);
    }

    return userId;
  },

  async createSession({ userId, tokenHash, ipAddress, userAgent, expiresAt }) {
    await db.query(
      `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tokenHash, ipAddress || null, userAgent || null, expiresAt]
    );
  },

  async revokeSession(tokenHash) {
    await db.query(`UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = ?`, [tokenHash]);
  },

  async revokeAllUserSessions(userId) {
    await db.query(`UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ?`, [userId]);
  },

  async createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidResetToken(tokenHash) {
    const [rows] = await db.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async markTokenUsed(tokenId) {
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [tokenId]);
  },

  async updatePassword(userId, passwordHash) {
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, userId]);
  }
};

export default AuthModel;
