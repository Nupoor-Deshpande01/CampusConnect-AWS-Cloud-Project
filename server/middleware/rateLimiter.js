import rateLimit from 'express-rate-limit';

/**
 * Authentication Rate Limiter
 * Mitigates brute-force credential stuffing and denial of service attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: process.env.NODE_ENV === 'production' ? 30 : 1000, // High limit for local development/testing
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      statusCode: 429,
      message: 'Too many authentication requests from this IP. Please try again after 15 minutes.'
    });
  }
});
