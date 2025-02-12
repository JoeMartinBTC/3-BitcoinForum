import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const dayTitles = pgTable("day_titles", {
  day: integer("day").primaryKey(),
  title1: text("title1").default("").notNull(),
  title2: text("title2").default("").notNull(),
});

export const insertDayTitleSchema = createInsertSchema(dayTitles);
export const selectDayTitleSchema = createSelectSchema(dayTitles);
export type DayTitle = z.infer<typeof selectDayTitleSchema>;

export const events = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description"),
  day: integer("day").notNull(), // 1, 2, or 3
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBreak: boolean("is_break").default(false).notNull(),
  inHoldingArea: boolean("in_holding_area").default(true).notNull(),
  templateId: text("template_id").notNull().default("lecture"),
  color: text("color").notNull().default("bg-blue-100"),
  info: text("info"),
});

export const speakers = pgTable("speakers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  bio: text("bio"),
  topic: text("topic").notNull(),
  eventId: integer("event_id").references(() => events.id),
});

export const insertEventSchema = createInsertSchema(events, {
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
});

export const insertSpeakerSchema = createInsertSchema(speakers);
export const selectSpeakerSchema = createSelectSchema(speakers);
export const selectEventSchema = createSelectSchema(events);

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = {
  id: number;
  title: string;
  color: string;
  description: string | null;
  day: number;
  startTime: Date;
  endTime: Date;
  isBreak: boolean;
  inHoldingArea: boolean;
  templateId: string;
  deleted?: boolean;
  info?: string | null;
};
export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type Speaker = z.infer<typeof selectSpeakerSchema>;

export const timeGrid = pgTable("time_grid", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  day: integer("day").notNull(),
  time: text("time").notNull(),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
});

export const insertTimeGridSchema = createInsertSchema(timeGrid);
export const selectTimeGridSchema = createSelectSchema(timeGrid);
export type TimeGrid = z.infer<typeof selectTimeGridSchema>;

export const eventTypesTable = pgTable("event_types", {
  key: integer().primaryKey().generatedAlwaysAsIdentity(),
  id: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  duration: integer().notNull(),
  color: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  icon: varchar({ length: 255 }),
});

export type EventType = typeof eventTypesTable.$inferInsert;

export const calendarBgColorsTable = pgTable("calendar_bg_colors", {
  key: integer().primaryKey().generatedAlwaysAsIdentity(),
  color: varchar(),
});
