import { verifyToken, JWT_CONFIG } from '../config/jwt.js';
import { pool } from '../config/db.js';

/**
 * Authentication Middleware
 * Validates JWT token from HTTP-only cookie or Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies[JWT_CONFIG.cookieName]) {
      token = req.cookies[JWT_CONFIG.cookieName];
    } 
    // 2. Fallback to Authorization: Bearer <token>
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authentication required. No session token provided.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid or expired session token.'
      });
    }

    // Verify user still exists in database and fetch latest role
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'User account associated with this token no longer exists.'
      });
    }

    // Attach verified user to request object (never trust client-supplied role)
    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role Authorization Middleware Factory
 * Ensures the authenticated user possesses one of the allowed roles
 * @param  {...string} allowedRoles - e.g. 'student', 'organizer', 'admin'
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authentication required before checking permissions.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: `Forbidden: Required role (${allowedRoles.join(' or ')}) not granted to your account (${req.user.role}).`
      });
    }

    next();
  };
};
