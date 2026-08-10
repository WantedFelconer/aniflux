SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
    user_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username          VARCHAR(32)  NOT NULL UNIQUE,
    email             VARCHAR(255) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NULL,
    avatar_url        VARCHAR(500) NULL,
    banner_url        VARCHAR(500) NULL,
    bio               VARCHAR(500) NULL,
    role              ENUM('guest','member','contributor','moderator','admin') NOT NULL DEFAULT 'member',
    level             INT UNSIGNED NOT NULL DEFAULT 1,
    total_watch_time_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at DATETIME NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS oauth_accounts (
    oauth_account_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT UNSIGNED NOT NULL,
    provider          ENUM('google','discord','github') NOT NULL,
    provider_user_id  VARCHAR(255) NOT NULL,
    access_token_enc  VARBINARY(1024) NULL,
    refresh_token_enc VARBINARY(1024) NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider_account (provider, provider_user_id),
    CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS two_factor_auth (
    user_id       BIGINT UNSIGNED PRIMARY KEY,
    secret_enc    VARBINARY(255) NOT NULL,
    is_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    recovery_codes_enc VARBINARY(1024) NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_2fa_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT UNSIGNED NOT NULL,
    token_hash     VARCHAR(255) NOT NULL,
    ip_address     VARCHAR(45)  NULL,
    user_agent     VARCHAR(255) NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     DATETIME NOT NULL,
    revoked_at     DATETIME NULL,
    INDEX idx_sessions_user (user_id),
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id                    BIGINT UNSIGNED PRIMARY KEY,
    theme                      ENUM('dark','light') NOT NULL DEFAULT 'dark',
    ui_language                VARCHAR(10) NOT NULL DEFAULT 'en',
    autoplay_next_episode      BOOLEAN NOT NULL DEFAULT TRUE,
    auto_skip_intro            BOOLEAN NOT NULL DEFAULT FALSE,
    auto_skip_outro            BOOLEAN NOT NULL DEFAULT FALSE,
    default_quality            VARCHAR(10) NOT NULL DEFAULT 'auto',
    default_audio_type         ENUM('sub','dub') NOT NULL DEFAULT 'sub',
    default_subtitle_language  VARCHAR(10) NOT NULL DEFAULT 'en',
    reduced_motion              BOOLEAN NOT NULL DEFAULT FALSE,
    font_scale                  DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prefs_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL,
    token_hash    VARCHAR(255) NOT NULL,
    expires_at    DATETIME NOT NULL,
    used_at       DATETIME NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reset_token_user (user_id),
    INDEX idx_reset_token_hash (token_hash),
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS studios (
    studio_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    description   TEXT NULL,
    logo_url      VARCHAR(500) NULL,
    UNIQUE KEY uq_studio_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS producers (
    producer_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    UNIQUE KEY uq_producer_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anime (
    anime_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    japanese_title    VARCHAR(255) NULL,
    description       TEXT NULL,
    cover_url         VARCHAR(500) NULL,
    poster_url        VARCHAR(500) NULL,
    banner_url        VARCHAR(500) NULL,
    type              ENUM('TV','Movie','OVA','ONA','Special') NOT NULL DEFAULT 'TV',
    status            ENUM('airing','completed','upcoming','hiatus') NOT NULL DEFAULT 'completed',
    episode_count     SMALLINT UNSIGNED NULL,
    duration_minutes  SMALLINT UNSIGNED NULL,
    release_date      DATE NULL,
    season            ENUM('winter','spring','summer','fall') NULL,
    season_year       SMALLINT UNSIGNED NULL,
    mal_score         DECIMAL(3,1) NULL,
    site_score        DECIMAL(3,1) NULL,
    popularity_rank   INT UNSIGNED NULL,
    age_rating        VARCHAR(10) NULL,
    studio_id         INT UNSIGNED NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_anime_status (status),
    INDEX idx_anime_season (season_year, season),
    INDEX idx_anime_score (site_score),
    INDEX idx_anime_popularity (popularity_rank),
    FULLTEXT INDEX ft_anime_title (title, japanese_title, description),
    CONSTRAINT fk_anime_studio FOREIGN KEY (studio_id) REFERENCES studios(studio_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anime_alternative_titles (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    anime_id    BIGINT UNSIGNED NOT NULL,
    title       VARCHAR(255) NOT NULL,
    language    VARCHAR(10) NULL,
    CONSTRAINT fk_alttitle_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anime_producers (
    anime_id     BIGINT UNSIGNED NOT NULL,
    producer_id  INT UNSIGNED NOT NULL,
    PRIMARY KEY (anime_id, producer_id),
    CONSTRAINT fk_ap_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
    CONSTRAINT fk_ap_producer FOREIGN KEY (producer_id) REFERENCES producers(producer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS genres (
    genre_id    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anime_genres (
    anime_id    BIGINT UNSIGNED NOT NULL,
    genre_id    SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (anime_id, genre_id),
    CONSTRAINT fk_ag_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
    CONSTRAINT fk_ag_genre FOREIGN KEY (genre_id) REFERENCES genres(genre_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tags (
    tag_id      SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS anime_tags (
    anime_id    BIGINT UNSIGNED NOT NULL,
    tag_id      SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (anime_id, tag_id),
    CONSTRAINT fk_at_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
    CONSTRAINT fk_at_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS related_anime (
    id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    anime_id           BIGINT UNSIGNED NOT NULL,
    related_anime_id   BIGINT UNSIGNED NOT NULL,
    relation_type      ENUM('sequel','prequel','side_story','spin_off','recommendation') NOT NULL,
    UNIQUE KEY uq_related (anime_id, related_anime_id, relation_type),
    CONSTRAINT fk_related_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE,
    CONSTRAINT fk_related_target FOREIGN KEY (related_anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS episodes (
    episode_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    anime_id            BIGINT UNSIGNED NOT NULL,
    episode_number       INT UNSIGNED NOT NULL,
    title                VARCHAR(255) NULL,
    thumbnail_url        VARCHAR(500) NULL,
    duration_seconds     INT UNSIGNED NULL,
    air_date             DATETIME NULL,
    intro_start_seconds  INT UNSIGNED NULL,
    intro_end_seconds    INT UNSIGNED NULL,
    outro_start_seconds  INT UNSIGNED NULL,
    outro_end_seconds    INT UNSIGNED NULL,
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_anime_episode (anime_id, episode_number),
    INDEX idx_episode_airdate (air_date),
    CONSTRAINT fk_episode_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorites (
    user_id     BIGINT UNSIGNED NOT NULL,
    anime_id    BIGINT UNSIGNED NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, anime_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookmarks (
    user_id     BIGINT UNSIGNED NOT NULL,
    anime_id    BIGINT UNSIGNED NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, anime_id),
    CONSTRAINT fk_bm_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_library (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT UNSIGNED NOT NULL,
    anime_id          BIGINT UNSIGNED NOT NULL,
    status            ENUM('Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch') NOT NULL DEFAULT 'Watching',
    episodes_watched  INT UNSIGNED NOT NULL DEFAULT 0,
    score             DECIMAL(3,1) NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_anime_library (user_id, anime_id),
    CONSTRAINT fk_lib_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_lib_anime FOREIGN KEY (anime_id) REFERENCES anime(anime_id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
