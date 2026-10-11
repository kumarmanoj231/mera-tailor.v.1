import { Router } from 'express';
import {
  applyTailorVerification,
  createTailorReview,
  getMyStudio,
  getPlatformStats,
  getTailor,
  getTailorReviews,
  listSavedTailors,
  listTailors,
  submitB2BBid,
  toggleSavedTailor,
  updateMyStudio,
} from '../controllers/tailorController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

// Public Platform Statistics & Discovery
router.get('/platform/stats', getPlatformStats);
router.get('/tailors', listTailors);

// Authenticated Tailor Studio Management & Verification
router.get('/tailors/my-studio', requireAuth, syncAppUser, requireRole('tailor', 'admin'), getMyStudio);
router.put('/tailors/my-studio', requireAuth, syncAppUser, requireRole('tailor', 'admin'), updateMyStudio);
router.post('/tailors/apply-verification', requireAuth, syncAppUser, requireRole('tailor', 'admin'), applyTailorVerification);
router.post('/tailors/b2b-bid/:requestId', requireAuth, syncAppUser, requireRole('tailor', 'admin'), validateObjectId('requestId'), submitB2BBid);

// Single Tailor Profile & Reviews
router.get('/tailors/:id', validateObjectId('id'), getTailor);
router.get('/tailors/:id/reviews', validateObjectId('id'), getTailorReviews);
router.post('/tailors/:id/reviews', requireAuth, syncAppUser, requireRole('customer', 'business', 'admin'), validateObjectId('id'), createTailorReview);

// Tailor save action aliases
router.post('/tailors/:id/save', requireAuth, syncAppUser, requireRole('customer', 'admin'), validateObjectId('id'), toggleSavedTailor);
router.put('/tailors/:id/save', requireAuth, syncAppUser, requireRole('customer', 'admin'), validateObjectId('id'), toggleSavedTailor);

// Saved tailors collection endpoints
router.use('/saved-tailors', requireAuth, syncAppUser, requireRole('customer', 'admin'));
router.get('/saved-tailors', listSavedTailors);
router.put('/saved-tailors/:id', validateObjectId('id'), toggleSavedTailor);
router.delete('/saved-tailors/:id', validateObjectId('id'), toggleSavedTailor);

export default router;
