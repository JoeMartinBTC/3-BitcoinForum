
DROP TABLE IF EXISTS event_templates;

CREATE TABLE event_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 25,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT
);

-- Insert default templates
INSERT INTO event_templates (id, title, duration, color, description, icon) VALUES
('roman-reher', 'Roman Reher', 25, 'bg-amber-50', 'Speaker session', 'users'),
('jack-mallers', 'Jack Mallers', 25, 'bg-amber-100', 'Speaker session', 'users'),
('speaker', 'Speaker', 25, 'bg-yellow-100', 'Guest speaker session', 'users'),
('break', 'Break', 25, 'bg-orange-100', 'Break or rest period', 'coffee');
