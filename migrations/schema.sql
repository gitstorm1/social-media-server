BEGIN;

-- // EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- // USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,

    date_of_birth DATE NOT NULL CHECK (date_of_birth < CURRENT_DATE - INTERVAL '13 years'),

    gender TEXT NOT NULL,

    email CITEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    pwd_hash TEXT NOT NULL,

    bio VARCHAR(160),
    location TEXT NOT NULL,

    avatar_url TEXT CHECK (avatar_url ~* '^https?://'),
    cover_url TEXT CHECK (cover_url ~* '^https?://'),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

-- Makes searching by full name faster
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users (first_name, last_name);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- // FRIENDSHIPS TABLE
-- This uses duplicate rows for mutual friendships to avoid complex queries later
CREATE TABLE IF NOT EXISTS friendships (
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (user_id, friend_id),
    
    -- Safety Check: A user cannot friend themselves
    CONSTRAINT check_not_self CHECK (user_id <> friend_id),
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for "Who is friending me?"
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- // FRIEND_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS friend_requests (
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (sender_id, receiver_id),
    CONSTRAINT check_not_self_request CHECK (sender_id <> receiver_id),
    
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prevents A->B and B->A from existing simultaneously
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_request_pair 
ON friend_requests (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id));

-- Index to quickly find all pending requests for a specific user
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver 
ON friend_requests(receiver_id) 
WHERE status = 'pending';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER trg_friend_requests_updated_at
BEFORE UPDATE ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- // POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2800),

    likes_count INTEGER DEFAULT 0,
    
    -- Foreign key (with Cascade delete)
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0)
);

-- Improves speed of queries involving getting a user's posts and arranging it in a specific order
-- (Used on the profile page)
CREATE INDEX IF NOT EXISTS idx_posts_user_feed 
ON posts(user_id) 
INCLUDE (created_at);

-- Function for auto-updating likes_count
CREATE OR REPLACE FUNCTION maintain_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- // POST_LIKES TABLE
CREATE TABLE IF NOT EXISTS post_likes (
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    -- Composite Primary Key
    PRIMARY KEY (post_id, user_id),

    CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Covering index for "What posts has this user liked?"
-- and "Has this post ID been liked by this user ID?"
CREATE INDEX IF NOT EXISTS idx_post_likes_user_lookup 
ON post_likes(user_id) 
INCLUDE (post_id);

-- Trigger for auto-updating likes_count
DROP TRIGGER IF EXISTS trg_update_post_likes_count ON post_likes;
CREATE TRIGGER trg_update_post_likes_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION maintain_post_likes_count();

-- // COMMENTS TABLE
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

-- Improves performance for retrieving the comments of a specific post
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments;
CREATE TRIGGER trg_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

COMMIT;