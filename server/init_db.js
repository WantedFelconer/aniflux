import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME || 'aniflux';
  const ssl = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || (host && (host.includes('aiven') || host.includes('tidb'))))
    ? { rejectUnauthorized: false }
    : undefined;

  if (!host) {
    console.log('No DB_HOST configured in .env. Skipping database creation step (will use in-memory fallback).');
    return;
  }

  console.log(`Checking/Creating database "${dbName}" on ${host}:${port}...`);
  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      ssl,
      connectTimeout: 10000
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database "${dbName}" is ready.`);
    await conn.end();
  } catch (err) {
    console.warn(`Database init notice: ${err.message}`);
  }
}

initDatabase();
