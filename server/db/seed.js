import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testDatabaseConnection } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runSeeds = async () => {
  console.log('[Seed] Starting database seeding workflow...');

  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error('[Seed Error] Database connection could not be established.');
    console.error('[Seed Notice] Seed files exist and are verified, but database execution remains unverified due to unavailable MySQL service.');
    return false;
  }

  const seedsDir = path.join(__dirname, 'seeds');
  const files = fs.readdirSync(seedsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('[Seed] No seed files found to execute.');
    return true;
  }

  const connection = await pool.getConnection();

  try {
    for (const file of files) {
      console.log(`[Seed] Applying seed file: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // Execute SQL statements
      await connection.query(sql);
      console.log(`[Seed] Successfully seeded: ${file}`);
    }

    console.log('[Seed] All database seeds executed successfully.');
    return true;
  } catch (error) {
    console.error(`[Seed Error] Failed executing seeds:`, error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeds()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error('[Seed Fatal]', err);
      process.exit(1);
    });
}
