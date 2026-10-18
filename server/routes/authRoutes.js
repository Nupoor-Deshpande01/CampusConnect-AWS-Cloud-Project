import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Authentication Endpoints (Rate Limited)
router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);

// Protected Identity Endpoint
router.get('/me', authenticate, getMe);

// Protected Role-Authorization Verification Endpoints
router.get('/student-only', authenticate, authorize('student'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to the Student Hub', user: req.user });
});

router.get('/organizer-only', authenticate, authorize('organizer', 'admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to Organizer Operations', user: req.user });
});

router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to Admin System Ops', user: req.user });
});

export default router;
