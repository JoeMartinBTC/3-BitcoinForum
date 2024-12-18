
import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const dayTitles = pgTable("day_titles", {
  day: integer("day").primaryKey(),
  title1: text("title1").notNull().default(''),
  title2: text("title2").notNull().default('')
});

export const events = pgTable("events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  day: integer("day").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBreak: boolean("is_break").default(false).notNull(),
  inHoldingArea: boolean("in_holding_area").default(true).notNull(),
  templateId: text("template_id").notNull().default('lecture'),
  color: text("color").notNull().default("bg-blue-100")
});

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export type Event = z.infer<typeof selectEventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
