import { Router } from 'express';
import {
  acceptOrderQuote,
  cancelCustomerOrder,
  createOrder,
  declineOrder,
  deleteOrder,
  getOrder,
  getOrderMessages,
  listOrders,
  sendOrderMessage,
  sendOrderQuote,
  updateOrderStatus,
  updateProductionMilestone,
} from '../controllers/orderController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateOrderId } from '../middleware/validate.js';
import { orderCreationLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const signedIn = [requireAuth, syncAppUser];

router.get('/orders', ...signedIn, listOrders);
router.post('/orders', orderCreationLimiter, ...signedIn, requireRole('customer', 'admin'), createOrder);

router.get('/orders/:id', ...signedIn, validateOrderId, getOrder);
router.delete('/orders/:id', ...signedIn, validateOrderId, deleteOrder);

router.patch('/orders/:id/quote', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, sendOrderQuote);
router.patch('/orders/:id/decline', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, declineOrder);
router.patch('/orders/:id/accept', ...signedIn, requireRole('customer', 'admin'), validateOrderId, acceptOrderQuote);
router.patch('/orders/:id/cancel', ...signedIn, requireRole('customer', 'business', 'admin'), validateOrderId, cancelCustomerOrder);
router.put('/orders/:id/cancel', ...signedIn, requireRole('customer', 'business', 'admin'), validateOrderId, cancelCustomerOrder);
router.patch('/orders/:id/status', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, updateOrderStatus);
router.patch('/orders/:id/milestone', ...signedIn, requireRole('tailor', 'admin'), validateOrderId, updateProductionMilestone);

// Order-linked communication
router.get('/orders/:id/messages', ...signedIn, validateOrderId, getOrderMessages);
router.post('/orders/:id/messages', ...signedIn, validateOrderId, sendOrderMessage);

export default router;
