import { Router } from 'express';
import {
  createAdminTailor,
  createAdminTestUser,
  deleteAdminTailor,
  deleteAdminUser,
  getAdminDashboardSummary,
  listAdminNotifications,
  listAdminTailors,
  listAdminUsers,
  listPendingVerifications,
  rejectTailor,
  updateAdminTailor,
  updateAdminUser,
  verifyTailor,
  listAdminBusinesses,
  verifyBusiness,
  rejectBusiness,
} from '../controllers/adminController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use('/admin', requireAuth, syncAppUser, requireRole('admin'));

// Executive Dashboard & Notifications
router.get('/admin/dashboard-summary', getAdminDashboardSummary);
router.get('/admin/notifications', listAdminNotifications);

// User Management
router.get('/admin/users', listAdminUsers);
router.post('/admin/users', createAdminTestUser);
router.patch('/admin/users/:id', validateObjectId('id'), updateAdminUser);
router.delete('/admin/users/:id', validateObjectId('id'), deleteAdminUser);

// Tailor Studio Management & Verification
router.get('/admin/tailors', listAdminTailors);
router.post('/admin/tailors', createAdminTailor);
router.patch('/admin/tailors/:id', validateObjectId('id'), updateAdminTailor);
router.delete('/admin/tailors/:id', validateObjectId('id'), deleteAdminTailor);

router.get('/admin/verifications', listPendingVerifications);
router.patch('/admin/tailors/:id/verify', validateObjectId('id'), verifyTailor);
router.patch('/admin/tailors/:id/reject', validateObjectId('id'), rejectTailor);

// Business Accounts & GSTIN Verification
router.get('/admin/businesses', listAdminBusinesses);
router.patch('/admin/businesses/:id/verify', validateObjectId('id'), verifyBusiness);
router.patch('/admin/businesses/:id/reject', validateObjectId('id'), rejectBusiness);

export default router;
