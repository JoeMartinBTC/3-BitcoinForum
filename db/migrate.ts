
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

const sql = readFileSync(join(__dirname, 'migrations/001_create_day_titles.sql'), 'utf-8');

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

async function migrate() {
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
