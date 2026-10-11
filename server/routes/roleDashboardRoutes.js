import { Router } from 'express';
import { getBusinessDashboard, getTailorDashboard } from '../controllers/userController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';

const router = Router();

// Backward-compatible aliases for /api/tailor/dashboard and /api/business/dashboard
router.get('/tailor/dashboard', requireAuth, syncAppUser, requireRole('tailor', 'admin'), getTailorDashboard);
router.get('/business/dashboard', requireAuth, syncAppUser, requireRole('business', 'admin'), getBusinessDashboard);

export default router;
