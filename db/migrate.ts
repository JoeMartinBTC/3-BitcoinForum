
import { db } from './index';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    const sql = readFileSync(join(__dirname, 'migrations/001_create_day_titles.sql'), 'utf-8');
    const sql2 = readFileSync(join(__dirname, 'migrations/002_create_calendar_configs.sql'), 'utf-8');
    await db.execute(sql);
    await db.execute(sql2);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

migrate();
