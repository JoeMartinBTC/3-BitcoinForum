
import { Pool } from 'pg';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    const client = await pool.connect();
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
    await client.release();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
