import dotenv from 'dotenv';
import app from './app.js';

// Load environment configuration
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`CampusConnect Server running in [${NODE_ENV}] mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
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
