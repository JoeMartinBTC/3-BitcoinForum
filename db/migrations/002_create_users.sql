
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  replit_user_id TEXT NOT NULL UNIQUE,
  replit_username TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
