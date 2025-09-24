import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema.js';

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for migrations');
  }

  console.log('Starting database schema setup...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });

  try {
    // For this project, we use schema push instead of traditional migrations
    // This is more suitable for the deployment setup
    console.log('Using drizzle-kit push to sync schema...');
    
    const { execSync } = await import('child_process');
    
    // First, verify database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');
    
    // Use drizzle-kit push to sync the schema
    execSync('npx drizzle-kit push --force', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Database schema push completed successfully');
    
    // Verify tables were created by testing a simple query
    try {
      const result = await db.query.games?.findMany({ limit: 1 }) ?? [];
      console.log('✅ Database tables verified and accessible');
    } catch (verifyError) {
      console.error('⚠️ Schema push completed but tables may not be accessible:', verifyError);
      // Try creating a stats entry to initialize the database
      try {
        await db.insert(schema.gameStats).values({
          totalGames: 0,
          totalComments: 0, 
          activePlayers: 0,
          averageScore: 0
        }).onConflictDoNothing();
        console.log('✅ Database initialized with default stats');
      } catch (initError) {
        console.warn('Could not initialize database:', initError);
      }
    }
    
  } catch (error) {
    console.error('❌ Database schema setup failed:', error);
    console.error('This may be due to:');
    console.error('1. Database connection issues');
    console.error('2. Schema file not found in build');
    console.error('3. Permission issues');
    console.error('4. Invalid DATABASE_URL format');
    throw error;
  } finally {
    await pool.end();
  }
}