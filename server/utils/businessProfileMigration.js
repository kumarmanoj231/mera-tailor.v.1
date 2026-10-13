import { Business, User } from '../models.js';

/**
 * Ensures a Business document exists for a user and synchronizes both representations.
 * Self-healing and non-destructive.
 */
export async function getOrSyncBusinessProfile(clerkUserId, existingUser = null) {
  if (!clerkUserId) return null;

  // 1. Fetch Business by ownerClerkUserId
  let business = await Business.findOne({ ownerClerkUserId: clerkUserId });
  const user = existingUser || (await User.findOne({ clerkUserId }));

  if (!user) return business;

  const bp = user.businessProfile || {};

  // 2. If Business document doesn't exist yet, but user has business role or profile data, create it
  if (!business && user.role === 'business') {
    const companyName =
      bp.companyName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      'Commercial Enterprise';

    business = await Business.create({
      ownerClerkUserId: clerkUserId,
      companyName,
      gstin: bp.gstin || '',
      businessType: bp.businessType || 'Corporate Enterprise',
      panNumber: bp.panNumber || '',
      website: bp.website || '',
      address: bp.address || '',
      city: bp.city || user.locationLabel?.split(',')?.[0]?.trim() || 'Jaipur',
      state: bp.state || 'Rajasthan',
      pincode: bp.pincode || '',
      contactPerson: bp.contactPerson || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
      contactPhone: bp.contactPhone || user.phone || '',
      documentUrl: bp.documentUrl || '',
      description: bp.description || '',
      image: user.avatar || user.imageUrl || '',
      location: user.primaryLocation || { type: 'Point', coordinates: [75.7873, 26.9124] },
      verified: Boolean(bp.verified),
      verificationStatus: bp.verificationStatus || 'unverified',
      verificationAppliedAt: bp.verificationAppliedAt,
      verificationNotes: bp.verificationNotes,
      verifiedBy: bp.verifiedBy,
      verifiedAt: bp.verifiedAt,
      rejectionReason: bp.rejectionReason,
    });
  }

  // 3. Mirror business data back into user.businessProfile for dual-compatibility
  if (business) {
    const userUpdate = {};
    let needsUpdate = false;

    if (!user.businessProfile || user.businessProfile.companyName !== business.companyName) {
      userUpdate.businessProfile = {
        companyName: business.companyName,
        gstin: business.gstin || '',
        businessType: business.businessType || 'Corporate Enterprise',
        panNumber: business.panNumber || '',
        website: business.website || '',
        address: business.address || '',
        city: business.city || 'Jaipur',
        state: business.state || 'Rajasthan',
        pincode: business.pincode || '',
        contactPerson: business.contactPerson || '',
        contactPhone: business.contactPhone || '',
        verificationStatus: business.verificationStatus || 'unverified',
        verified: Boolean(business.verified),
        verificationAppliedAt: business.verificationAppliedAt,
        verificationNotes: business.verificationNotes,
        verifiedBy: business.verifiedBy,
        verifiedAt: business.verifiedAt,
        rejectionReason: business.rejectionReason,
        documentUrl: business.documentUrl,
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      await User.updateOne({ clerkUserId }, { $set: userUpdate });
    }
  }

  return business;
}

/**
 * Safe, reversible migration utility to populate the businesses collection
 * from existing users who have business profiles.
 */
export async function migrateAllBusinessProfiles() {
  const stats = { examined: 0, created: 0, existing: 0, errors: [] };

  try {
    const users = await User.find({
      $or: [
        { role: 'business' },
        { 'businessProfile.companyName': { $exists: true, $ne: '' } },
        { 'businessProfile.verificationStatus': { $exists: true } },
      ],
    }).lean();

    stats.examined = users.length;

    for (const u of users) {
      try {
        const existing = await Business.findOne({ ownerClerkUserId: u.clerkUserId });
        if (existing) {
          stats.existing++;
        } else {
          await getOrSyncBusinessProfile(u.clerkUserId, u);
          stats.created++;
        }
      } catch (err) {
        stats.errors.push({ clerkUserId: u.clerkUserId, error: err.message });
      }
    }
  } catch (err) {
    stats.errors.push({ error: err.message });
  }

  return stats;
}
