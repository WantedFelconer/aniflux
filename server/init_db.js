import mysql from 'mysql2/promise';

async function initLocalDb() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });
    console.log('Connected to local MySQL as root!');
    await conn.query('CREATE DATABASE IF NOT EXISTS `if0_42473764_8anime` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    console.log('Database `if0_42473764_8anime` created or already exists!');
    await conn.query('USE `if0_42473764_8anime`;');
    const [rows] = await conn.query('SHOW TABLES;');
    console.log('Current tables:', rows);
    await conn.end();
  } catch (err) {
    console.error('Error initializing local DB:', err);
  }
}

initLocalDb();
