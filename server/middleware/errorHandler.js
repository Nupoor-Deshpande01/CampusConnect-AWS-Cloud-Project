/**
 * Centralized Error Handling Middleware
 * Catches all thrown/passed errors and returns structured JSON
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error in development/production
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
};
