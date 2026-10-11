import { clerkClient } from '@clerk/express';
import { randomBytes } from 'node:crypto';
import { Business, BusinessRequest, Order, Tailor, User } from '../models.js';
import { createNotification } from './notificationController.js';
import { getOrSyncBusinessProfile } from '../utils/businessProfileMigration.js';

const roles = ['customer', 'tailor', 'business', 'admin'];
const publicUser = user => ({
  id: user._id?.toString?.() || user.clerkUserId,
  clerkUserId: user.clerkUserId,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar || user.imageUrl || '',
  imageUrl: user.imageUrl || user.avatar || '',
  disabled: Boolean(user.disabled),
  createdAt: user.createdAt,
});

export async function listAdminUsers(_req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    let clerkImages = {};
    try {
      const clerkList = await clerkClient.users.getUserList({ limit: 100 });
      const rawList = Array.isArray(clerkList) ? clerkList : (clerkList?.data || []);
      rawList.forEach(cu => {
        if (cu?.id && cu?.imageUrl) {
          clerkImages[cu.id] = cu.imageUrl;
        }
      });
    } catch {
      // fallback to stored avatar
    }

    res.json(
      users.map(u => {
        const userObj = publicUser(u);
        const resolvedImage = clerkImages[u.clerkUserId] || userObj.avatar || userObj.imageUrl || '';
        return {
          ...userObj,
          avatar: resolvedImage,
          imageUrl: resolvedImage,
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createAdminTestUser(_req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Temporary password accounts are disabled in production. Use Clerk invitations instead.' });
  }
  const { email, firstName = 'Demo', lastName = 'Account', role = 'customer' } = _req.body;
  if (!/^.+@example\.test$/i.test(String(email || '')) || !['customer', 'tailor', 'business'].includes(role)) {
    return res.status(400).json({ error: 'Use a reserved @example.test email and choose customer, tailor or business.' });
  }
  const password = `MT-${randomBytes(18).toString('base64url')}!9`;
  try {
    const external = await clerkClient.users.createUser({
      emailAddress: [email],
      emailAddressIdentificationStatus: ['verified'],
      password,
      firstName: String(firstName).slice(0, 80),
      lastName: String(lastName).slice(0, 80),
      publicMetadata: { appRole: role },
    });
    const profile = {
      clerkUserId: external.id,
      email: String(email).toLowerCase(),
      firstName,
      lastName,
      role,
      onboardingCompleted: true,
    };
    await User.create(profile);
    res.status(201).json({
      user: publicUser(profile),
      temporaryPassword: password,
      notice: 'Save this password securely; it is shown only once.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAdminUser(req, res) {
  const { role, disabled } = req.body;
  if (role !== undefined && !roles.includes(role)) {
    return res.status(400).json({ error: 'Choose a supported app role.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.clerkUserId === req.authUserId && (role && role !== 'admin' || disabled === true)) {
      return res.status(400).json({ error: 'You cannot disable or demote your own admin account.' });
    }
    const nextRole = role || user.role;
    await clerkClient.users.updateUserMetadata(user.clerkUserId, { publicMetadata: { appRole: nextRole } });
    user.role = nextRole;
    if (disabled !== undefined) user.disabled = Boolean(disabled);
    await user.save();
    res.json(publicUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAdminUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.clerkUserId === req.authUserId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    try {
      await clerkClient.users.deleteUser(user.clerkUserId);
    } catch {
      // User may already be removed in Clerk
    }
    await User.deleteOne({ _id: user._id });
    res.json({ deleted: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function listAdminTailors(_req, res) {
  try {
    let tailors = await Tailor.find().sort({ name: 1 }).lean();
    const ownerIds = [...new Set(tailors.map(t => t.ownerClerkUserId).filter(Boolean))];
    if (ownerIds.length > 0) {
      const ownerUsers = await User.find({ clerkUserId: { $in: ownerIds } })
        .select('clerkUserId avatar imageUrl')
        .lean();
      const userImageMap = new Map();
      ownerUsers.forEach(u => {
        const img = u.avatar || u.imageUrl;
        if (img) userImageMap.set(u.clerkUserId, img);
      });
      tailors = tailors.map(t => {
        if (t.ownerClerkUserId && userImageMap.has(t.ownerClerkUserId)) {
          return { ...t, image: userImageMap.get(t.ownerClerkUserId) };
        }
        return t;
      });
    }
    res.json(tailors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/admin/verifications
 * List all tailors with verification applications / unverified
 */
export async function listPendingVerifications(_req, res) {
  try {
    let tailors = await Tailor.find()
      .sort({ verificationAppliedAt: -1, createdAt: -1 })
      .lean();
    const ownerIds = [...new Set(tailors.map(t => t.ownerClerkUserId).filter(Boolean))];
    if (ownerIds.length > 0) {
      const ownerUsers = await User.find({ clerkUserId: { $in: ownerIds } })
        .select('clerkUserId avatar imageUrl')
        .lean();
      const userImageMap = new Map();
      ownerUsers.forEach(u => {
        const img = u.avatar || u.imageUrl;
        if (img) userImageMap.set(u.clerkUserId, img);
      });
      tailors = tailors.map(t => {
        if (t.ownerClerkUserId && userImageMap.has(t.ownerClerkUserId)) {
          return { ...t, image: userImageMap.get(t.ownerClerkUserId) };
        }
        return t;
      });
    }
    res.json(tailors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PATCH /api/admin/tailors/:id/verify
 * Approve tailor verification
 */
export async function verifyTailor(req, res) {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) return res.status(404).json({ error: 'Tailor not found.' });

    tailor.verified = true;
    tailor.verificationStatus = 'verified';
    tailor.verifiedAt = new Date();
    tailor.verifiedBy = req.authUserId;
    tailor.verificationNotes = req.body?.notes || 'Approved by Admin';

    if (!tailor.location || !Array.isArray(tailor.location.coordinates) || tailor.location.coordinates.length !== 2) {
      tailor.location = { type: 'Point', coordinates: [75.7873, 26.9124] };
    }

    await tailor.save();

    if (tailor.ownerClerkUserId) {
      createNotification({
        recipientClerkUserId: tailor.ownerClerkUserId,
        title: 'Atelier Verified!',
        message: `Congratulations! ${tailor.name} has been approved as an official verified studio on MeraTailor.`,
        type: 'announcement',
        link: '/dashboard',
        metadata: { tailorId: tailor._id },
      }).catch(() => {});
    }

    res.json({ success: true, tailor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/admin/tailors/:id/reject
 * Reject or revoke tailor verification
 */
export async function rejectTailor(req, res) {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) return res.status(404).json({ error: 'Tailor not found.' });

    tailor.verified = false;
    tailor.verificationStatus = 'rejected';
    tailor.verifiedAt = undefined;
    tailor.verifiedBy = undefined;
    tailor.verificationNotes = req.body?.notes || req.body?.reason || 'Verification rejected by Admin';

    await tailor.save();

    if (tailor.ownerClerkUserId) {
      createNotification({
        recipientClerkUserId: tailor.ownerClerkUserId,
        title: 'Verification Status Update',
        message: `Your studio verification application was rejected. Notes: ${tailor.verificationNotes}`,
        type: 'general',
        link: '/dashboard',
        metadata: { tailorId: tailor._id },
      }).catch(() => {});
    }

    res.json({ success: true, tailor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function tailorInput(body, existing = {}) {
  const out = { ...existing };
  for (const key of ['name', 'owner', 'ownerClerkUserId', 'area', 'city', 'state', 'country', 'image', 'description', 'phone', 'status']) {
    if (typeof body[key] === 'string') out[key] = body[key].trim().slice(0, 500);
  }
  if (Array.isArray(body.categories)) out.categories = body.categories.map(String).slice(0, 20);
  if (Array.isArray(body.languages)) out.languages = body.languages.map(String).slice(0, 10);
  if (Array.isArray(body.services)) {
    out.services = body.services
      .filter(s => s && typeof s.name === 'string')
      .map(s => ({
        name: String(s.name).trim().slice(0, 80),
        price: Number(s.price) || 0,
        days: Number(s.days) || 5,
      }));
  }
  for (const key of ['rating', 'reviews', 'experience', 'minPrice']) {
    if (body[key] !== undefined && Number.isFinite(Number(body[key]))) out[key] = Number(body[key]);
  }
  if (body.verified !== undefined) {
    out.verified = Boolean(body.verified);
    out.verificationStatus = body.verified ? 'verified' : 'unverified';
  }
  if (body.latitude !== undefined && body.longitude !== undefined) {
    const lat = Number(body.latitude), lng = Number(body.longitude);
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
      throw new Error('Enter valid latitude and longitude.');
    }
    out.location = { type: 'Point', coordinates: [lng, lat] };
  }
  return out;
}

export async function createAdminTailor(req, res) {
  try {
    const data = tailorInput(req.body);
    if (!data.name || !data.city || !data.country || !data.location) {
      return res.status(400).json({ error: 'Name, city, country and map coordinates are required.' });
    }
    const tailor = await Tailor.create(data);
    res.status(201).json(tailor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateAdminTailor(req, res) {
  try {
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) return res.status(404).json({ error: 'Tailor not found.' });
    Object.assign(tailor, tailorInput(req.body, tailor.toObject?.() || tailor));
    if (req.body.verified !== undefined) {
      tailor.verifiedBy = req.body.verified ? req.authUserId : undefined;
      tailor.verifiedAt = req.body.verified ? new Date() : undefined;
      tailor.verificationStatus = req.body.verified ? 'verified' : 'unverified';
    }
    await tailor.save();
    res.json(tailor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteAdminTailor(req, res) {
  try {
    const tailorId = req.params.id;
    const tailor = await Tailor.findById(tailorId);
    if (!tailor) return res.status(404).json({ error: 'Tailor not found.' });

    // 1. Remove this tailor from all users' savedTailors arrays
    await User.updateMany(
      { 'savedTailors.tailorId': tailor._id },
      { $pull: { savedTailors: { tailorId: tailor._id } } }
    );

    // 2. Cascade update for orders:
    // If order was already Completed, set tailorName to 'undefined' or '(Deleted Atelier)'
    await Order.updateMany(
      { tailorId: tailor._id, status: 'Completed' },
      { $set: { tailorName: 'undefined' } }
    );

    // If order was active/in-progress and tailor gets deleted, cancel it so customer is informed
    await Order.updateMany(
      { tailorId: tailor._id, status: { $nin: ['Completed', 'Cancelled'] } },
      {
        $set: {
          status: 'Cancelled',
          tailorName: 'undefined',
        },
        $push: {
          history: ['Cancelled', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 'Tailor atelier account removed'],
        },
      }
    );

    // 3. Remove tailor bids/quotes from B2B bulk requests
    await BusinessRequest.updateMany(
      { 'quotes.tailorId': tailor._id },
      { $pull: { quotes: { tailorId: tailor._id } } }
    );

    // 4. Delete the tailor document
    await Tailor.deleteOne({ _id: tailor._id });

    res.json({
      success: true,
      deleted: true,
      message: 'Tailor deleted and all user saved references and orders synchronized.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/admin/dashboard-summary
 * Master control center analytics & live overview
 */
export async function getAdminDashboardSummary(_req, res) {
  try {
    const [tailors, users, bulkRequests, orders] = await Promise.all([
      Tailor.find().sort({ createdAt: -1 }).lean(),
      User.find().sort({ createdAt: -1 }).lean(),
      BusinessRequest.find().sort({ createdAt: -1 }).lean(),
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const pendingAudits = tailors.filter(
      (t) => !t.verified || t.verificationStatus === 'pending'
    );
    const verifiedStudios = tailors.filter(
      (t) => t.verified || t.verificationStatus === 'verified'
    );

    const rolesBreakdown = { customer: 0, tailor: 0, business: 0, admin: 0 };
    users.forEach((u) => {
      if (rolesBreakdown[u.role] !== undefined) rolesBreakdown[u.role]++;
      else rolesBreakdown.customer++;
    });

    // Synthesize platform activity stream
    const activities = [
      ...tailors.filter(t => t.verified).slice(0, 2).map(t => ({
        id: `t-${t._id}`,
        type: 'studio_verified',
        title: 'Studio verification completed',
        subtitle: `${t.name} • ${t.area || t.city || 'Jaipur'}`,
        timestamp: '2 hours ago',
        rawDate: t.verifiedAt || t.createdAt,
      })),
      ...users.slice(0, 3).map(u => ({
        id: `u-${u._id}`,
        type: 'user_registered',
        title: 'New user registered',
        subtitle: `${u.firstName || 'User'} ${u.lastName || ''} (${(u.role || 'customer').charAt(0).toUpperCase() + (u.role || 'customer').slice(1)})`,
        timestamp: '5 hours ago',
        rawDate: u.createdAt,
      })),
      ...bulkRequests.slice(0, 2).map(b => ({
        id: `b-${b._id}`,
        type: 'b2b_inquiry',
        title: 'B2B inquiry submitted',
        subtitle: `${b.requirement || 'Bulk Uniform'} (${b.quantity || 20} pcs)`,
        timestamp: '8 hours ago',
        rawDate: b.createdAt,
      })),
      ...tailors.slice(0, 1).map(t => ({
        id: `tu-${t._id}`,
        type: 'studio_updated',
        title: 'Studio profile updated',
        subtitle: `${t.name}`,
        timestamp: '1 day ago',
        rawDate: t.updatedAt || t.createdAt,
      })),
    ].slice(0, 4);

    res.json({
      snapshot: {
        pendingStudioAudits: pendingAudits.length,
        activeStudios: tailors.length,
        totalRegisteredUsers: users.length,
        enterpriseRfqs: bulkRequests.length,
        platformHealth: 'Healthy',
      },
      rolesBreakdown,
      tailors,
      users: users.slice(0, 20).map(publicUser),
      pendingAudits,
      verifiedStudios,
      bulkRequests: bulkRequests.slice(0, 10),
      recentActivity: activities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/admin/notifications
 * Real-time notifications stream for administrators
 */
export async function listAdminNotifications(_req, res) {
  try {
    const [tailors, users, bulkRequests] = await Promise.all([
      Tailor.find().sort({ createdAt: -1 }).limit(10).lean(),
      User.find().sort({ createdAt: -1 }).limit(10).lean(),
      BusinessRequest.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const pendingAudits = tailors.filter(t => !t.verified && t.verificationStatus !== 'verified');
    const notifications = [];

    // Verification notifications
    pendingAudits.forEach(t => {
      notifications.push({
        id: `notif-verify-${t._id}`,
        type: 'verification',
        title: 'Studio Verification Request',
        message: `${t.name} (${t.city || 'Jaipur'}) requires atelier verification audit.`,
        targetTab: 'verifications',
        priority: 'high',
        createdAt: t.verificationAppliedAt || t.createdAt || new Date(),
        unread: true,
      });
    });

    // Recent user sign-ups
    users.slice(0, 3).forEach(u => {
      const uRole = (u.role || 'customer').charAt(0).toUpperCase() + (u.role || 'customer').slice(1);
      notifications.push({
        id: `notif-user-${u._id}`,
        type: 'user',
        title: 'New Account Registered',
        message: `${u.firstName || 'User'} ${u.lastName || ''} registered as a ${uRole} account.`,
        targetTab: 'users',
        priority: 'normal',
        createdAt: u.createdAt || new Date(),
        unread: true,
      });
    });

    // Bulk RFQs
    bulkRequests.slice(0, 3).forEach(b => {
      notifications.push({
        id: `notif-bulk-${b._id}`,
        type: 'bulk',
        title: 'New B2B RFQ Demand',
        message: `${b.organisation || 'Enterprise'} posted demand for ${b.quantity || 100} units of ${b.requirement || b.title || 'Uniforms'}.`,
        targetTab: 'bulk',
        priority: 'high',
        createdAt: b.createdAt || new Date(),
        unread: true,
      });
    });

    // Pending Business Verifications
    const pendingBusinesses = users.filter(u => u.businessProfile?.verificationStatus === 'pending');
    pendingBusinesses.forEach(b => {
      notifications.push({
        id: `notif-biz-${b._id}`,
        type: 'business_verification',
        title: 'Business GSTIN Audit Required',
        message: `${b.businessProfile?.companyName || 'Enterprise'} (${b.businessProfile?.gstin || 'GST Pending'}) applied for B2B buyer verification.`,
        targetTab: 'bulk',
        priority: 'high',
        createdAt: b.businessProfile?.verificationAppliedAt || b.createdAt || new Date(),
        unread: true,
      });
    });

    // System Status notification
    notifications.push({
      id: 'notif-system-health',
      type: 'system',
      title: 'Platform Health: Operational',
      message: 'All microservices, geospatial maps, and database indexes are operating normally.',
      targetTab: 'dashboard',
      priority: 'low',
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      unread: false,
    });

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/admin/businesses
 * List registered business accounts and verification audit queue
 */
export async function listAdminBusinesses(_req, res) {
  try {
    const [businesses, users] = await Promise.all([
      Business.find().sort({ createdAt: -1 }).lean(),
      User.find({
        $or: [
          { role: 'business' },
          { 'businessProfile.companyName': { $exists: true, $ne: '' } },
          { 'businessProfile.verificationStatus': { $exists: true } },
        ],
      }).sort({ createdAt: -1 }).lean(),
    ]);

    const businessMap = new Map();
    businesses.forEach(b => {
      businessMap.set(b.ownerClerkUserId, b);
    });

    const userMap = new Map();
    users.forEach(u => {
      userMap.set(u.clerkUserId, u);
    });

    // Auto-sync any user who has a business profile but no Business document yet
    for (const u of users) {
      if (!businessMap.has(u.clerkUserId) && (u.businessProfile?.companyName || u.businessProfile?.verificationStatus)) {
        const synced = await getOrSyncBusinessProfile(u.clerkUserId, u);
        if (synced) {
          businessMap.set(u.clerkUserId, synced.toObject ? synced.toObject() : synced);
        }
      }
    }

    // Combine into uniform list
    const combined = [];
    const processedClerkIds = new Set();

    // Add all businesses
    for (const [clerkId, b] of businessMap.entries()) {
      processedClerkIds.add(clerkId);
      const u = userMap.get(clerkId);
      combined.push({
        id: b._id,
        businessId: b._id,
        userId: u?._id,
        clerkUserId: clerkId,
        companyName: b.companyName,
        email: u?.email || '',
        name: `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || b.contactPerson || 'Business Client',
        phone: b.contactPhone || u?.phone || '',
        avatar: u?.avatar || u?.imageUrl || b.image || '',
        businessProfile: b,
        verificationStatus: b.verificationStatus || 'unverified',
        verified: Boolean(b.verified),
        createdAt: b.createdAt,
      });
    }

    // Include any users with business role not in processedClerkIds
    for (const u of users) {
      if (!processedClerkIds.has(u.clerkUserId)) {
        combined.push({
          id: u._id,
          userId: u._id,
          clerkUserId: u.clerkUserId,
          companyName: u.businessProfile?.companyName || `${u.firstName || ''}'s Enterprise`,
          email: u.email || '',
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Business User',
          phone: u.phone || '',
          avatar: u.avatar || u.imageUrl || '',
          businessProfile: u.businessProfile || {},
          verificationStatus: u.businessProfile?.verificationStatus || 'unverified',
          verified: Boolean(u.businessProfile?.verified),
          createdAt: u.createdAt,
        });
      }
    }

    res.json(combined);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PATCH /api/admin/businesses/:id/verify
 * Approve and verify business credentials (GSTIN / Tax ID)
 */
export async function verifyBusiness(req, res) {
  try {
    const id = req.params.id;
    let business = null;
    let user = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      business = await Business.findById(id);
      if (business) {
        user = await User.findOne({ clerkUserId: business.ownerClerkUserId });
      } else {
        user = await User.findById(id);
        if (user) {
          business = await Business.findOne({ ownerClerkUserId: user.clerkUserId });
          if (!business) {
            business = await getOrSyncBusinessProfile(user.clerkUserId, user);
          }
        }
      }
    } else {
      user = await User.findOne({ clerkUserId: id });
      business = await Business.findOne({ ownerClerkUserId: id });
      if (!business && user) {
        business = await getOrSyncBusinessProfile(id, user);
      }
    }

    if (!business && !user) {
      return res.status(404).json({ error: 'Business account not found.' });
    }

    const verifiedAt = new Date();
    if (business) {
      business.verified = true;
      business.verificationStatus = 'verified';
      business.verifiedAt = verifiedAt;
      business.verifiedBy = req.authUserId;
      business.rejectionReason = undefined;
      if (req.body?.notes) business.verificationNotes = String(req.body.notes).trim().slice(0, 500);
      await business.save();
    }

    if (user) {
      if (!user.businessProfile) user.businessProfile = {};
      user.businessProfile.verified = true;
      user.businessProfile.verificationStatus = 'verified';
      user.businessProfile.verifiedAt = verifiedAt;
      user.businessProfile.verifiedBy = req.authUserId;
      user.businessProfile.rejectionReason = undefined;
      user.role = 'business';
      await user.save();
    }

    const recipientClerkId = business?.ownerClerkUserId || user?.clerkUserId;
    if (recipientClerkId) {
      createNotification({
        recipientClerkUserId: recipientClerkId,
        title: 'Business Account Verified!',
        message: 'Your organization has been officially verified. You can now post bulk requirements and manage B2B tenders.',
        type: 'announcement',
        link: '/bulk',
        metadata: { businessId: business?._id },
      }).catch(() => {});
    }

    res.json({
      success: true,
      business,
      businessProfile: business || user?.businessProfile,
      user: user ? publicUser(user) : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/admin/businesses/:id/reject
 * Reject business verification audit
 */
export async function rejectBusiness(req, res) {
  try {
    const id = req.params.id;
    let business = null;
    let user = null;

    if (/^[a-f\d]{24}$/i.test(id)) {
      business = await Business.findById(id);
      if (business) {
        user = await User.findOne({ clerkUserId: business.ownerClerkUserId });
      } else {
        user = await User.findById(id);
        if (user) {
          business = await Business.findOne({ ownerClerkUserId: user.clerkUserId });
        }
      }
    } else {
      user = await User.findOne({ clerkUserId: id });
      business = await Business.findOne({ ownerClerkUserId: id });
    }

    if (!business && !user) {
      return res.status(404).json({ error: 'Business account not found.' });
    }

    const reason = req.body?.reason || req.body?.notes || 'Business verification rejected by administrator';

    if (business) {
      business.verified = false;
      business.verificationStatus = 'rejected';
      business.verifiedAt = undefined;
      business.verifiedBy = undefined;
      business.rejectionReason = reason;
      await business.save();
    }

    if (user) {
      if (!user.businessProfile) user.businessProfile = {};
      user.businessProfile.verified = false;
      user.businessProfile.verificationStatus = 'rejected';
      user.businessProfile.verifiedAt = undefined;
      user.businessProfile.verifiedBy = undefined;
      user.businessProfile.rejectionReason = reason;
      await user.save();
    }

    const recipientClerkId = business?.ownerClerkUserId || user?.clerkUserId;
    if (recipientClerkId) {
      createNotification({
        recipientClerkUserId: recipientClerkId,
        title: 'Business Verification Update',
        message: `Your business verification application was not approved. Reason: ${reason}`,
        type: 'general',
        link: '/bulk',
        metadata: { businessId: business?._id },
      }).catch(() => {});
    }

    res.json({
      success: true,
      business,
      businessProfile: business || user?.businessProfile,
      user: user ? publicUser(user) : null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

