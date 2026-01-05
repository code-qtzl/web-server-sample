-- 0003_create_refresh_tokens.sql
-- Create refresh_tokens table with hex token primary key
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token varchar(64) PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz NULL
);
