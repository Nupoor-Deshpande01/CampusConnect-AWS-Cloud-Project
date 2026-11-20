import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

// Ensure environment variables are loaded
dotenv.config();

// Determine SSL options for Amazon RDS or encrypted connections
const buildSslConfig = () => {
  if (process.env.DB_SSL !== 'true') {
    return undefined;
  }

  const sslConfig = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  // Optional: If an RDS CA bundle file path is specified
  if (process.env.DB_SSL_CA_PATH && fs.existsSync(process.env.DB_SSL_CA_PATH)) {
    sslConfig.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH);
  }

  return sslConfig;
};

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
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 15000, // 15s timeout to catch security group blocks
  multipleStatements: true,
  ssl: buildSslConfig()
};

// Create a connection pool using mysql2/promise
export const pool = mysql.createPool(dbConfig);

/**
 * Diagnostic helper to format connection target without exposing credentials
 */
export const getDatabaseTargetInfo = () => {
  const isRDS = (process.env.DB_HOST || '').includes('.rds.amazonaws.com');
  return {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    isRDS,
    sslEnabled: Boolean(dbConfig.ssl)
  };
};

/**
 * Test connectivity to the MySQL database (Local or Amazon RDS)
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const testDatabaseConnection = async () => {
  const target = getDatabaseTargetInfo();
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() AS version, CURRENT_USER() AS user, DATABASE() AS db');
    const dbVersion = rows[0]?.version || 'unknown';
    
    console.log(`[Database] Connected successfully to ${target.isRDS ? 'Amazon RDS MySQL' : 'MySQL'} at ${target.host}:${target.port}/${target.database}`);
    console.log(`[Database] Server Version: ${dbVersion} | SSL: ${target.sslEnabled ? 'Enabled' : 'Disabled'}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Error] Connection failed (${error.code || error.message}) to ${target.host}:${target.port}/${target.database}`);
    
    // Provide actionable troubleshooting guidance based on error code
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('[Database Troubleshooting] Connection timed out. If connecting to Amazon RDS:');
      console.error('  1. Check your RDS Security Group inbound rules: ensure port 3306 allows your current IP address.');
      console.error('  2. Verify that RDS "Publicly Accessible" is set to "Yes" (for direct local development connections).');
      console.error('  3. Ensure the RDS instance state is "Available" and not still creating.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[Database Troubleshooting] Access denied. Check DB_USER and DB_PASSWORD in your .env file.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`[Database Troubleshooting] Database "${target.database}" does not exist on the database instance.`);
      console.error('  Run "npm run db:migrate" to initialize tables after creating the database in RDS.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('[Database Troubleshooting] Hostname lookup failed. Verify that DB_HOST matches your exact RDS Endpoint.');
    }
    
    return false;
  }
};

export default pool;
