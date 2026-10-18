import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { signToken, JWT_CONFIG } from '../config/jwt.js';

// Email validation helper regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Helper to strip sensitive fields from user object
 */
const sanitizeUser = (user) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

/**
 * 1. Student Signup
 * Public signup is strictly restricted to the 'student' role.
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Name is required and must be at least 2 characters.'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'A valid email address is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: 'error',
        statusCode: 409,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // SECURITY: Public registration is strictly forced to 'student'.
    // Any role supplied in req.body is intentionally ignored.
    const assignedRole = 'student';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, assignedRole]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole
    };

    // Sign JWT
    const token = signToken(newUser);

    // Set HTTP-only Cookie
    res.cookie(JWT_CONFIG.cookieName, token, JWT_CONFIG.cookieOptions);

    return res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Student account created successfully.',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      // Use generic error message to prevent user enumeration
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid email or password.'
      });
    }

    const user = rows[0];

    // Verify password hash with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid email or password.'
      });
    }

    const safeUser = sanitizeUser(user);
    const token = signToken(safeUser);

    // Set HTTP-only Cookie
    res.cookie(JWT_CONFIG.cookieName, token, JWT_CONFIG.cookieOptions);

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Logged in successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Logout
 * Clears the HTTP-only authentication cookie
 */
export const logout = (req, res) => {
  res.clearCookie(JWT_CONFIG.cookieName, {
    httpOnly: true,
    secure: JWT_CONFIG.cookieOptions.secure,
    sameSite: JWT_CONFIG.cookieOptions.sameSite,
    path: '/'
  });

  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Logged out successfully.'
  });
};

/**
 * 4. GET /api/v1/auth/me
 * Returns current authenticated user record
 */
export const getMe = (req, res) => {
  // req.user is guaranteed and sanitized by authenticate middleware
  return res.status(200).json({
    status: 'success',
    statusCode: 200,
    data: {
      user: sanitizeUser(req.user)
    }
  });
};
