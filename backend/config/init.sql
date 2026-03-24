CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages (timestamp DESC);
