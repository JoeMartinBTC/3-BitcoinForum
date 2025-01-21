
import { db } from './index';
import { readFileSync } from 'fs';
import { join } from 'path';

async function migrate() {
  const migrations = [
    '001_create_day_titles.sql',
    '002_create_time_grid.sql',
    '003_create_event_templates.sql'
  ];

  try {
    for (const migration of migrations) {
      const sql = readFileSync(join(__dirname, 'migrations', migration), 'utf-8');
      await db.execute(sql);
      console.log(`Migration ${migration} completed successfully`);
    }
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

migrate();
