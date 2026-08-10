import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const animeSeed = [
  {
    id: 1, title: 'Void Chronicle: Reborn', japanese_title: 'ヴォイド・クロニクル：リボーン',
    description: 'After dying at the hands of a corrupt god, Kaito Shiro awakens in a world between worlds — a fractured dimension where ancient spirits wage eternal war. Armed with the power to absorb the abilities of the fallen, he must navigate treacherous alliances and uncover the truth behind the Void before it consumes all creation.',
    genres: ['Action', 'Fantasy', 'Isekai'], tags: ['OP Protagonist', 'Dark Fantasy', 'Spirit World', 'Revenge'],
    site_score: 9.2, mal_score: 9.1, popularity_rank: 3, studio: 'Trigger', producer: 'Aniplex', season_year: 2024, episode_count: 24,
    status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'winter',
    poster_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['The Awakening', 'Into the Void', 'First Alliance', 'The Price of Power', 'Shattered Memories', 'Betrayal at Dawn', 'The Cost', 'Convergence', 'Breaking Point', 'Ascension Denied', 'New World Order', 'Fractured Bonds', 'The Forgotten God', 'Echoes of War', 'Eye of the Storm', 'The Reckoning', 'Blood and Shadow', 'Unshackled', 'The Final Pact', 'Void Rising', 'Sacrifice', 'Last Stand', 'Reborn in Fire', 'The World Anew']
  },
  {
    id: 2, title: 'Celestial Blades', japanese_title: 'セレスティアル・ブレード',
    description: 'Seven divine swords were scattered across the mortal realm after the gods fell silent. Only the last scion of the Celestial Clan can reclaim them — but each blade demands a price paid in memory. As she claims each sword, Lena loses pieces of who she was, forcing her to question whether victory is worth the cost.',
    genres: ['Action', 'Supernatural', 'Mystery'], tags: ['Sword Fighting', 'Memory Loss', 'Divine Power', 'Quest'],
    site_score: 8.8, mal_score: 8.7, popularity_rank: 11, studio: 'Wit Studio', producer: 'Production IG', season_year: 2024, episode_count: 13,
    status: 'completed', duration_minutes: 23, type: 'TV', age_rating: 'PG-13', season: 'spring',
    poster_url: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['First Blade', 'Edge of Memory', 'The Second Seal', 'Lost in Steel', 'Twilight Arc', 'The Third Awakening', 'Hollow Crown', 'Fracture', 'The Penultimate Sword', 'What Remains', 'Full Circle', 'The Seventh Blade', 'Celestial End']
  },
  {
    id: 3, title: 'Aurora Protocol', japanese_title: 'オーロラ・プロトコル',
    description: 'In 2147, a global blackout erases all digital memory. A team of neural-linked hackers must reconstruct civilization from fragments stored in the last surviving AI — before hostile actors find it first. Racing against both time and a shadowy cabal, the team discovers the blackout was no accident — it was a designed reset.',
    genres: ['Sci-Fi', 'Psychological', 'Thriller'], tags: ['Cyberpunk', 'AI', 'Hacking', 'Dystopia'],
    site_score: 9.0, mal_score: 8.9, popularity_rank: 7, studio: 'Production I.G', producer: 'Bandai Namco', season_year: 2024, episode_count: 26,
    status: 'airing', duration_minutes: 25, type: 'TV', age_rating: 'R-17+', season: 'summer',
    poster_url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['Blackout', 'Ghost Data', 'The Last Node', 'Neural Link', 'Fractured City', 'Protocol Zero', 'Ghost in the Wire', 'The Cabal', 'Memory Leak', 'Signal', 'Reboot', 'The Archive', 'Dead Drop', 'Firewall', 'Overload', 'The Endgame', 'Compromised', 'Failsafe', 'Last Byte', 'The Purge', 'Reckoning', 'System Restore', 'Final Protocol', 'Remnants', 'The New Grid', 'Aurora']
  },
  {
    id: 4, title: 'Silhouette Garden', japanese_title: 'シルエット・ガーデン',
    description: 'Yuki transfers to a prestigious art academy and discovers that the garden at its center exists in two timelines simultaneously. Every painting made inside it shapes the other world — and someone has been using this power to erase people from existence.',
    genres: ['Romance', 'Mystery', 'Slice of Life'], tags: ['Time Travel', 'Art', 'School', 'Slow Burn'],
    site_score: 8.5, mal_score: 8.4, popularity_rank: 18, studio: 'KyoAni', producer: 'Kadokawa', season_year: 2023, episode_count: 12,
    status: 'completed', duration_minutes: 22, type: 'TV', age_rating: 'PG', season: 'fall',
    poster_url: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['The Transfer', 'The Garden', 'Two Worlds', 'Canvas of Fate', 'A Brushstroke', 'Lost to Time', 'What Was Painted', 'Erasure', 'The Gallery', 'Last Light', 'Final Canvas', 'Silhouette']
  },
  {
    id: 5, title: 'Iron Summit', japanese_title: 'アイアン・サミット',
    description: 'A disgraced general assembles a band of outcasts to defend the last free city against an empire powered by stolen ancient magic. Each battle tests not only their strength but their allegiance — and the general begins to suspect the city hired them to fail.',
    genres: ['Action', 'Military', 'Fantasy'], tags: ['War', 'Strategy', 'Dark Fantasy', 'Betrayal'],
    site_score: 8.7, mal_score: 8.6, popularity_rank: 9, studio: 'Ufotable', producer: 'Shueisha', season_year: 2024, episode_count: 24,
    status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'winter',
    poster_url: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['Fallen General', 'The Outcasts', 'Iron Wall', 'First Blood', 'Summit Under Siege', 'The Spy Within', 'Broken Chains', 'Siege Night', 'The Ancient Weapon', 'Betrayed', 'Counter Strike', 'The Price of War', 'Rally', 'The Final Charge', 'Ash and Steel', 'Victory at a Cost', 'Ruins', 'New Orders', 'The Long March', 'Enemy at the Gate', 'The Last Stand', 'Turning Tide', 'Iron Will', 'Summit']
  },
  {
    id: 6, title: 'Phantom Accord', japanese_title: 'ファントム・アコード',
    description: 'A musician with synesthesia hears the hidden feelings of spirits. Tasked by a secretive guild, she must resolve ancient grudges through the power of music before the spirit world overflows into the living.',
    genres: ['Supernatural', 'Music', 'Drama'], tags: ['Spirits', 'Music', 'Melancholy', 'Coming of Age'],
    site_score: 8.9, mal_score: 8.8, popularity_rank: 14, studio: 'CloverWorks', producer: 'Avex', season_year: 2024, episode_count: 13,
    status: 'completed', duration_minutes: 23, type: 'TV', age_rating: 'PG-13', season: 'spring',
    poster_url: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['First Note', 'Spirit Song', 'The Grudge Keeper', 'Dissonance', 'Lost Chord', 'Resonance', 'The Old Melody', 'Silence', 'Overture', 'The Final Accord', 'Phantom', 'Last Performance', 'Encore']
  },
  {
    id: 7, title: 'Neon Requiem', japanese_title: 'ネオン・レクイエム',
    description: 'In a dystopian megacity, a detective with perfect recall investigates a series of impossible murders — victims who were already dead. Each case peels back layers of a conspiracy spanning three generations of crime and cover-up.',
    genres: ['Mystery', 'Sci-Fi', 'Psychological'], tags: ['Neo-Noir', 'Detective', 'Conspiracy', 'Memory'],
    site_score: 9.3, mal_score: 9.2, popularity_rank: 2, studio: 'MAPPA', producer: 'Dentsu', season_year: 2024, episode_count: 12,
    status: 'airing', duration_minutes: 24, type: 'TV', age_rating: 'R-17+', season: 'summer',
    poster_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['The Dead Don\'t Stay Dead', 'Case Zero', 'Perfect Recall', 'The Third Victim', 'ARIA', 'Deep State', 'Memory Palace', 'The Commissioner', 'Confession', 'Three Generations', 'The Truth Burns', 'Requiem']
  },
  {
    id: 8, title: "Dragon's Meridian", japanese_title: 'ドラゴンズ・メリディアン',
    description: 'When the ancient Dragon Meridian — a mystical ley line — begins fracturing, three rival kingdoms must forge an alliance or face extinction as reality itself unravels.',
    genres: ['Fantasy', 'Action', 'Adventure'], tags: ['Dragons', 'Politics', 'War', 'Magic System'],
    site_score: 8.6, mal_score: 8.5, popularity_rank: 13, studio: 'Bones', producer: 'Aniplex', season_year: 2023, episode_count: 25,
    status: 'completed', duration_minutes: 24, type: 'TV', age_rating: 'PG-13', season: 'fall',
    poster_url: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
    banner_url: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
    cover_url: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
    episodes: ['The First Fracture', 'Three Thrones', 'Meridian\'s Call', 'Fire and Steel', 'An Unlikely Alliance', 'The Ancient Pact', 'Dragon Wake', 'Kingdom at War', 'The Second Fracture', 'Betrayal of Crowns', 'Last Dragon', 'Meridian Rising', 'The Long War', 'Siege', 'Dragon\'s Oath', 'Unraveling', 'The Third Fracture', 'Fall of Kings', 'Dragon\'s Will', 'The Convergence', 'Earth and Sky', 'Meridian\'s End', 'New Alliance', 'The Restored World', 'Meridian']
  }
];

async function seed() {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'defaultdb';
  const ssl = (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || (host && (host.includes('aiven') || host.includes('tidb'))))
    ? { rejectUnauthorized: false }
    : undefined;

  console.log(`Connecting to MySQL database at ${host}:${port}/${database}...`);
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl,
    multipleStatements: true
  });

  console.log('Applying database schema...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await conn.query(schemaSql);
  console.log('Schema applied successfully.');

  console.log('Seeding Studios, Producers, Genres, Tags, and Anime data...');
  
  for (const item of animeSeed) {
    // 1. Studio
    let studioId = null;
    if (item.studio) {
      const [studioRes] = await conn.query(
        'INSERT INTO studios (name) VALUES (?) ON DUPLICATE KEY UPDATE studio_id=LAST_INSERT_ID(studio_id)',
        [item.studio]
      );
      studioId = studioRes.insertId;
    }

    // 2. Producer
    let producerId = null;
    if (item.producer) {
      const [prodRes] = await conn.query(
        'INSERT INTO producers (name) VALUES (?) ON DUPLICATE KEY UPDATE producer_id=LAST_INSERT_ID(producer_id)',
        [item.producer]
      );
      producerId = prodRes.insertId;
    }

    // 3. Anime table
    const [animeRes] = await conn.query(
      `INSERT INTO anime (
        anime_id, title, japanese_title, description, cover_url, poster_url, banner_url,
        type, status, episode_count, duration_minutes, release_date, season, season_year,
        mal_score, site_score, popularity_rank, age_rating, studio_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title=VALUES(title), japanese_title=VALUES(japanese_title), description=VALUES(description),
        poster_url=VALUES(poster_url), banner_url=VALUES(banner_url), mal_score=VALUES(mal_score),
        site_score=VALUES(site_score), popularity_rank=VALUES(popularity_rank), studio_id=VALUES(studio_id)`,
      [
        item.id, item.title, item.japanese_title, item.description, item.cover_url, item.poster_url, item.banner_url,
        item.type, item.status, item.episode_count, item.duration_minutes, `${item.season_year}-01-01`, item.season, item.season_year,
        item.mal_score, item.site_score, item.popularity_rank, item.age_rating, studioId
      ]
    );

    // 4. Anime Producer
    if (producerId) {
      await conn.query(
        'INSERT IGNORE INTO anime_producers (anime_id, producer_id) VALUES (?, ?)',
        [item.id, producerId]
      );
    }

    // 5. Alternative Titles
    await conn.query(
      'INSERT IGNORE INTO anime_alternative_titles (anime_id, title, language) VALUES (?, ?, ?)',
      [item.id, item.japanese_title, 'ja']
    );

    // 6. Genres
    for (const g of item.genres) {
      const slug = g.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const [gRes] = await conn.query(
        'INSERT INTO genres (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE genre_id=LAST_INSERT_ID(genre_id)',
        [g, slug]
      );
      const genreId = gRes.insertId;
      await conn.query('INSERT IGNORE INTO anime_genres (anime_id, genre_id) VALUES (?, ?)', [item.id, genreId]);
    }

    // 7. Tags
    for (const t of item.tags) {
      const [tRes] = await conn.query(
        'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE tag_id=LAST_INSERT_ID(tag_id)',
        [t]
      );
      const tagId = tRes.insertId;
      await conn.query('INSERT IGNORE INTO anime_tags (anime_id, tag_id) VALUES (?, ?)', [item.id, tagId]);
    }

    // 8. Episodes
    if (item.episodes) {
      for (let epIdx = 0; epIdx < item.episodes.length; epIdx++) {
        await conn.query(
          `INSERT INTO episodes (anime_id, episode_number, title, duration_seconds)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title)`,
          [item.id, epIdx + 1, item.episodes[epIdx], (item.duration_minutes || 24) * 60]
        );
      }
    }
  }

  // Related anime seed
  await conn.query(
    "INSERT IGNORE INTO related_anime (anime_id, related_anime_id, relation_type) VALUES (1, 6, 'side_story'), (2, 8, 'prequel'), (8, 2, 'sequel')"
  );

  console.log('Database successfully seeded!');
  await conn.end();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
