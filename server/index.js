import dotenv from 'dotenv';
import app from './app.js';
import { testDatabaseConnection, getDatabaseTargetInfo } from './config/db.js';

// Load environment configuration
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, async () => {
  console.log(`CampusConnect Server running in [${NODE_ENV}] mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);

  // Verify database connection at startup
  const target = getDatabaseTargetInfo();
  console.log(`[Database Target] ${target.isRDS ? 'Amazon RDS MySQL' : 'Local MySQL'} (${target.host}:${target.port}/${target.database})`);
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.warn('[Database Notice] Server is running, but database connection could not be established.');
    console.warn('[Database Notice] If using Amazon RDS, check security groups, RDS endpoint, and credentials in .env.');
  }
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
