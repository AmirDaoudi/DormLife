import fs from 'fs';
import path from 'path';
import { db } from './connection';
import logger from '../utils/logger';

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    // Connect to database
    await db.connect();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    logger.info(`Executing ${statements.length} migration statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await db.query(statement + ';');
          logger.debug(`Migration ${i + 1}/${statements.length} completed`);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.code === '42P07' || error.code === '42P06' || error.code === '42710') {
            logger.debug(`Skipping existing object: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    }
    
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default runMigrations;