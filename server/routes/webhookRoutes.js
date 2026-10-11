import { Router } from 'express';
import { User, Measurement, BusinessRequest, Order } from '../models.js';

const router = Router();

/**
 * POST /api/webhooks/clerk
 * Asynchronous webhook synchronization for Clerk events (user.created, user.updated, user.deleted)
 */
router.post('/webhooks/clerk', async (req, res) => {
  try {
    const { type, data } = req.body || {};
    if (!type || !data) {
      return res.status(400).json({ error: 'Invalid webhook payload.' });
    }

    const clerkUserId = data.id;
    if (!clerkUserId) {
      return res.status(400).json({ error: 'Missing user ID in event data.' });
    }

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmail =
          data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
            ?.email_address || data.email_addresses?.[0]?.email_address;

        const role = data.public_metadata?.appRole || 'customer';

        await User.findOneAndUpdate(
          { clerkUserId },
          {
            $set: {
              clerkUserId,
              email: primaryEmail,
              firstName: data.first_name || '',
              lastName: data.last_name || '',
            },
            $setOnInsert: {
              role,
              preferredLanguage: 'en',
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return res.json({ success: true, event: type, clerkUserId });
      }

      case 'user.deleted': {
        // Cascade delete or clean up user artifacts
        await Promise.all([
          User.deleteOne({ clerkUserId }),
          Measurement.deleteMany({ clerkUserId }),
          BusinessRequest.deleteMany({ clerkUserId }),
          Order.updateMany({ clerkUserId }, { $set: { status: 'Cancelled' } }),
        ]);
        return res.json({ success: true, event: type, deleted: clerkUserId });
      }

      default:
        return res.json({ received: true, ignored: type });
    }
  } catch (error) {
    console.error('Clerk webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
