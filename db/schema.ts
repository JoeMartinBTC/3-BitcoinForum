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
  inHoldingArea: boolean("in_holding_area").default(true).notNull()
});

export const insertEventSchema = createInsertSchema(events).transform((data) => ({
  ...data,
  startTime: new Date(data.startTime),
  endTime: new Date(data.endTime)
}));
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = z.infer<typeof selectEventSchema>;
