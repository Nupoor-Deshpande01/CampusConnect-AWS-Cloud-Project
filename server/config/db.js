import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campusconnect_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true
};

// Create a connection pool using mysql2/promise
export const pool = mysql.createPool(dbConfig);

/**
 * Test connectivity to the MySQL database
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database] Connection failed (${error.code || error.message}) to ${dbConfig.host}:${dbConfig.port}`);
    return false;
  }
};

export default pool;
