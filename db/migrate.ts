
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function migrate() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS day_titles (
        day INTEGER PRIMARY KEY,
        title1 TEXT NOT NULL DEFAULT '',
        title2 TEXT NOT NULL DEFAULT ''
      );
    `;
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
