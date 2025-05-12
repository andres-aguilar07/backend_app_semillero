import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';

// This function will run the migrations
export async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Apply migrations
    // This will create tables if they don't exist and will do nothing if they already exist
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
}

// If this file is run directly (not imported), run migrations
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
} 