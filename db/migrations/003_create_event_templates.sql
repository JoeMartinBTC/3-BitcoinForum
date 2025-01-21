
CREATE TABLE IF NOT EXISTS event_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 25,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT
);
