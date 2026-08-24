import db from '../config/db.js';

async function testDatabase() {
  console.log('\n========================================');
  console.log('      ANIFLUX DATABASE HEALTH CHECK     ');
  console.log('========================================');

  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT || '3306';
  const dbUser = process.env.DB_USER;
  const dbName = process.env.DB_NAME || 'aniflux';

  console.log(`Host:     ${dbHost}`);
  console.log(`Port:     ${dbPort}`);
  console.log(`User:     ${dbUser}`);
  console.log(`Database: ${dbName}`);
  console.log('----------------------------------------');
  console.log('Connecting to database...');

  const startTime = Date.now();

  try {
    const [tables] = await db.query('SHOW TABLES');
    const elapsed = Date.now() - startTime;
    console.log(`\x1b[32m✅ SUCCESS: Connected to MySQL in ${elapsed}ms!\x1b[0m\n`);

    const tableNames = tables.map(t => Object.values(t)[0]).sort();
    console.log(`📊 Found ${tableNames.length} Tables:`);
    console.log(`   ${tableNames.join(', ')}\n`);

    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total Registered Users: ${userCount[0]?.count || 0}`);

    const [animeCount] = await db.query('SELECT COUNT(*) as count FROM anime');
    console.log(`🎬 Total Anime Titles: ${animeCount[0]?.count || 0}`);

    console.log('\n========================================');
    console.log('🎉 Database is ONLINE, HEALTHY, and PERSISTENT!');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m❌ DATABASE ERROR: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

testDatabase();
