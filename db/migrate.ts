
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = `
CREATE TABLE IF NOT EXISTS day_titles (
  day INTEGER PRIMARY KEY,
  title1 TEXT NOT NULL DEFAULT '',
  title2 TEXT NOT NULL DEFAULT ''
);`;

async function migrate() {
  const client = await neon(process.env.DATABASE_URL);
  try {
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
