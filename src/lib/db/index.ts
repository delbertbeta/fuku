import { getDb, closeDb } from './connection';
import { initializeSchema } from './schema';

export function initializeDatabase(): void {
  try {
    getDb();
    initializeSchema();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export { getDb, closeDb, initializeSchema };
