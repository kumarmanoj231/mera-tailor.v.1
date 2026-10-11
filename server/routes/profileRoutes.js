import { Router } from 'express';
import { completeOnboarding, getCurrentUser, updateLocation, updateProfile } from '../controllers/userController.js';
import { requireAuth, syncAppUser } from '../middleware/authMiddleware.js';

const router = Router();

// Backward-compatible alias routes for /me and /profile
router.use(['/me', '/profile'], requireAuth, syncAppUser);
router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.post('/me/onboarding', completeOnboarding);
router.put('/me/location', updateLocation);

router.get('/profile', getCurrentUser);
router.patch('/profile', updateProfile);

export default router;
