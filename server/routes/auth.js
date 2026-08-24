import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { authenticate, hashToken } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createSessionCookie(res, token) {
  res.cookie('aniflux_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    username = username.trim();
    email = email.trim().toLowerCase();

    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'Username must be between 3 and 32 characters' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check existing email
    const [existingEmail] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    // Check existing username
    const [existingUsername] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (existingUsername.length > 0) {
      return res.status(409).json({ error: 'This username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [insertResult] = await db.query(
      `INSERT INTO users (username, email, password_hash, role, level) VALUES (?, ?, ?, 'member', 1)`,
      [username, email, passwordHash]
    );

    const userId = insertResult.insertId;

    // Create user preferences
    await db.query(`INSERT IGNORE INTO user_preferences (user_id) VALUES (?)`, [userId]);

    // Create session
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tokenHash, req.ip || null, req.get('user-agent') || null, expiresAt]
    );

    createSessionCookie(res, rawToken);

    const userPayload = {
      id: userId,
      username,
      email,
      avatarInitial: (username[0] || 'A').toUpperCase(),
      bio: 'Welcome to my Aniflux profile! 🚀',
      level: 1,
      xp: 100,
      xpMax: 1000,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      role: 'Member'
    };

    return res.status(201).json({ user: userPayload, token: rawToken });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password' });
    }

    const inputClean = emailOrUsername.trim();

    const [users] = await db.query(
      `SELECT user_id, username, email, password_hash, is_active, avatar_url, bio, level, role, created_at
       FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`,
      [inputClean, inputClean]
    );

    if (users.length === 0 || !users[0].password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Create session
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [user.user_id, tokenHash, req.ip || null, req.get('user-agent') || null, expiresAt]
    );

    createSessionCookie(res, rawToken);

    const userPayload = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      avatarInitial: (user.username[0] || 'U').toUpperCase(),
      avatarUrl: user.avatar_url,
      bio: user.bio || 'Ready to stream the latest anime releases! ⚡',
      level: user.level || 1,
      xp: 150,
      xpMax: 1000,
      joinedDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      role: user.role || 'Member'
    };

    return res.json({ user: userPayload, token: rawToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 3. LOGOUT
router.post('/logout', async (req, res) => {
  try {
    let token = req.cookies?.aniflux_session;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const tokenHash = hashToken(token);
      await db.query(`UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = ?`, [tokenHash]);
    }

    res.clearCookie('aniflux_session');
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error during logout' });
  }
});

// 4. GET CURRENT USER (/me)
router.get('/me', authenticate, async (req, res) => {
  const u = req.user;
  const userPayload = {
    id: u.user_id,
    username: u.username,
    email: u.email,
    avatarInitial: (u.username[0] || 'U').toUpperCase(),
    avatarUrl: u.avatar_url,
    bio: u.bio || 'Ready to stream the latest anime releases! ⚡',
    level: u.level || 1,
    xp: 150,
    xpMax: 1000,
    joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    role: u.role || 'Member'
  };
  return res.json({ user: userPayload });
});

// 5. FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const emailNorm = email.trim().toLowerCase();
    const [users] = await db.query('SELECT user_id, username FROM users WHERE email = ?', [emailNorm]);

    if (users.length > 0) {
      const user = users[0];
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
        [user.user_id, tokenHash, expiresAt]
      );

      const resetUrl = `${process.env.APP_URL || 'http://localhost:8443'}/reset-password?token=${rawToken}`;
      console.log(`\n========================================`);
      console.log(`[PASSWORD RESET LINK GENERATED]`);
      console.log(`User: ${user.username} (${emailNorm})`);
      console.log(`Reset Token: ${rawToken}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log(`========================================\n`);

      // If SMTP configured, send email
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
            }
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Aniflux" <noreply@aniflux.io>',
            to: emailNorm,
            subject: 'Aniflux Password Reset Request',
            html: `<p>Hello <b>${user.username}</b>,</p>
                   <p>You requested a password reset for your Aniflux account.</p>
                   <p>Click the link below to set a new password:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>This link will expire in 1 hour.</p>`
          });
        } catch (emailErr) {
          console.error('Failed to send SMTP email:', emailErr.message);
        }
      }
    }

    return res.json({
      success: true,
      message: `If an account exists for ${emailNorm}, a password reset link has been issued.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const tokenHash = hashToken(token);

    const [tokens] = await db.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const resetRecord = tokens[0];
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newPasswordHash, resetRecord.user_id]);

    // Mark token used
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [resetRecord.id]);

    // Revoke active sessions for security
    await db.query('UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ?', [resetRecord.user_id]);

    return res.json({ success: true, message: 'Password has been updated successfully. Please log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
