
CREATE TABLE IF NOT EXISTS "day_titles" (
    "day" integer PRIMARY KEY,
    "title1" text NOT NULL DEFAULT '',
    "title2" text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "events" (
    "id" serial PRIMARY KEY,
    "title" text NOT NULL,
    "description" text,
    "day" integer NOT NULL,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "is_break" boolean NOT NULL DEFAULT false,
    "in_holding_area" boolean NOT NULL DEFAULT true,
    "template_id" text NOT NULL DEFAULT 'lecture',
    "color" text NOT NULL DEFAULT 'bg-blue-100'
);
