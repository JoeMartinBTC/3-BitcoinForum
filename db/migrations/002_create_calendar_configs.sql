
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'calendar_configs_id_seq') THEN
        CREATE SEQUENCE calendar_configs_id_seq;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS calendar_configs (
  id INTEGER PRIMARY KEY DEFAULT nextval('calendar_configs_id_seq'),
  name TEXT NOT NULL,
  description TEXT,
  events JSONB NOT NULL,
  day_titles JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
