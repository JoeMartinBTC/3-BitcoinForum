
import { db } from './index';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    const sql = readFileSync(join(__dirname, 'migrations/003_add_info_column.sql'), 'utf-8');
    await db.execute(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

migrate();
