import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    // Get database connection
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    console.log('Dropping all tables...');
    
    // Drop all tables in one go
    await sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `;

    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 