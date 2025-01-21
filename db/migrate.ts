
import { db } from './index';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    const sql = readFileSync(join(__dirname, 'migrations/001_create_day_titles.sql'), 'utf-8');
    await db.execute(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

migrate();
