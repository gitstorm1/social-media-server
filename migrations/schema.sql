CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP(0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
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

CREATE INDEX idx_users_full_name ON users (first_name, last_name);


CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();