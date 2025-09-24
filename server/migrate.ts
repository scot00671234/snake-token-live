import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for migrations');
  }

  console.log('Starting database migration...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    // If migration fails, try push instead (for first time setup)
    console.log('Attempting schema push instead...');
    try {
      // Import drizzle-kit programmatically for push
      const { execSync } = await import('child_process');
      execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
      console.log('✅ Schema push completed successfully');
    } catch (pushError) {
      console.error('❌ Schema push also failed:', pushError);
      throw pushError;
    }
  } finally {
    await pool.end();
  }
}