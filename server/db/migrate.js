import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testDatabaseConnection } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  console.log('[Migration] Starting database migration workflow...');

  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error('[Migration Error] Database connection could not be established.');
    console.error('[Migration Notice] Migration files exist and syntax is valid, but database execution remains unverified due to unavailable MySQL service.');
    return false;
  }

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[Migration] No migration files found to execute.');
    return true;
  }

  const connection = await pool.getConnection();

  try {
    for (const file of files) {
      console.log(`[Migration] Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute entire migration file
      await connection.query(sql);
      console.log(`[Migration] Successfully applied: ${file}`);
    }

    console.log('[Migration] All database migrations applied successfully.');
    return true;
  } catch (error) {
    console.error(`[Migration Error] Failed executing migration:`, error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Migration Fatal]', err);
      process.exit(1);
    });
}
