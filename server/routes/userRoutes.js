import { Router } from 'express';
import {
  completeOnboarding,
  getCurrentUser,
  getBusinessDashboard,
  getTailorDashboard,
  getUserDashboard,
  listUserSavedTailors,
  saveTailor,
  unsaveTailor,
  updateLocation,
  updateProfile,
  deleteCurrentUserAccount,
} from '../controllers/userController.js';
import {
  createMeasurement,
  deleteMeasurement,
  listMeasurements,
  updateMeasurement,
} from '../controllers/measurementController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

// Secure user routes with Clerk auth & MongoDB profile sync
const userAuthPaths = [
  '/me',
  '/profile',
  '/account',
  '/onboarding',
  '/location',
  '/dashboard',
  '/tailor-dashboard',
  '/business-dashboard',
  '/saved-tailors',
  '/measurements',
];
router.use(userAuthPaths, requireAuth, syncAppUser);

// -------------------------------------------------------------
// USER PROFILE & PREFERENCES
// -------------------------------------------------------------
router.get('/me', getCurrentUser);
router.get('/profile', getCurrentUser);
router.patch('/me', updateProfile);
router.patch('/profile', updateProfile);
router.delete('/me', deleteCurrentUserAccount);
router.delete('/account', deleteCurrentUserAccount);
router.post('/onboarding', completeOnboarding);
router.put('/location', updateLocation);

// -------------------------------------------------------------
// ROLE & USER DASHBOARDS
// -------------------------------------------------------------
router.get('/dashboard', requireRole('customer', 'admin'), getUserDashboard);
router.get('/tailor-dashboard', requireRole('tailor', 'admin'), getTailorDashboard);
router.get('/business-dashboard', requireRole('business', 'admin'), getBusinessDashboard);

// -------------------------------------------------------------
// USER SAVED TAILOR STUDIOS (RESTful Sub-resource)
// -------------------------------------------------------------
router.get('/saved-tailors', listUserSavedTailors);
router.put('/saved-tailors/:tailorId', validateObjectId('tailorId'), saveTailor);
router.delete('/saved-tailors/:tailorId', validateObjectId('tailorId'), unsaveTailor);

// -------------------------------------------------------------
// USER MEASUREMENTS (RESTful Sub-resource)
// -------------------------------------------------------------
router.get('/measurements', listMeasurements);
router.post('/measurements', createMeasurement);
router.put('/measurements/:id', validateObjectId('id'), updateMeasurement);
router.patch('/measurements/:id', validateObjectId('id'), updateMeasurement);
router.delete('/measurements/:id', validateObjectId('id'), deleteMeasurement);

export default router;
