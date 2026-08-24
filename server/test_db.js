import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testDatabase() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'aniflux';
  const ssl = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || host?.includes('tidb') || host?.includes('aiven'))
    ? { rejectUnauthorized: false }
    : undefined;

  console.log('\n========================================');
  console.log('      ANIFLUX DATABASE HEALTH CHECK     ');
  console.log('========================================');
  console.log(`Host:     ${host || '(not set)'}`);
  console.log(`Port:     ${port}`);
  console.log(`User:     ${user || '(not set)'}`);
  console.log(`Database: ${database}`);
  console.log(`SSL:      ${ssl ? 'Enabled' : 'Disabled'}`);
  console.log('----------------------------------------');

  if (!host || !user) {
    console.error('❌ FAILED: Missing DB_HOST or DB_USER in your .env file.');
    console.error('   Please check your .env configuration.');
    process.exit(1);
  }

  const startTime = Date.now();
  let conn;

  try {
    console.log('Connecting to database...');
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl,
      connectTimeout: 10000
    });

    const latency = Date.now() - startTime;
    console.log(`✅ SUCCESS: Connected to MySQL in ${latency}ms!\n`);

    // Fetch tables
    const [tables] = await conn.query('SHOW TABLES;');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`📊 Found ${tableNames.length} Tables:`);
    console.log('   ' + tableNames.join(', '));

    // Fetch user count
    if (tableNames.includes('users')) {
      const [[{ userCount }]] = await conn.query('SELECT COUNT(*) as userCount FROM users;');
      const [users] = await conn.query('SELECT user_id, username, email, role FROM users LIMIT 5;');
      console.log(`\n👥 Total Registered Users: ${userCount}`);
      if (users.length > 0) {
        console.log('   Recent users:');
        users.forEach(u => console.log(`   - [ID ${u.user_id}] ${u.username} (${u.email}) [${u.role}]`));
      }
    }

    // Fetch anime count
    if (tableNames.includes('anime')) {
      const [[{ animeCount }]] = await conn.query('SELECT COUNT(*) as animeCount FROM anime;');
      console.log(`\n🎬 Total Anime Titles: ${animeCount}`);
    }

    console.log('\n========================================');
    console.log('🎉 Database is ONLINE, HEALTHY, and PERSISTENT!');
    console.log('========================================\n');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ CONNECTION ERROR: ${err.message}`);
    console.error('Code:', err.code || 'UNKNOWN');
    console.error('----------------------------------------');
    console.error('Troubleshooting tips:');
    console.error('1. Check if DB_HOST, DB_USER, and DB_PASSWORD in .env are correct.');
    console.error('2. Ensure your cloud database (Aiven/TiDB) allows external connections.');
    console.error('3. Check if DB_SSL=true is set for cloud providers requiring SSL.');
    console.error('========================================\n');
    if (conn) await conn.end();
    process.exit(1);
  }
}

testDatabase();
