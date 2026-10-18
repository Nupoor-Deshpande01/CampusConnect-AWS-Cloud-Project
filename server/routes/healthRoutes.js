import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';

const router = Router();

// GET /api/v1/health
router.get('/health', getHealthStatus);

export default router;
