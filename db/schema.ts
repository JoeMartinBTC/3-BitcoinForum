
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  day: integer("day").notNull(), // 1, 2, or 3
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBreak: boolean("is_break").default(false).notNull(),
  inHoldingArea: boolean("in_holding_area").default(true).notNull(),
  templateId: text("template_id").notNull().default('lecture'),
  color: text("color").notNull().default("bg-blue-100"),
  backgroundColor: text("background_color").notNull().default("#ffffff")
});

export const speakers = pgTable("speakers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  bio: text("bio"),
  topic: text("topic").notNull(),
  eventId: integer("event_id").references(() => events.id),
});

export const insertEventSchema = createInsertSchema(events, {
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str))
});

export const insertSpeakerSchema = createInsertSchema(speakers);
export const selectSpeakerSchema = createSelectSchema(speakers);
export const selectEventSchema = createSelectSchema(events);

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = z.infer<typeof selectEventSchema>;
export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type Speaker = z.infer<typeof selectSpeakerSchema>;
