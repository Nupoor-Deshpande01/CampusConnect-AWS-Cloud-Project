/**
 * CORS Configuration
 * Configured using environment variable CLIENT_URL with fallback for local development
 */
export const getCorsOptions = () => {
  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching CLIENT_URL
      if (!origin || origin === clientOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
};
