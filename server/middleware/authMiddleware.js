import { getAuth } from '@clerk/express';
import { User } from '../models.js';

export function requireAuth(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY) return res.status(503).json({ error: 'Clerk authentication is not configured on this server.' });
  const auth = getAuth(req);
  if (!auth.isAuthenticated || !auth.userId) return res.status(401).json({ error: 'Sign in is required.' });
  req.authUserId = auth.userId;
  next();
}

export async function syncAppUser(req, res, next) {
  try {
    const { clerkClient } = await import('@clerk/express');
    const externalUser = await clerkClient.users.getUser(req.authUserId);
    const primaryEmail = externalUser.emailAddresses?.find(item => item.id === externalUser.primaryEmailAddressId)?.emailAddress;
    const profile = {
      clerkUserId: externalUser.id,
      email: primaryEmail,
      firstName: externalUser.firstName || '',
      lastName: externalUser.lastName || '',
      avatar: externalUser.imageUrl || '',
      imageUrl: externalUser.imageUrl || '',
    };
    const adminIds = (process.env.CLERK_ADMIN_IDS || '').split(',').map(value => value.trim()).filter(Boolean);
    const isBootstrappedAdmin = adminIds.includes(externalUser.id);
    if (isBootstrappedAdmin) { profile.role = 'admin'; profile.onboardingCompleted = true; }
    const update = { $set: profile, $setOnInsert: { preferredLanguage: 'en' } };
    if (!isBootstrappedAdmin) update.$setOnInsert.role = 'customer';
    req.appUser = await User.findOneAndUpdate(
      { clerkUserId: externalUser.id },
      update,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    if (req.appUser.disabled) return res.status(403).json({ error: 'This account has been disabled. Contact support.' });
    next();
  } catch (error) { res.status(502).json({ error: 'Could not sync your Clerk profile to the app database.', detail: error.message }); }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.appUser || !roles.includes(req.appUser.role)) return res.status(403).json({ error: 'You do not have access to this area.' });
    next();
  };
}
