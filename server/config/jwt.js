import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * JWT Authentication & Cookie Strategy
 * 
 * Strategy Overview:
 * 1. Tokens are signed using HMAC SHA-256 with a secure secret key (JWT_SECRET).
 * 2. Token payload contains only non-sensitive identifiers: { id, email, role }.
 * 3. In production, tokens are transported via HTTP-only, Secure, SameSite cookies to mitigate XSS attacks.
 * 4. In development, Secure flag is disabled for local HTTP (localhost) compatibility.
 * 5. Authorization Bearer header is also supported for headless/curl/API clients.
 */

const isProduction = process.env.NODE_ENV === 'production';

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'campusconnect-development-secret-key-do-not-use-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'campus_token',
  cookieOptions: {
    httpOnly: true, // Prevents JavaScript access (XSS mitigation)
    secure: isProduction, // HTTPS only in production, false for local HTTP
    sameSite: isProduction ? 'none' : 'lax', // Cross-origin handling
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  }
};

/**
 * Generate a signed JWT for an authenticated user
 * @param {Object} user - User object with id, email, role
 * @returns {string} Signed JWT token
 */
export const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_CONFIG.secret,
    { expiresIn: JWT_CONFIG.expiresIn }
  );
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token string
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};
