-- Shared engagement JSON for Tommy/Dustin (D1).
CREATE TABLE IF NOT EXISTS engagement_state (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
