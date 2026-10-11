import { Business, BusinessRequest, Measurement, Order, Tailor, User } from '../models.js';
import { clerkClient } from '@clerk/express';
import { createNotification } from './notificationController.js';
import { getOrSyncBusinessProfile } from '../utils/businessProfileMigration.js';

export const publicUser = user => ({
  id: user._id?.toString?.() || user.clerkUserId,
  clerkUserId: user.clerkUserId,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  phone: user.phone || '',
  bio: user.bio || '',
  avatar: user.avatar || user.imageUrl || '',
  imageUrl: user.imageUrl || user.avatar || '',
  preferredLanguage: user.preferredLanguage || 'en',
  role: user.role || 'customer',
  onboardingCompleted: Boolean(user.onboardingCompleted),
  roleInconsistent: !['customer', 'tailor', 'business', 'admin'].includes(user.role),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  savedTailorsCount: Array.isArray(user.savedTailors) ? user.savedTailors.length : 0,
  location: user.primaryLocation
    ? {
        coordinates: user.primaryLocation.coordinates,
        label: user.locationLabel,
        source: user.locationSource,
        accuracyMeters: user.locationAccuracyMeters,
        consentedAt: user.locationConsentAt,
      }
    : null,
  searchPreferences: user.searchPreferences || {
    radiusKm: 10,
    categories: [],
    sortBy: 'recommended',
  },
});

/**
 * GET /api/users/me or /api/users/profile
 */
export function getCurrentUser(req, res) {
  res.json(publicUser(req.appUser));
}

/**
 * POST /api/users/onboarding
 */
export async function completeOnboarding(req, res) {
  const role = String(req.body.role || '').trim().toLowerCase();
  if (!['customer', 'tailor', 'business'].includes(role)) {
    return res.status(400).json({
      error: 'Choose a valid account type (customer, tailor, or business). Admin accounts must be configured by an administrator.',
    });
  }

  try {
    const existingUser = req.appUser;

    // 1. Role Immutability: If onboarding is already completed, the role is permanent and cannot be changed
    if (existingUser?.onboardingCompleted) {
      if (existingUser.role && existingUser.role !== role) {
        return res.status(409).json({
          error: `Account role is permanent and cannot be changed. Your registered role is ${existingUser.role}.`,
          code: 'ROLE_IMMUTABLE',
          currentRole: existingUser.role,
        });
      }
      return res.json(publicUser(existingUser));
    }

    // 2. If user already has a non-customer role assigned (tailor/business/admin), prevent altering it
    if (existingUser?.role && ['tailor', 'business', 'admin'].includes(existingUser.role) && existingUser.role !== role) {
      return res.status(409).json({
        error: `Account role is permanent and cannot be changed. Your registered role is ${existingUser.role}.`,
        code: 'ROLE_IMMUTABLE',
        currentRole: existingUser.role,
      });
    }

    const values = { role, onboardingCompleted: true };
    if (['en', 'hi'].includes(req.body.preferredLanguage)) {
      values.preferredLanguage = req.body.preferredLanguage;
    }

    const user = await User.findOneAndUpdate(
      { clerkUserId: req.authUserId },
      { $set: values },
      { new: true, runValidators: true }
    );

    req.appUser = user;

    // 3. Idempotently create role-specific profile records
    if (role === 'tailor') {
      let tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
      if (!tailor) {
        const tailorName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Master Artisan';
        const defaultStudioName = user.firstName ? `${user.firstName}'s Bespoke Atelier` : 'MeraTailor Atelier';
        const city = user.locationLabel?.split(',')?.[0]?.trim() || 'Jaipur';

        await Tailor.create({
          ownerClerkUserId: req.authUserId,
          name: defaultStudioName,
          owner: tailorName,
          area: user.locationLabel?.split(',')?.[1]?.trim() || 'Central Market',
          city,
          state: 'Rajasthan',
          country: 'India',
          phone: user.phone || '',
          description: '',
          minPrice: 499,
          experience: 0,
          rating: 0,
          reviews: 0,
          status: 'Available',
          capacitySlots: 10,
          activeSlotsBooked: 0,
          categories: [],
          languages: ['Hindi', 'English'],
          services: [],
          location: user.primaryLocation || { type: 'Point', coordinates: [75.7873, 26.9124] },
          verified: false,
          verificationStatus: 'unverified',
        });
      }
    } else if (role === 'business') {
      await getOrSyncBusinessProfile(req.authUserId, user);
    }

    // Mirror to Clerk public metadata asynchronously
    clerkClient.users
      .updateUserMetadata(req.authUserId, {
        publicMetadata: { appRole: role },
      })
      .catch(error => {
        console.warn('Clerk role metadata mirror warning:', error.message);
      });

    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Welcome to MeraTailor',
      message: `Your ${role} profile is now active! You can now explore tailored services, bookings, and fittings.`,
      type: 'general',
      link: role === 'admin' ? '/admin' : '/dashboard',
    }).catch(() => {});

    return res.json(publicUser(user));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/users/me or /api/users/profile
 */
export async function updateProfile(req, res) {
  const allowed = {};

  if (typeof req.body.firstName === 'string') {
    allowed.firstName = req.body.firstName.trim().slice(0, 80);
  }
  if (typeof req.body.lastName === 'string') {
    allowed.lastName = req.body.lastName.trim().slice(0, 80);
  }
  if (typeof req.body.phone === 'string') {
    allowed.phone = req.body.phone.trim().slice(0, 30);
  }
  if (typeof req.body.bio === 'string') {
    allowed.bio = req.body.bio.trim().slice(0, 500);
  }
  if (['en', 'hi'].includes(req.body.preferredLanguage)) {
    allowed.preferredLanguage = req.body.preferredLanguage;
  }

  if (req.body.searchPreferences && typeof req.body.searchPreferences === 'object') {
    const radiusKm = Number(req.body.searchPreferences.radiusKm);
    if (Number.isFinite(radiusKm) && radiusKm >= 1 && radiusKm <= 100) {
      allowed['searchPreferences.radiusKm'] = radiusKm;
    }
    if (['recommended', 'distance', 'rating', 'price'].includes(req.body.searchPreferences.sortBy)) {
      allowed['searchPreferences.sortBy'] = req.body.searchPreferences.sortBy;
    }
    if (Array.isArray(req.body.searchPreferences.categories)) {
      allowed['searchPreferences.categories'] = req.body.searchPreferences.categories
        .map(String)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 12);
    }
  }

  try {
    const user = await User.findOneAndUpdate(
      { clerkUserId: req.authUserId },
      { $set: allowed },
      { new: true, runValidators: true }
    );

    req.appUser = user;

    if (allowed.firstName !== undefined || allowed.lastName !== undefined) {
      clerkClient.users
        .updateUser(req.authUserId, {
          firstName: allowed.firstName ?? req.appUser.firstName ?? '',
          lastName: allowed.lastName ?? req.appUser.lastName ?? '',
        })
        .catch(error => {
          console.warn('Clerk name mirror warning:', error.message);
        });
    }

    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Profile Updated',
      message: 'Your personal account profile details were successfully updated.',
      type: 'profile',
      link: '/dashboard',
    }).catch(() => {});

    res.json(publicUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PUT /api/users/location
 */
export async function updateLocation(req, res) {
  const { latitude, longitude, label, source, accuracyMeters, consent } = req.body;
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (consent !== true) {
    return res.status(400).json({ error: 'Explicit location consent is required.' });
  }
  if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'A valid latitude (-90 to 90) and longitude (-180 to 180) are required.' });
  }
  if (!['browser', 'manual'].includes(source)) {
    return res.status(400).json({ error: 'Choose browser or manual as the location source.' });
  }

  const location = { type: 'Point', coordinates: [lng, lat] };
  const values = {
    primaryLocation: location,
    locationLabel: String(label || '').trim().slice(0, 180),
    locationSource: source,
    locationConsentAt: new Date(),
    locationAccuracyMeters: Number.isFinite(Number(accuracyMeters)) ? Math.max(0, Number(accuracyMeters)) : undefined,
  };

  try {
    const user = await User.findOneAndUpdate(
      { clerkUserId: req.authUserId },
      { $set: values },
      { new: true, runValidators: true }
    );
    req.appUser = user;
    res.json(publicUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/users/dashboard
 * Aggregated customer dashboard
 */
export async function getUserDashboard(req, res) {
  try {
    let orders = await Order.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    const measurements = await Measurement.find({ clerkUserId: req.authUserId }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    const userDoc = await User.findOne({ clerkUserId: req.authUserId }).lean();
    
    // Find saved tailors that ACTUALLY still exist in database
    const savedIds = (userDoc?.savedTailors || []).map(item => item.tailorId).filter(Boolean);
    const savedTailors = savedIds.length ? await Tailor.find({ _id: { $in: savedIds } }).lean() : [];
    
    // Self-healing clean-up: if any tailor was deleted from database, clean userDoc.savedTailors
    if (savedTailors.length !== savedIds.length) {
      const existingIdSet = new Set(savedTailors.map(t => String(t._id)));
      const cleanedSavedTailors = (userDoc?.savedTailors || []).filter(item => existingIdSet.has(String(item.tailorId)));
      await User.updateOne({ clerkUserId: req.authUserId }, { $set: { savedTailors: cleanedSavedTailors } });
    }

    // Process orders: verify if tailor exists in DB
    // If tailor was deleted and order is Completed, show 'undefined' in tailorName as requested
    const orderTailorIds = [...new Set(orders.map(o => o.tailorId).filter(Boolean))];
    const existingOrderTailors = orderTailorIds.length
      ? await Tailor.find({ _id: { $in: orderTailorIds } }).select('_id name').lean()
      : [];
    const existingTailorMap = new Map(existingOrderTailors.map(t => [String(t._id), t.name]));

    orders = orders.map(order => {
      const tailorExists = order.tailorId && existingTailorMap.has(String(order.tailorId));
      if (!tailorExists && order.status === 'Completed') {
        return { ...order, tailorName: 'undefined' };
      }
      return order;
    });

    res.json({
      user: publicUser(req.appUser),
      stats: {
        newRequests: orders.filter(o => o.status === 'Request Sent').length,
        quotesReady: orders.filter(o => o.status === 'Quote Received').length,
        activeOrders: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length,
        completedOrders: orders.filter(o => o.status === 'Completed').length,
        savedTailorsCount: savedTailors.length,
        measurementsCount: measurements.length,
      },
      // Backward compatibility aliases
      newRequests: orders.filter(o => o.status === 'Request Sent').length,
      activeOrders: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'Completed').length,
      savedTailorsCount: savedTailors.length,
      measurementsCount: measurements.length,
      orders,
      measurements,
      savedTailors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/users/tailor-dashboard or /api/tailor/dashboard
 */
export async function getTailorDashboard(req, res) {
  try {
    let tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
    if (!tailor && req.appUser?.phone) {
      tailor = await Tailor.findOne({ phone: req.appUser.phone });
      if (tailor) {
        tailor.ownerClerkUserId = req.authUserId;
        await tailor.save();
      }
    }

    // If no details available in tailor field, CREATE BY UPDATING MODEL in database
    if (!tailor) {
      const user = req.appUser || {};
      const tailorName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Master Artisan';
      const defaultStudioName = user.firstName ? `${user.firstName}'s Bespoke Atelier` : 'MeraTailor Atelier';
      const city = user.locationLabel?.split(',')?.[0]?.trim() || 'Jaipur';

      tailor = await Tailor.create({
        ownerClerkUserId: req.authUserId,
        name: defaultStudioName,
        owner: tailorName,
        area: user.locationLabel?.split(',')?.[1]?.trim() || 'Central Market',
        city,
        state: 'Rajasthan',
        country: 'India',
        phone: user.phone || '',
        description: '',
        minPrice: 499,
        experience: 0,
        rating: 0,
        reviews: 0,
        status: 'Available',
        capacitySlots: 10,
        activeSlotsBooked: 0,
        categories: [],
        languages: ['Hindi', 'English'],
        services: [],
        location: user.primaryLocation || { type: 'Point', coordinates: [75.7873, 26.9124] },
        verified: false,
        verificationStatus: 'unverified',
      });
    }

    // Fetch authentic client orders for this tailor
    const requests = await Order.find({ tailorId: tailor._id }).sort({ createdAt: -1 }).lean();

    // Fetch authentic B2B Bulk Requirements
    // 1. Open market demands available for bidding
    const bulkRequirements = await BusinessRequest.find({
      status: { $in: ['open', 'submitted', 'reviewing', 'quoted'] },
      isVerifiedBusiness: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    // 2. Awarded Tenders won by this tailor
    const awardedTenders = await BusinessRequest.find({
      $or: [
        { awardedTailorId: tailor._id },
        { 'quotes.tailorClerkUserId': req.authUserId, 'quotes.status': 'accepted' },
        { status: 'awarded', 'quotes.tailorClerkUserId': req.authUserId, 'quotes.status': 'accepted' },
      ],
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    // 3. Tenders this tailor submitted quotes for
    const myQuotedTenders = await BusinessRequest.find({
      $or: [
        { 'quotes.tailorClerkUserId': req.authUserId },
        { 'quotes.tailorId': tailor._id },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Calculations across status
    const completedOrders = requests.filter(r => r.status === 'Completed');
    const inProductionOrders = requests.filter(r => r.status === 'In Production');
    const newInquiries = requests.filter(r => r.status === 'Request Sent');
    const acceptedOrders = requests.filter(r => r.status === 'Accepted');
    const readyOrders = requests.filter(r => r.status === 'Ready for Pickup');

    const completedEarnings = completedOrders.reduce((sum, r) => sum + (Number(r.quotePrice ?? r.price) || 0), 0);
    const activePipelineEarnings = [...inProductionOrders, ...acceptedOrders, ...readyOrders].reduce(
      (sum, r) => sum + (Number(r.quotePrice ?? r.price) || 0),
      0
    );
    const totalRevenue = completedEarnings + activePipelineEarnings;

    // Time-window revenue filters
    const nowMs = Date.now();
    const ms7d = 7 * 24 * 60 * 60 * 1000;
    const ms30d = 30 * 24 * 60 * 60 * 1000;
    const ms90d = 90 * 24 * 60 * 60 * 1000;

    const calcTimeRevenue = ms =>
      requests
        .filter(r => new Date(r.createdAt || nowMs).getTime() >= nowMs - ms && r.status !== 'Cancelled')
        .reduce((sum, r) => sum + (Number(r.quotePrice ?? r.price) || 0), 0);

    const earnings7d = calcTimeRevenue(ms7d);
    const earnings30d = calcTimeRevenue(ms30d);
    const earnings90d = calcTimeRevenue(ms90d);

    // Dynamic weekly revenue buckets for SVG chart
    const w1 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 21 * 86400000 && diff < 30 * 86400000 && r.status !== 'Cancelled';
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w2 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 14 * 86400000 && diff < 21 * 86400000 && r.status !== 'Cancelled';
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w3 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 7 * 86400000 && diff < 14 * 86400000 && r.status !== 'Cancelled';
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w4 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff < 7 * 86400000 && r.status !== 'Cancelled';
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    // Workshop capacity & turnaround
    const capacitySlots = tailor.capacitySlots || 10;
    const activeSlots = [...inProductionOrders, ...acceptedOrders, ...readyOrders].length;
    const capacityPct = Math.min(100, Math.round((activeSlots / (capacitySlots || 1)) * 100));

    // Turnaround average from services
    const serviceList = Array.isArray(tailor.services) && tailor.services.length ? tailor.services : [];
    const avgLeadDays = serviceList.length
      ? Math.round((serviceList.reduce((acc, s) => acc + (s.days || 5), 0) / serviceList.length) * 10) / 10
      : 0;

    const tailorObj = tailor.toObject ? tailor.toObject() : { ...tailor };
    const userAvatar = req.appUser?.avatar || req.appUser?.imageUrl || '';
    if (userAvatar && (!tailorObj.image || tailorObj.image.includes('unsplash.com'))) {
      tailorObj.image = userAvatar;
    }

    res.json({
      tailor: tailorObj,
      user: publicUser(req.appUser || {}),
      requests,
      bulkRequirements,
      awardedTenders,
      myQuotedTenders,
      earnings: {
        totalEarnings: totalRevenue,
        completedEarnings,
        pendingEarnings: activePipelineEarnings,
        earnings7d,
        earnings30d,
        earnings90d,
        weeklyData: [w1, w2, w3, w4],
      },
      pipeline: {
        newInquiries: newInquiries.length,
        measurements: acceptedOrders.length,
        cuttingAndStitch: inProductionOrders.length,
        qualityCheck: readyOrders.length,
        readyDelivered: completedOrders.length,
      },
      capacity: {
        capacitySlots,
        activeSlots,
        capacityPct,
        avgLeadDays,
      },
      stats: {
        totalRequests: requests.length,
        pendingQuotes: newInquiries.length,
        inProduction: inProductionOrders.length,
        completed: completedOrders.length,
        openOrders: requests.filter(r => !['Completed', 'Cancelled'].includes(r.status)).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/users/business-dashboard or /api/business/dashboard
 */
export async function getBusinessDashboard(req, res) {
  try {
    const user = req.appUser || (await User.findOne({ clerkUserId: req.authUserId }).lean());
    let business = await Business.findOne({ ownerClerkUserId: req.authUserId }).lean();
    if (!business && user) {
      business = await getOrSyncBusinessProfile(req.authUserId, user);
      if (business?.toObject) business = business.toObject();
    }

    const requests = await BusinessRequest.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    const bp = business || user?.businessProfile || {};

    res.json({
      business: bp,
      businessProfile: bp,
      user: user ? publicUser(user) : null,
      requests,
      bulkOrders: requests,
      stats: {
        totalRequirements: requests.length,
        submitted: requests.filter(r => r.status === 'submitted').length,
        quoted: requests.filter(r => r.status === 'quoted').length,
        inProduction: requests.filter(r => r.status === 'in-production').length,
        completed: requests.filter(r => r.status === 'completed').length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/users/saved-tailors
 */
export async function listUserSavedTailors(req, res) {
  try {
    const userDoc = await User.findOne({ clerkUserId: req.authUserId }).lean();
    const ids = (userDoc?.savedTailors || []).map(item => item.tailorId).filter(Boolean);
    const rows = ids.length ? await Tailor.find({ _id: { $in: ids } }).lean() : [];
    
    // Self-healing synchronization: remove any deleted tailors from User doc
    if (rows.length !== ids.length) {
      const liveIdSet = new Set(rows.map(t => String(t._id)));
      const cleanList = (userDoc?.savedTailors || []).filter(item => liveIdSet.has(String(item.tailorId)));
      await User.updateOne({ clerkUserId: req.authUserId }, { $set: { savedTailors: cleanList } });
    }
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /api/users/saved-tailors/:tailorId
 */
export async function saveTailor(req, res) {
  try {
    const tailorId = req.params.tailorId || req.params.id;
    if (!/^[a-f\d]{24}$/i.test(tailorId)) {
      return res.status(400).json({ error: 'Valid tailor identifier required.' });
    }

    const tailor = await Tailor.findById(tailorId);
    if (!tailor) return res.status(404).json({ error: 'Tailor studio not found.' });

    const userDoc = await User.findOne({ clerkUserId: req.authUserId });
    const saved = userDoc?.savedTailors || [];
    const wasSaved = saved.some(item => String(item.tailorId) === String(tailor._id));
    const shouldSave = typeof req.body?.saved === 'boolean' ? req.body.saved : !wasSaved;

    await User.updateOne(
      { clerkUserId: req.authUserId },
      shouldSave
        ? { $addToSet: { savedTailors: { tailorId: tailor._id, savedAt: new Date() } } }
        : { $pull: { savedTailors: { tailorId: tailor._id } } }
    );

    res.json({ saved: shouldSave, tailorId: tailor._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/users/saved-tailors/:tailorId
 */
export async function unsaveTailor(req, res) {
  try {
    const tailorId = req.params.tailorId || req.params.id;
    if (!/^[a-f\d]{24}$/i.test(tailorId)) {
      return res.status(400).json({ error: 'Valid tailor identifier required.' });
    }

    await User.updateOne(
      { clerkUserId: req.authUserId },
      { $pull: { savedTailors: { tailorId } } }
    );

    res.json({ saved: false, tailorId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/users/me or /api/users/account
 * Completely deletes the current user in both MongoDB and Clerk
 */
export async function deleteCurrentUserAccount(req, res) {
  try {
    const clerkId = req.authUserId;
    if (!clerkId) {
      return res.status(401).json({ error: 'User identifier missing.' });
    }

    // 1. Delete associated customer data in MongoDB
    await Promise.all([
      Measurement.deleteMany({ clerkUserId: clerkId }),
      BusinessRequest.deleteMany({ clerkUserId: clerkId }),
      Order.updateMany({ clerkUserId: clerkId }, { $set: { status: 'Cancelled' } }),
    ]);

    // 2. Delete user document in MongoDB
    await User.deleteOne({ clerkUserId: clerkId });

    // 3. Delete user account in Clerk
    try {
      await clerkClient.users.deleteUser(clerkId);
    } catch (clerkErr) {
      console.warn('Clerk user deletion warning:', clerkErr.message);
    }

    res.json({ success: true, message: 'Account and associated data deleted from database and authentication provider.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

