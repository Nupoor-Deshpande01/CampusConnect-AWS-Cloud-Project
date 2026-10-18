/**
 * 404 Not Found Middleware
 * Returns consistent JSON response for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};
