CREATE TABLE IF NOT EXISTS "event_types" (
	"key" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_types_key_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"color" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"icon" varchar(255)
);
