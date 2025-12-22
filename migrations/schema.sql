BEGIN;

-- EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    first_name TEXT,
    last_name TEXT,

    date_of_birth DATE NOT NULL CHECK (date_of_birth < CURRENT_DATE - INTERVAL '13 years'),

    gender TEXT NOT NULL,

    email CITEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    pwd_hash TEXT NOT NULL,

    bio VARCHAR(160),
    location TEXT,

    avatar_url TEXT CHECK (avatar_url ~* '^https?://'),
    cover_url TEXT CHECK (cover_url ~* '^https?://'),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE INDEX IF NOT EXISTS idx_users_full_name ON users (first_name, last_name);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2800),
    
    -- Foreign key (with Cascade delete)
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE INDEX IF NOT EXISTS idx_posts_user_feed 
ON posts(user_id) 
INCLUDE (created_at);

DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 500),
    
    -- Foreign keys (with Cascade delete)
    CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_commenter FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

COMMIT;