import type { Express } from "express";
import { db } from "../db";
import { events, insertEventSchema } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await db.insert(events).values(eventData).returning();
      res.json(newEvent[0]);
    } catch (error) {
      console.error('Event creation failed:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid event data",
          details: error.errors
        });
      } else {
        res.status(500).json({ 
          error: "Failed to create event",
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Update event
  app.put("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      // Validate day value
      if (req.body.day !== undefined && ![1, 2, 3].includes(req.body.day)) {
        return res.status(400).json({ error: "Day must be 1, 2, or 3" });
      }

      // Convert and validate dates
      const updateData: any = { 
        ...req.body
      };
      
      if (req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        if (isNaN(startTime.getTime())) {
          return res.status(400).json({ error: "Invalid start time" });
        }
        updateData.startTime = startTime;
      }

      if (req.body.endTime) {
        const endTime = new Date(req.body.endTime);
        if (isNaN(endTime.getTime())) {
          return res.status(400).json({ error: "Invalid end time" });
        }
        updateData.endTime = endTime;
      }

      // Ensure both times are set if one is provided
      if ((updateData.startTime && !updateData.endTime) || (!updateData.startTime && updateData.endTime)) {
        return res.status(400).json({ error: "Both start and end times must be provided together" });
      }

      // Validate time range if both times are provided
      if (updateData.startTime && updateData.endTime) {
        const diffMinutes = (updateData.endTime - updateData.startTime) / (1000 * 60);
        if (diffMinutes !== 25) {
          return res.status(400).json({ error: "Event duration must be exactly 25 minutes" });
        }
      }

      const updatedEvent = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();

      if (!updatedEvent.length) {
        return res.status(404).json({ error: "Event not found" });
      }

      console.log('Successfully updated event:', {
        id: eventId,
        updates: updateData,
        result: updatedEvent[0]
      });

      res.json(updatedEvent[0]);
    } catch (error) {
      console.error('Event update failed:', error);
      res.status(500).json({ 
        error: "Failed to update event",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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