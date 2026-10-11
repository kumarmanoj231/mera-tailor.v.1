import { Router } from 'express';
import crypto from 'node:crypto';
import { User, Measurement, BusinessRequest, Order } from '../models.js';

const router = Router();

/**
 * Validates Svix/Clerk webhook signature
 * Headers: svix-id, svix-timestamp, svix-signature
 */
export function verifyClerkWebhook(req) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    // If not configured in test environment with explicit test bypass header, allow
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-bypass'] === 'true') {
      return true;
    }
    // Webhook secret MUST be configured for production & staging to prevent forged events
    return false;
  }

  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  // Prevent replay attacks (5 minute threshold)
  const timestampSec = parseInt(svixTimestamp, 10);
  const currentSec = Math.floor(Date.now() / 1000);
  if (Number.isNaN(timestampSec) || Math.abs(currentSec - timestampSec) > 300) {
    return false;
  }

  const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;

  const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  let secretBytes;
  try {
    secretBytes = Buffer.from(secretKey, 'base64');
  } catch {
    secretBytes = Buffer.from(secretKey, 'utf8');
  }

  const computedSig = crypto.createHmac('sha256', secretBytes).update(toSign).digest('base64');

  const signatures = String(svixSignature).split(' ');
  for (const sig of signatures) {
    const [version, signature] = sig.split(',');
    if (version === 'v1' && signature) {
      try {
        const sigBuf = Buffer.from(signature);
        const computedBuf = Buffer.from(computedSig);
        if (sigBuf.length === computedBuf.length && crypto.timingSafeEqual(sigBuf, computedBuf)) {
          return true;
        }
      } catch {
        // Continue checking other signatures if present
      }
    }
  }

  return false;
}

/**
 * POST /api/webhooks/clerk
 * Asynchronous webhook synchronization for Clerk events (user.created, user.updated, user.deleted)
 */
router.post('/webhooks/clerk', async (req, res) => {
  try {
    if (!verifyClerkWebhook(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Invalid or missing webhook signature.',
        code: 'INVALID_WEBHOOK_SIGNATURE',
      });
    }

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
