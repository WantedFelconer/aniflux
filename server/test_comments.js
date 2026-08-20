import db from './db.js';

async function testComments() {
  console.log('Testing Episode Comments Database Operations...');

  const animeId = 1;
  const episodeNumber = 1;
  const userId = 1;

  // 1. Post a comment
  const [insertRes] = await db.query(
    `INSERT INTO episode_comments (anime_id, episode_number, user_id, comment_text, is_spoiler)
     VALUES (?, ?, ?, ?, ?)`,
    [animeId, episodeNumber, userId, 'This episode had an insane plot twist! 🔥 Gumlet 1080p stream is so crisp!', false]
  );
  const commentId = insertRes.insertId;
  console.log('✅ Created Comment ID:', commentId);

  // 2. Post a reply
  const [replyRes] = await db.query(
    `INSERT INTO episode_comments (anime_id, episode_number, user_id, parent_id, comment_text, is_spoiler)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [animeId, episodeNumber, userId, commentId, 'Agreed! The animation at 14:20 was next level.', false]
  );
  console.log('✅ Created Reply ID:', replyRes.insertId);

  // 3. Like comment
  await db.query(
    'INSERT INTO episode_comment_likes (comment_id, user_id) VALUES (?, ?)',
    [commentId, userId]
  );
  await db.query(
    'UPDATE episode_comments SET likes_count = likes_count + 1 WHERE comment_id = ?',
    [commentId]
  );
  console.log('✅ Liked Comment ID:', commentId);

  // 4. Retrieve comments for Episode 1
  const [comments] = await db.query(
    `SELECT c.*, u.username, u.level FROM episode_comments c JOIN users u ON c.user_id = u.user_id WHERE c.anime_id = ? AND c.episode_number = ?`,
    [animeId, episodeNumber]
  );
  console.log(`✅ Retrieved ${comments.length} comments for Anime ${animeId} Ep ${episodeNumber}:`);
  for (const c of comments) {
    console.log(`  - [${c.username} Lv.${c.level}] ${c.comment_text} (Likes: ${c.likes_count})`);
  }

  process.exit(0);
}

testComments().catch(console.error);
