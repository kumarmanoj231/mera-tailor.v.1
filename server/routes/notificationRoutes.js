import { Router } from 'express';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  broadcastAnnouncement,
} from '../controllers/notificationController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();
const signedIn = [requireAuth, syncAppUser];

router.get('/notifications', ...signedIn, listNotifications);
router.get('/notifications/unread-count', ...signedIn, getUnreadCount);
router.patch('/notifications/:id/read', ...signedIn, validateObjectId('id'), markAsRead);
router.post('/notifications/mark-all-read', ...signedIn, markAllAsRead);
router.delete('/notifications/clear-all', ...signedIn, clearAllNotifications);
router.delete('/notifications/:id', ...signedIn, validateObjectId('id'), deleteNotification);
router.post('/notifications/broadcast', ...signedIn, requireRole('admin'), broadcastAnnouncement);

export default router;
