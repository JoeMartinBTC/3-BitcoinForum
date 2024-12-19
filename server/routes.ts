
import { events, speakers, dayTitles, insertEventSchema, insertSpeakerSchema, insertDayTitleSchema } from "@db/schema";
import { eq } from "drizzle-orm";
import express from "express";

export function setupRoutes(app: express.Express, db: any) {
  app.get("/api/day-titles", async (req, res) => {
    try {
      const titles = await db.select().from(dayTitles);
      res.json(titles);
    } catch (error) {
      console.error('Failed to fetch day titles:', error);
      res.status(500).json({ error: "Failed to fetch day titles" });
    }
  });

  app.post("/api/day-titles", async (req, res) => {
    try {
      const { day, title1, title2 } = insertDayTitleSchema.parse(req.body);
      
      // First try to insert
      let result = await db
        .insert(dayTitles)
        .values({
          day: Number(day),
          title1: title1?.trim() || '',
          title2: title2?.trim() || ''
        })
        .onConflictDoUpdate({
          target: dayTitles.day,
          set: {
            title1: title1?.trim() || '',
            title2: title2?.trim() || ''
          }
        })
        .returning();

      // Verify the update
      const updatedTitles = await db
        .select()
        .from(dayTitles)
        .where(eq(dayTitles.day, Number(day)));

      res.json(updatedTitles);
    } catch (error) {
      console.error('Failed to save day titles:', error);
      res.status(500).json({ error: "Failed to save day titles" });
    }
  });

  // Other routes...
}
