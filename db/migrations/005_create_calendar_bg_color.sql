CREATE TABLE IF NOT EXISTS "calendar_bg_colors" (
	"key" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "calendar_bg_colors_key_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"color" varchar
);