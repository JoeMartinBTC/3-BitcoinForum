import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { readdirSync } from 'fs';

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

async function migrate() {
  try {
    const migrationsDir = resolve(__dirname, 'migrations');
    const migrationFiles = readdirSync(migrationsDir).sort();
    
    for (const file of migrationFiles) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      await client.query(sql);
      console.log(`Migration ${file} completed successfully`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();