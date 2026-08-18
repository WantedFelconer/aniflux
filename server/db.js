import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Standard MySQL Pool setup
let pool = null;

const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || 'aniflux';

if (dbHost) {
  try {
    const sslConfig = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || dbHost.includes('tidb') || dbHost.includes('aiven'))
      ? { rejectUnauthorized: false }
      : undefined;

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000
    });
  } catch (e) {
    console.warn('MySQL pool initialization error, using in-memory fallback:', e.message);
  }
}

// In-Memory Fallback Dataset for Zero-Config Vercel Free Tier Deployment
const memoryDb = {
  users: [
    {
      user_id: 1,
      username: 'demo_user',
      email: 'demo@aniflux.io',
      password_hash: '$2a$10$w8T0i/E1OkyVmsfT.wR/0.U3q0G18R8h/vF3k3x3B8uHw1gR8r9.', // "password123"
      is_active: 1,
      avatar_url: null,
      bio: 'Ready to stream the latest anime releases! ⚡',
      level: 5,
      role: 'member',
      created_at: new Date('2024-01-01')
    },
    {
      user_id: 2,
      username: 'admin',
      email: 'admin@aniflux.io',
      password_hash: '$2b$10$LXaF0ZEOmg1Z7F/rjgDKP.S6rkxOj8HF0bgG4C1eEKhdUmxnQjemm', // "admin123"
      is_active: 1,
      avatar_url: null,
      bio: 'Aniflux System Administrator 🛡️',
      level: 99,
      role: 'admin',
      created_at: new Date('2024-01-01')
    }
  ],
  sessions: [],
  resetTokens: [],
  favorites: new Set(),
  bookmarks: new Set(),
  library: new Map(),
  anime: [
    {
      anime_id: 1, title: 'Void Chronicle: Reborn', japanese_title: 'ヴォイド・クロニクル：リボーン',
      description: 'After dying at the hands of a corrupt god, Kaito Shiro awakens in a world between worlds...',
      site_score: 9.2, mal_score: 9.1, popularity_rank: 3, studio_name: 'Trigger', producer_name: 'Aniplex', season_year: 2024, episode_count: 24,
      status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'winter',
      poster_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Action', 'Fantasy', 'Isekai'], tags: ['OP Protagonist', 'Dark Fantasy', 'Spirit World'],
      episodes: ['The Awakening', 'Into the Void', 'First Alliance', 'The Price of Power']
    },
    {
      anime_id: 2, title: 'Celestial Blades', japanese_title: 'セレスティアル・ブレード',
      description: 'Seven divine swords were scattered across the mortal realm after the gods fell silent...',
      site_score: 8.8, mal_score: 8.7, popularity_rank: 11, studio_name: 'Wit Studio', producer_name: 'Production IG', season_year: 2024, episode_count: 13,
      status: 'completed', duration_minutes: 23, type: 'TV', age_rating: 'PG-13', season: 'spring',
      poster_url: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Action', 'Supernatural', 'Mystery'], tags: ['Sword Fighting', 'Divine Power'],
      episodes: ['First Blade', 'Edge of Memory', 'The Second Seal']
    },
    {
      anime_id: 3, title: 'Aurora Protocol', japanese_title: 'オーロラ・プロトコル',
      description: 'In 2147, a global blackout erases all digital memory. A team of neural-linked hackers...',
      site_score: 9.0, mal_score: 8.9, popularity_rank: 7, studio_name: 'Production I.G', producer_name: 'Bandai Namco', season_year: 2024, episode_count: 26,
      status: 'airing', duration_minutes: 25, type: 'TV', age_rating: 'R-17+', season: 'summer',
      poster_url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Sci-Fi', 'Psychological', 'Thriller'], tags: ['Cyberpunk', 'AI', 'Hacking'],
      episodes: ['Blackout', 'Ghost Data', 'The Last Node']
    },
    {
      anime_id: 4, title: 'Silhouette Garden', japanese_title: 'シルエット・ガーデン',
      description: 'Yuki transfers to a prestigious art academy and discovers that the garden at its center...',
      site_score: 8.5, mal_score: 8.4, popularity_rank: 18, studio_name: 'KyoAni', producer_name: 'Kadokawa', season_year: 2023, episode_count: 12,
      status: 'completed', duration_minutes: 22, type: 'TV', age_rating: 'PG', season: 'fall',
      poster_url: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Romance', 'Mystery', 'Slice of Life'], tags: ['Time Travel', 'Art', 'School'],
      episodes: ['The Transfer', 'The Garden', 'Two Worlds']
    },
    {
      anime_id: 5, title: 'Iron Summit', japanese_title: 'アイアン・サミット',
      description: 'A disgraced general assembles a band of outcasts to defend the last free city...',
      site_score: 8.7, mal_score: 8.6, popularity_rank: 9, studio_name: 'Ufotable', producer_name: 'Shueisha', season_year: 2024, episode_count: 24,
      status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'winter',
      poster_url: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Action', 'Military', 'Fantasy'], tags: ['War', 'Strategy', 'Dark Fantasy'],
      episodes: ['Fallen General', 'The Outcasts', 'Iron Wall']
    },
    {
      anime_id: 6, title: 'Phantom Accord', japanese_title: 'ファントム・アコード',
      description: 'A musician with synesthesia hears the hidden feelings of spirits...',
      site_score: 8.9, mal_score: 8.8, popularity_rank: 14, studio_name: 'CloverWorks', producer_name: 'Avex', season_year: 2024, episode_count: 13,
      status: 'completed', duration_minutes: 23, type: 'TV', age_rating: 'PG-13', season: 'spring',
      poster_url: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Supernatural', 'Music', 'Drama'], tags: ['Spirits', 'Music', 'Melancholy'],
      episodes: ['First Note', 'Spirit Song', 'The Grudge Keeper']
    },
    {
      anime_id: 7, title: 'Neon Requiem', japanese_title: 'ネオン・レクイエム',
      description: 'In a dystopian megacity, a detective with perfect recall investigates a series of impossible murders...',
      site_score: 9.3, mal_score: 9.2, popularity_rank: 2, studio_name: 'MAPPA', producer_name: 'Dentsu', season_year: 2024, episode_count: 12,
      status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'summer',
      poster_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Mystery', 'Sci-Fi', 'Psychological'], tags: ['Neo-Noir', 'Detective', 'Conspiracy'],
      episodes: ['The Dead Don\'t Stay Dead', 'Case Zero', 'Perfect Recall']
    },
    {
      anime_id: 8, title: "Dragon's Meridian", japanese_title: 'ドラゴンズ・メリディアン',
      description: 'When the ancient Dragon Meridian — a mystical ley line — begins fracturing...',
      site_score: 8.6, mal_score: 8.5, popularity_rank: 13, studio_name: 'Bones', producer_name: 'Aniplex', season_year: 2023, episode_count: 25,
      status: 'completed', duration_minutes: 24, type: 'TV', age_rating: 'PG-13', season: 'fall',
      poster_url: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
      banner_url: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
      genres: ['Fantasy', 'Action', 'Adventure'], tags: ['Dragons', 'Politics', 'War'],
      episodes: ['The First Fracture', 'Three Thrones', 'Meridian\'s Call']
    }
  ]
};

let userIdCounter = memoryDb.users.length + 1;

async function executeMemoryQuery(sql, params = []) {
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. SELECT COUNT(*) as total FROM anime
  if (cleanSql.startsWith('SELECT COUNT(*) as total FROM anime')) {
    return [[{ total: memoryDb.anime.length }]];
  }

  // 2. Anime catalog / list
  if (cleanSql.includes('FROM anime') && !cleanSql.includes('WHERE')) {
    let limit = 20;
    let offset = 0;
    if (params.length >= 2) {
      limit = params[0];
      offset = params[1];
    }
    const sliced = memoryDb.anime.slice(offset, offset + limit);
    return [sliced];
  }

  // 3. Search count
  if (cleanSql.includes('SELECT COUNT(DISTINCT a.anime_id) as total FROM anime')) {
    const q = (params[0] || '').replace(/%/g, '').toLowerCase();
    const count = memoryDb.anime.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.japanese_title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    ).length;
    return [[{ total: count }]];
  }

  // 4. Search anime
  if (cleanSql.includes('SELECT DISTINCT a.* FROM anime')) {
    const q = (params[0] || '').replace(/%/g, '').toLowerCase();
    const matches = memoryDb.anime.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.japanese_title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
    const limit = params[4] || 20;
    const offset = params[5] || 0;
    return [matches.slice(offset, offset + limit)];
  }

  // 5. GET anime by ID
  if (cleanSql.includes('FROM anime WHERE anime_id = ?')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0]));
    return [anime ? [anime] : []];
  }

  // Helper getters for studios, producers, genres, tags, episodes, relations
  if (cleanSql.startsWith('SELECT name FROM studios WHERE studio_id = ?')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0])) || memoryDb.anime[0];
    return [[{ name: anime.studio_name || 'Aniflux Studio' }]];
  }

  if (cleanSql.includes('FROM producers p JOIN anime_producers')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0])) || memoryDb.anime[0];
    return [[{ name: anime.producer_name || 'Aniplex' }]];
  }

  if (cleanSql.includes('FROM genres g JOIN anime_genres')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0]));
    const genres = (anime?.genres || ['Action', 'Fantasy']).map(g => ({ name: g }));
    return [genres];
  }

  if (cleanSql.includes('FROM tags t JOIN anime_tags')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0]));
    const tags = (anime?.tags || ['Adventure']).map(t => ({ name: t }));
    return [tags];
  }

  if (cleanSql.includes('FROM episodes WHERE anime_id = ?')) {
    const anime = memoryDb.anime.find(a => a.anime_id === parseInt(params[0]));
    const epList = (anime?.episodes || ['Episode 1']).map((title, idx) => ({ episode_number: idx + 1, title }));
    return [epList];
  }

  if (cleanSql.includes('FROM related_anime WHERE anime_id = ?')) {
    return [[]];
  }

  // 6. User Check (email or username)
  if (cleanSql.includes('FROM users WHERE email = ?') || cleanSql.includes('FROM users WHERE username = ?')) {
    const user = memoryDb.users.find(u => u.email === params[0] || u.username === params[0]);
    return [user ? [user] : []];
  }

  if (cleanSql.includes('FROM users WHERE email = ? OR username = ?')) {
    const input = (params[0] || '').toLowerCase();
    const user = memoryDb.users.find(u => u.email.toLowerCase() === input || u.username.toLowerCase() === input);
    return [user ? [user] : []];
  }

  // 7. INSERT User
  if (cleanSql.startsWith('INSERT INTO users')) {
    const newUser = {
      user_id: userIdCounter++,
      username: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'member',
      level: params[4] || 1,
      is_active: 1,
      avatar_url: null,
      bio: 'Welcome to my Aniflux profile! 🚀',
      created_at: new Date()
    };
    memoryDb.users.push(newUser);
    return [{ insertId: newUser.user_id }];
  }

  // 8. INSERT Session
  if (cleanSql.startsWith('INSERT INTO user_sessions')) {
    const session = {
      session_id: memoryDb.sessions.length + 1,
      user_id: params[0],
      token_hash: params[1],
      expires_at: params[4],
      revoked_at: null
    };
    memoryDb.sessions.push(session);
    return [{ insertId: session.session_id }];
  }

  // 9. Session Auth Check
  if (cleanSql.includes('FROM user_sessions s JOIN users u')) {
    const session = memoryDb.sessions.find(s => s.token_hash === params[0] && !s.revoked_at && new Date(s.expires_at) > new Date());
    if (session) {
      const user = memoryDb.users.find(u => u.user_id === session.user_id);
      if (user && user.is_active) {
        return [[{ ...user, session_id: session.session_id, token_hash: session.token_hash }]];
      }
    }
    return [[]];
  }

  // 10. Logout Session
  if (cleanSql.startsWith('UPDATE user_sessions SET revoked_at')) {
    const sess = memoryDb.sessions.find(s => s.token_hash === params[0]);
    if (sess) sess.revoked_at = new Date();
    return [{ affectedRows: 1 }];
  }

  // 11. Favorites
  if (cleanSql.includes('FROM anime a JOIN favorites f')) {
    const userId = params[0];
    const favAnimeIds = Array.from(memoryDb.favorites)
      .filter(key => key.startsWith(`${userId}:`))
      .map(key => parseInt(key.split(':')[1]));
    const rows = memoryDb.anime.filter(a => favAnimeIds.includes(a.anime_id));
    return [rows];
  }

  if (cleanSql.startsWith('INSERT IGNORE INTO favorites')) {
    memoryDb.favorites.add(`${params[0]}:${params[1]}`);
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.startsWith('DELETE FROM favorites')) {
    memoryDb.favorites.delete(`${params[0]}:${params[1]}`);
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.includes('FROM favorites WHERE user_id = ? AND anime_id = ?')) {
    const has = memoryDb.favorites.has(`${params[0]}:${params[1]}`);
    return [has ? [{ 1: 1 }] : []];
  }

  // 12. Bookmarks
  if (cleanSql.includes('FROM anime a JOIN bookmarks b')) {
    const userId = params[0];
    const bmAnimeIds = Array.from(memoryDb.bookmarks)
      .filter(key => key.startsWith(`${userId}:`))
      .map(key => parseInt(key.split(':')[1]));
    const rows = memoryDb.anime.filter(a => bmAnimeIds.includes(a.anime_id));
    return [rows];
  }

  if (cleanSql.startsWith('INSERT IGNORE INTO bookmarks')) {
    memoryDb.bookmarks.add(`${params[0]}:${params[1]}`);
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.startsWith('DELETE FROM bookmarks')) {
    memoryDb.bookmarks.delete(`${params[0]}:${params[1]}`);
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.includes('FROM bookmarks WHERE user_id = ? AND anime_id = ?')) {
    const has = memoryDb.bookmarks.has(`${params[0]}:${params[1]}`);
    return [has ? [{ 1: 1 }] : []];
  }

  // 13. Library
  if (cleanSql.includes('FROM user_library l JOIN anime a')) {
    const userId = params[0];
    const userLibEntries = [];
    for (const [key, entry] of memoryDb.library.entries()) {
      if (key.startsWith(`${userId}:`)) {
        const anime = memoryDb.anime.find(a => a.anime_id === entry.animeId);
        if (anime) {
          userLibEntries.push({
            ...anime,
            status: entry.status,
            episodes_watched: entry.episodesWatched,
            score: entry.score,
            created_at: entry.created_at,
            updated_at: entry.updated_at
          });
        }
      }
    }
    return [userLibEntries];
  }

  if (cleanSql.startsWith('INSERT INTO user_library')) {
    const key = `${params[0]}:${params[1]}`;
    memoryDb.library.set(key, {
      userId: params[0],
      animeId: params[1],
      status: params[2],
      episodesWatched: params[3],
      score: params[4],
      created_at: new Date(),
      updated_at: new Date()
    });
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.startsWith('DELETE FROM user_library')) {
    const key = `${params[0]}:${params[1]}`;
    memoryDb.library.delete(key);
    return [{ affectedRows: 1 }];
  }

  // 14. Password Reset
  if (cleanSql.startsWith('INSERT INTO password_reset_tokens')) {
    const tokenRecord = { id: memoryDb.resetTokens.length + 1, userId: params[0], tokenHash: params[1], expiresAt: params[2], usedAt: null };
    memoryDb.resetTokens.push(tokenRecord);
    return [{ insertId: tokenRecord.id }];
  }

  if (cleanSql.includes('FROM password_reset_tokens WHERE user_id = ?')) {
    const tokens = memoryDb.resetTokens
      .filter(t => t.userId === params[0])
      .reverse();
    return [tokens.length > 0 ? [{ token_hash: tokens[0].tokenHash }] : []];
  }

  if (cleanSql.includes('FROM password_reset_tokens')) {
    const record = memoryDb.resetTokens.find(t => t.tokenHash === params[0] && !t.usedAt && new Date(t.expiresAt) > new Date());
    return [record ? [{ id: record.id, user_id: record.userId }] : []];
  }

  if (cleanSql.startsWith('UPDATE users SET password_hash')) {
    const user = memoryDb.users.find(u => u.user_id === params[1]);
    if (user) user.password_hash = params[0];
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.startsWith('UPDATE password_reset_tokens SET used_at')) {
    const token = memoryDb.resetTokens.find(t => t.id === params[0]);
    if (token) token.usedAt = new Date();
    return [{ affectedRows: 1 }];
  }

  // 15. Admin Operations on Anime
  if (cleanSql.startsWith('INSERT INTO anime')) {
    const newId = memoryDb.anime.length > 0 ? Math.max(...memoryDb.anime.map(a => a.anime_id)) + 1 : 1;
    const newAnime = {
      anime_id: newId,
      title: params[0] || 'Untitled Anime',
      japanese_title: params[1] || '',
      description: params[2] || '',
      poster_url: params[3] || '',
      banner_url: params[4] || '',
      type: params[5] || 'TV',
      status: params[6] || 'airing',
      episode_count: params[7] || 12,
      duration_minutes: params[8] || 24,
      season: params[9] || 'winter',
      season_year: params[10] || 2024,
      site_score: params[11] || 8.5,
      mal_score: params[12] || 8.5,
      age_rating: params[13] || 'PG-13',
      studio_name: params[14] || 'Aniflux Studio',
      genres: ['Action', 'Fantasy'],
      tags: ['Adventure'],
      episodes: Array.from({ length: params[7] || 12 }, (_, i) => `Episode ${i + 1}`)
    };
    memoryDb.anime.push(newAnime);
    return [{ insertId: newId, affectedRows: 1 }];
  }

  if (cleanSql.startsWith('UPDATE anime SET')) {
    const animeId = parseInt(params[params.length - 1]);
    const anime = memoryDb.anime.find(a => a.anime_id === animeId);
    if (anime) {
      if (params[0] !== undefined) anime.title = params[0];
      if (params[1] !== undefined) anime.japanese_title = params[1];
      if (params[2] !== undefined) anime.description = params[2];
      if (params[3] !== undefined) anime.poster_url = params[3];
      if (params[4] !== undefined) anime.banner_url = params[4];
      if (params[5] !== undefined) anime.type = params[5];
      if (params[6] !== undefined) anime.status = params[6];
      if (params[7] !== undefined) anime.episode_count = params[7];
      if (params[8] !== undefined) anime.duration_minutes = params[8];
      if (params[9] !== undefined) anime.season = params[9];
      if (params[10] !== undefined) anime.season_year = params[10];
      if (params[11] !== undefined) anime.site_score = params[11];
      if (params[12] !== undefined) anime.mal_score = params[12];
      if (params[13] !== undefined) anime.age_rating = params[13];
      if (params[14] !== undefined) anime.studio_name = params[14];
    }
    return [{ affectedRows: 1 }];
  }

  if (cleanSql.startsWith('DELETE FROM anime WHERE anime_id = ?')) {
    const animeId = parseInt(params[0]);
    const idx = memoryDb.anime.findIndex(a => a.anime_id === animeId);
    if (idx !== -1) {
      memoryDb.anime.splice(idx, 1);
    }
    return [{ affectedRows: 1 }];
  }

  // 16. Total Stats counts
  if (cleanSql.includes('SELECT COUNT(*) as total FROM episodes')) {
    const totalEps = memoryDb.anime.reduce((acc, a) => acc + (a.episodes?.length || a.episode_count || 12), 0);
    return [[{ total: totalEps }]];
  }

  if (cleanSql.includes('SELECT COUNT(*) as total FROM users')) {
    return [[{ total: memoryDb.users.length }]];
  }

  // Fallback default
  return [[]];
}

const db = {
  async query(sql, params = []) {
    if (pool) {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        return executeMemoryQuery(sql, params);
      }
    }
    return executeMemoryQuery(sql, params);
  },
  async end() {
    if (pool) {
      try {
        await pool.end();
      } catch {
        // ignore
      }
    }
  }
};

export default db;
