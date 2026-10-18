import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Mount v1 authentication routes -> /api/v1/auth
router.use('/v1/auth', authRoutes);

// Mount v1 health route -> /api/v1/health
router.use('/v1', healthRoutes);

// Fallback alias -> /api/health
router.use('/', healthRoutes);

export default router;
