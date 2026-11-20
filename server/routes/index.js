import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import registrationRoutes from './registrationRoutes.js';

const router = Router();

// Mount v1 authentication routes -> /api/v1/auth
router.use('/v1/auth', authRoutes);

// Mount v1 events routes -> /api/v1/events
router.use('/v1/events', eventRoutes);

// Mount v1 registrations routes -> /api/v1/registrations
router.use('/v1/registrations', registrationRoutes);

// Mount v1 health route -> /api/v1/health
router.use('/v1', healthRoutes);

// Fallback alias -> /api/health
router.use('/', healthRoutes);

export default router;
