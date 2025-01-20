
CREATE TABLE IF NOT EXISTS time_grid (
  id SERIAL PRIMARY KEY,
  day INTEGER NOT NULL,
  time TEXT NOT NULL,
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  UNIQUE(day, time)
);
