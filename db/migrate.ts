
import { db } from './index';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function migrate() {
  const migrations = ['001_create_day_titles.sql', '002_create_time_grid.sql', '003_create_event_templates.sql'];
  
  return Promise.all(migrations.map(async (migration) => {
    const sql = readFileSync(join(__dirname, 'migrations', migration), 'utf8');
    await db.execute(sql);
    console.log(`Executed migration: ${migration}`);
  }));
}

migrate()
  .then(() => {
    console.log('All migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
