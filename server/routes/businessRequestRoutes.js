import { Router } from 'express';
import {
  createBusinessRequest,
  deleteBusinessRequest,
  getBusinessProfile,
  getBusinessRequest,
  listBusinessRequests,
  submitQuote,
  updateBusinessProfile,
  updateBusinessRequest,
  updateQuoteStatus,
  withdrawQuote,
} from '../controllers/businessRequestController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';
import { getBusinessDashboard } from '../controllers/userController.js';

const router = Router();

// 1. Business Profile & GSTIN Verification Application
router.get('/business/profile', requireAuth, syncAppUser, getBusinessProfile);
router.put('/business/profile', requireAuth, syncAppUser, requireRole('business', 'admin'), updateBusinessProfile);

// Bulk orders dashboard alias
router.get('/bulk-orders', requireAuth, syncAppUser, getBusinessDashboard);

// 2. B2B Commercial Tenders & Bulk RFQs (Tailor, Business, Admin)
router.use('/business-requests', requireAuth, syncAppUser, requireRole('business', 'tailor', 'admin'));

router.get('/business-requests', listBusinessRequests);
router.get('/business-requests/:id', validateObjectId('id'), getBusinessRequest);
router.post('/business-requests', requireRole('business', 'admin'), createBusinessRequest);
router.put('/business-requests/:id', validateObjectId('id'), updateBusinessRequest);
router.patch('/business-requests/:id', validateObjectId('id'), updateBusinessRequest);
router.delete('/business-requests/:id', validateObjectId('id'), deleteBusinessRequest);

// 3. Tailor Quotation & Bidding Routes
router.post('/business-requests/:id/quotes', validateObjectId('id'), requireRole('tailor', 'admin'), submitQuote);
router.patch('/business-requests/:id/quotes/:quoteId/status', validateObjectId('id'), validateObjectId('quoteId'), updateQuoteStatus);
router.delete('/business-requests/:id/quotes/:quoteId', validateObjectId('id'), validateObjectId('quoteId'), withdrawQuote);

export default router;
