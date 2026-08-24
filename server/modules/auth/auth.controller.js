import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { AuthModel } from './auth.model.js';
import { hashToken } from '../../middleware/auth.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setSessionCookie(res, token) {
  res.cookie('aniflux_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function formatUserPayload(user) {
  return {
    id: user.user_id || user.id,
    username: user.username,
    email: user.email,
    avatarInitial: (user.username[0] || 'U').toUpperCase(),
    avatarUrl: user.avatar_url || null,
    bio: user.bio || 'Welcome to my Aniflux profile! 🚀',
    level: user.level || 1,
    xp: 150,
    xpMax: 1000,
    joinedDate: new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    role: (user.role || 'member').charAt(0).toUpperCase() + (user.role || 'member').slice(1)
  };
}

export const AuthController = {
  async register(req, res, next) {
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

      const existingEmail = await AuthModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email address already exists' });
      }

      const existingUsername = await AuthModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'This username is already taken' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await AuthModel.createUser({ username, email, passwordHash });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await AuthModel.createSession({
        userId,
        tokenHash,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt
      });

      setSessionCookie(res, rawToken);

      const userPayload = formatUserPayload({
        id: userId,
        username,
        email,
        level: 1,
        role: 'member',
        created_at: new Date()
      });

      return res.status(201).json({ user: userPayload, token: rawToken });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'An account with this username or email already exists' });
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Please enter your username/email and password' });
      }

      const user = await AuthModel.findByEmailOrUsername(emailOrUsername);
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.is_active) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await AuthModel.createSession({
        userId: user.user_id,
        tokenHash,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt
      });

      setSessionCookie(res, rawToken);

      return res.json({ user: formatUserPayload(user), token: rawToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      let token = req.cookies?.aniflux_session;
      if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        const tokenHash = hashToken(token);
        await AuthModel.revokeSession(tokenHash);
      }

      res.clearCookie('aniflux_session');
      return res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    const user = req.user;
    return res.json({ user: formatUserPayload(user) });
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
      }

      const emailNorm = email.trim().toLowerCase();
      const user = await AuthModel.findByEmail(emailNorm);

      if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await AuthModel.createPasswordResetToken({
          userId: user.user_id,
          tokenHash,
          expiresAt
        });

        const resetUrl = `${process.env.APP_URL || 'http://localhost:8443'}/reset-password?token=${rawToken}`;
        console.log(`\n========================================`);
        console.log(`[PASSWORD RESET LINK GENERATED]`);
        console.log(`User: ${user.username} (${emailNorm})`);
        console.log(`Reset Token: ${rawToken}`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log(`========================================\n`);

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
          try {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || '587', 10),
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
          } catch (smtpErr) {
            console.error('[SMTP] Failed to send email:', smtpErr.message);
          }
        }
      }

      return res.json({
        success: true,
        message: `If an account exists for ${emailNorm}, a password reset link has been issued.`
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const tokenHash = hashToken(token);
      const resetRecord = await AuthModel.findValidResetToken(tokenHash);

      if (!resetRecord) {
        return res.status(400).json({ error: 'Invalid or expired password reset token' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await AuthModel.updatePassword(resetRecord.user_id, newPasswordHash);
      await AuthModel.markTokenUsed(resetRecord.id);
      await AuthModel.revokeAllUserSessions(resetRecord.user_id);

      return res.json({ success: true, message: 'Password has been updated successfully. Please log in.' });
    } catch (err) {
      next(err);
    }
  }
};

export default AuthController;
