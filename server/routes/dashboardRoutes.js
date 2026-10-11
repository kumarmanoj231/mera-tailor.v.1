import { Router } from 'express';
import { getUserDashboard } from '../controllers/userController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';

const router = Router();

// Backward-compatible alias for /api/dashboard
router.get('/dashboard', requireAuth, syncAppUser, requireRole('customer', 'admin'), getUserDashboard);

export default router;
