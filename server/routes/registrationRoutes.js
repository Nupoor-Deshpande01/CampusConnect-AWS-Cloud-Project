import { Router } from 'express';
import { getMyRegistrations } from '../controllers/registrationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/registrations/me - Student's registered events with status
router.get('/me', authenticate, getMyRegistrations);

export default router;
