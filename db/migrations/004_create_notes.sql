
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notes (content) 
VALUES ('In Event Type wird der Type (Sprecher, etc) definiert. Kann gelöscht werden, aber niemals alle löschen!!
Event Type kann nicht importiert werden
Holding Area kann importiert werden, passt aber farblich nur, wenn Event Type korrekt vorhanden ist') 
ON CONFLICT DO NOTHING;
