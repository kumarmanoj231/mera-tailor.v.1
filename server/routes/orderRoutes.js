import { Router } from 'express';
import {
  acceptOrderQuote,
  createOrder,
  declineOrder,
  deleteOrder,
  getOrder,
  listOrders,
  sendOrderQuote,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateOrderId } from '../middleware/validate.js';

const router = Router();
const signedIn = [requireAuth, syncAppUser];

router.get('/orders', ...signedIn, listOrders);
router.post('/orders', ...signedIn, requireRole('customer', 'admin'), createOrder);

router.get('/orders/:id', ...signedIn, validateOrderId, getOrder);
router.delete('/orders/:id', ...signedIn, validateOrderId, deleteOrder);

router.patch('/orders/:id/quote', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, sendOrderQuote);
router.patch('/orders/:id/decline', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, declineOrder);
router.patch('/orders/:id/accept', ...signedIn, requireRole('customer', 'admin'), validateOrderId, acceptOrderQuote);
router.patch('/orders/:id/status', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, updateOrderStatus);

export default router;
