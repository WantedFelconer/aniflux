import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

let pool = null;

const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || 'aniflux';

if (dbHost) {
  try {
    const isSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || dbHost.includes('tidb') || dbHost.includes('aiven');
    const sslConfig = isSsl ? { rejectUnauthorized: false } : undefined;

    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 10000
    });
  } catch (e) {
    console.warn('[DB] MySQL pool initialization error:', e.message);
  }
}

export const db = {
  get pool() {
    return pool;
  },
  async query(sql, params = []) {
    if (pool) {
      return await pool.query(sql, params);
    }
    throw new Error('Database pool not available.');
  },
  async getConnection() {
    if (pool) {
      return await pool.getConnection();
    }
    throw new Error('Database pool not available.');
  }
};

export default db;
