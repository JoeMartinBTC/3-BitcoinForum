
ALTER TABLE events
ADD COLUMN background_color text,
ADD COLUMN is_background boolean DEFAULT false;
