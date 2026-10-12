import { Notification, User } from '../models.js';

/**
 * Server-side notification generator helper
 * Creates a persistent notification for a specific recipient.
 * Deduplicates identical unread notifications within 15 seconds.
 */
export async function createNotification({
  recipientClerkUserId,
  title,
  message,
  type = 'general',
  link = '',
  metadata = {},
}) {
  if (!recipientClerkUserId || !title || !message) {
    return null;
  }

  try {
    const cleanUserId = String(recipientClerkUserId).trim();
    const cleanTitle = String(title).trim().slice(0, 140);
    const cleanMessage = String(message).trim().slice(0, 600);
    const cleanType = String(type).trim().toLowerCase();
    const cleanLink = String(link || '').trim().slice(0, 255);

    // De-duplication check: identical notification within last 15 seconds
    const fifteenSecondsAgo = new Date(Date.now() - 15000);
    const duplicate = await Notification.findOne({
      recipientClerkUserId: cleanUserId,
      title: cleanTitle,
      read: false,
      createdAt: { $gte: fifteenSecondsAgo },
    }).lean();

    if (duplicate) {
      return duplicate;
    }

    return await Notification.create({
      recipientClerkUserId: cleanUserId,
      title: cleanTitle,
      message: cleanMessage,
      type: cleanType,
      link: cleanLink,
      read: false,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
}

/**
 * GET /api/notifications
 * Lists notifications with pagination and read/unread filtering.
 */
export async function listNotifications(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const filter = String(req.query.filter || 'all').toLowerCase();
    const skip = (page - 1) * limit;

    const baseQuery = { recipientClerkUserId: req.authUserId };
    const query = filter === 'unread' ? { ...baseQuery, read: false } : baseQuery;

    const [rows, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipientClerkUserId: req.authUserId, read: false }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      notifications: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * GET /api/notifications/unread-count
 * Fast unread count query for dynamic bell badge polling.
 */
export async function getUnreadCount(req, res) {
  try {
    const unreadCount = await Notification.countDocuments({
      recipientClerkUserId: req.authUserId,
      read: false,
    });
    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markAsRead(req, res) {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientClerkUserId: req.authUserId },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!item) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientClerkUserId: req.authUserId,
      read: false,
    });

    res.json({ notification: item, unreadCount });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * POST /api/notifications/mark-all-read
 * Marks all notifications as read for current user.
 */
export async function markAllAsRead(req, res) {
  try {
    const result = await Notification.updateMany(
      { recipientClerkUserId: req.authUserId, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      updatedCount: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * DELETE /api/notifications/:id
 * Deletes a single notification.
 */
export async function deleteNotification(req, res) {
  try {
    const item = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientClerkUserId: req.authUserId,
    });

    if (!item) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientClerkUserId: req.authUserId,
      read: false,
    });

    res.json({ success: true, deletedId: req.params.id, unreadCount });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * DELETE /api/notifications/clear-all
 * Clears all notifications for current user.
 */
export async function clearAllNotifications(req, res) {
  try {
    const result = await Notification.deleteMany({
      recipientClerkUserId: req.authUserId,
    });

    res.json({
      success: true,
      deletedCount: result.deletedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * POST /api/notifications/broadcast
 * Admin-only broadcast announcement to all users or a specific role.
 */
export async function broadcastAnnouncement(req, res) {
  try {
    const { title, message, targetRole = 'all', link = '/dashboard' } = req.body || {};

    const cleanTitle = String(title || '').trim().slice(0, 140);
    const cleanMessage = String(message || '').trim().slice(0, 600);
    const cleanRole = String(targetRole || 'all').trim().toLowerCase();
    const cleanLink = String(link || '/dashboard').trim().slice(0, 255);

    if (!cleanTitle || !cleanMessage) {
      return res.status(400).json({ error: 'Announcement title and message are required.' });
    }

    if (!['all', 'customer', 'tailor', 'business', 'admin'].includes(cleanRole)) {
      return res.status(400).json({ error: 'Invalid target role for broadcast.' });
    }

    const filter = cleanRole === 'all' ? {} : { role: cleanRole };
    const users = await User.find(filter).select('clerkUserId').lean();

    if (!users.length) {
      return res.json({ success: true, sentCount: 0, message: 'No recipients found for this target role.' });
    }

    const docs = users.map((u) => ({
      recipientClerkUserId: u.clerkUserId,
      title: cleanTitle,
      message: cleanMessage,
      type: 'announcement',
      link: cleanLink,
      read: false,
      metadata: { broadcast: true, targetRole: cleanRole, senderAdminId: req.authUserId },
    }));

    await Notification.insertMany(docs);

    res.json({
      success: true,
      sentCount: docs.length,
      targetRole: cleanRole,
      title: cleanTitle,
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === "production" ? "An unexpected server error occurred." : error.message });
  }
}

/**
 * Server-side helper to notify all administrators of platform events
 * Deduplicates and creates persistent notifications for each admin.
 */
export async function notifyAdmins({
  title,
  message,
  type = 'bid',
  link = '/admin?tab=bulk',
  metadata = {},
}) {
  try {
    const adminIds = (process.env.CLERK_ADMIN_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const adminUsers = await User.find({ role: 'admin' }).select('clerkUserId').lean();
    const recipientIds = new Set([
      ...adminIds,
      ...adminUsers.map((u) => u.clerkUserId).filter(Boolean),
    ]);

    if (!recipientIds.size) return [];

    const notifications = await Promise.all(
      Array.from(recipientIds).map((adminId) =>
        createNotification({
          recipientClerkUserId: adminId,
          title,
          message,
          type,
          link,
          metadata,
        })
      )
    );

    return notifications.filter(Boolean);
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
    return [];
  }
}

