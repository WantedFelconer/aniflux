import mysql from 'mysql2/promise';

async function testConnection(host, user, password, database) {
  const config = {
    host,
    port: 3306,
    user,
    password,
    database,
    connectTimeout: 3000
  };

  console.log(`Testing MySQL connection to ${host}...`);
  try {
    const conn = await mysql.createConnection(config);
    console.log(`SUCCESSFULLY connected to ${host}!`);
    const [rows] = await conn.query('SHOW TABLES;');
    console.log('Tables:', rows);
    await conn.end();
    return true;
  } catch (err) {
    console.log(`FAILED ${host}:`, err.message);
    return false;
  }
}

async function run() {
  await testConnection('localhost', 'root', '', 'if0_42473764_8anime');
  await testConnection('127.0.0.1', 'root', '', 'if0_42473764_8anime');
  await testConnection('localhost', 'if0_42473764', '4ZPXDNL7Ku', 'if0_42473764_8anime');
  await testConnection('127.0.0.1', 'if0_42473764', '4ZPXDNL7Ku', 'if0_42473764_8anime');
}

run();
