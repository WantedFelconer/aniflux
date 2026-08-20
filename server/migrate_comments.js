import db from './db.js';

async function migrateComments() {
  console.log('Migrating episode_comments and episode_comment_likes tables in MySQL...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS episode_comments (
      comment_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      anime_id       BIGINT UNSIGNED NOT NULL,
      episode_number INT UNSIGNED NOT NULL,
      user_id        BIGINT UNSIGNED NOT NULL,
      parent_id      BIGINT UNSIGNED NULL,
      comment_text   TEXT NOT NULL,
      is_spoiler     BOOLEAN NOT NULL DEFAULT FALSE,
      likes_count    INT UNSIGNED NOT NULL DEFAULT 0,
      created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_anime_ep_comments (anime_id, episode_number, created_at),
      INDEX idx_user_comments (user_id),
      INDEX idx_parent_comment (parent_id),
      CONSTRAINT fk_comment_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
      CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES episode_comments(comment_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS episode_comment_likes (
      comment_id  BIGINT UNSIGNED NOT NULL,
      user_id     BIGINT UNSIGNED NOT NULL,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (comment_id, user_id),
      CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES episode_comments(comment_id) ON DELETE CASCADE,
      CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  console.log('Episode comments tables migrated successfully! 🎉');
  process.exit(0);
}

migrateComments().catch(console.error);
