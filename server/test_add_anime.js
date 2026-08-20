import db from './db.js';
import { extractGumletAssetId, formatGumletEmbedUrl } from './services/gumletService.js';

async function testAddAnime() {
  console.log('Testing Anime Creation & Database Persistence...');

  const title = 'Test Anime ' + Date.now();
  const japaneseTitle = 'テストアニメ';
  const description = 'Test description for anime creation';
  const posterUrl = 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format';
  const bannerUrl = 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format';
  const type = 'TV';
  const status = 'airing';
  const episodeCount = 12;
  const durationMinutes = 24;
  const season = 'winter';
  const seasonYear = 2024;
  const siteScore = 8.5;
  const malScore = 8.5;
  const ageRating = 'PG-13';
  const studio = 'Mappa';
  const genres = ['Action', 'Fantasy'];
  const gumletUrl = 'https://gumlet.tv/watch/6a870965ba1e4a1341b3642f/';

  let studioId = null;
  if (studio) {
    try {
      const [stRes] = await db.query(
        'INSERT INTO studios (name) VALUES (?) ON DUPLICATE KEY UPDATE studio_id=LAST_INSERT_ID(studio_id)',
        [studio]
      );
      studioId = stRes?.insertId || null;
      console.log('Studio ID:', studioId);
    } catch (e) {
      console.error('Studio insert error:', e);
    }
  }

  const [insertResult] = await db.query(
    `INSERT INTO anime (
      title, japanese_title, description, poster_url, banner_url,
      type, status, episode_count, duration_minutes, season, season_year,
      site_score, mal_score, age_rating, studio_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title.trim(),
      japaneseTitle?.trim() || '',
      description?.trim() || '',
      posterUrl,
      bannerUrl,
      type,
      status.toLowerCase(),
      parseInt(episodeCount) || 12,
      parseInt(durationMinutes) || 24,
      season.toLowerCase(),
      parseInt(seasonYear) || 2024,
      parseFloat(siteScore) || 8.5,
      parseFloat(malScore) || 8.5,
      ageRating,
      studioId
    ]
  );

  const newAnimeId = insertResult.insertId;
  console.log('Inserted Anime ID:', newAnimeId);

  // Seed episodes
  const totalEps = parseInt(episodeCount) || 12;
  for (let i = 1; i <= totalEps; i++) {
    const epGumlet = (i === 1 && gumletUrl) ? gumletUrl.trim() : null;
    const epAsset = epGumlet ? extractGumletAssetId(epGumlet) : null;
    await db.upsertEpisode({
      animeId: newAnimeId,
      episodeNumber: i,
      title: `Episode ${i}`,
      gumletUrl: epGumlet || '',
      gumletAssetId: epAsset || '',
      streamStatus: epGumlet ? 'healthy' : 'unverified'
    });
  }

  // Verify retrieval
  const [rows] = await db.query('SELECT * FROM anime WHERE anime_id = ?', [newAnimeId]);
  console.log('Retrieved Anime row:', rows[0]?.title);

  const [epRows] = await db.query('SELECT * FROM episodes WHERE anime_id = ?', [newAnimeId]);
  console.log(`Retrieved ${epRows.length} episodes. Ep 1 Gumlet:`, epRows[0]?.gumlet_url);

  // Verify search
  const [searchRows] = await db.query('SELECT * FROM anime WHERE title LIKE ?', [`%${title}%`]);
  console.log('Search found:', searchRows.length, 'results');

  process.exit(0);
}

testAddAnime().catch(console.error);
