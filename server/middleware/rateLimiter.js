import rateLimit from 'express-rate-limit';

/**
 * Authentication Rate Limiter
 * Mitigates brute-force credential stuffing and denial of service attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Limit each IP to 30 requests per window
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
