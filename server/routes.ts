import type { Express } from "express";
import { db } from "../db";
import { events } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const allEvents = await db.select().from(events);
      res.json(allEvents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      const newEvent = await db.insert(events).values(req.body).returning();
      res.json(newEvent[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Update event
  app.put("/api/events/:id", async (req, res) => {
    try {
      const updatedEvent = await db
        .update(events)
        .set(req.body)
        .where(eq(events.id, parseInt(req.params.id)))
        .returning();
      res.json(updatedEvent[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", async (req, res) => {
    try {
      await db.delete(events).where(eq(events.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });
}
