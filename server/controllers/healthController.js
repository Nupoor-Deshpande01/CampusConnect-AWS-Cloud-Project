import { pool, getDatabaseTargetInfo } from '../config/db.js';

/**
 * Health Controller
 * Returns server operational status and database connection health
 * Never exposes passwords or sensitive credentials
 */
export const getHealthStatus = async (req, res) => {
  let dbStatus = 'disconnected';
  const target = getDatabaseTargetInfo();

  try {
    const [rows] = await pool.query('SELECT 1 AS alive');
    if (rows && rows[0]?.alive === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'error';
  }

  res.status(200).json({
    status: 'ok',
    service: 'CampusConnect API',
    version: 'v1',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      engine: target.isRDS ? 'Amazon RDS MySQL' : 'MySQL',
      host: target.host,
      database: target.database,
      ssl: target.sslEnabled
    }
  });
};
