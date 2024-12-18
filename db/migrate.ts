
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS day_titles (
        day INTEGER PRIMARY KEY,
        title1 TEXT NOT NULL DEFAULT '',
        title2 TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        day INTEGER NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_break BOOLEAN NOT NULL DEFAULT false,
        in_holding_area BOOLEAN NOT NULL DEFAULT true,
        template_id TEXT NOT NULL DEFAULT 'lecture',
        color TEXT NOT NULL DEFAULT 'bg-blue-100'
      );
    `);
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
