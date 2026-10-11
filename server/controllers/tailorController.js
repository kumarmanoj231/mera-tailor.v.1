import { BusinessRequest, Order, Tailor, User } from '../models.js';

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const publicTailor = ({ ownerClerkUserId, verifiedBy, __v, ...tailor }) => tailor;

function haversineKm(lat1, lon1, lat2, lon2) {
  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) return null;
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * GET /api/tailors
 * Customer-facing discovery feed: returns admin-verified tailors.
 * Supports filtering by distance radius OR showing all verified tailors across all locations!
 */
export async function listTailors(req, res) {
  try {
    const lat = Number(req.query.lat),
      lng = Number(req.query.lng);
    const hasPoint =
      req.query.lat !== undefined &&
      req.query.lng !== undefined &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180;
    const radiusKm = Math.min(500, Math.max(1, Number(req.query.radiusKm || req.query.radius) || 10));
    const allLocations =
      req.query.allLocations === 'true' ||
      req.query.showAll === 'true' ||
      req.query.irrespectiveLocation === 'true' ||
      req.query.all === 'true';
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim();
    const city = String(req.query.city || '').trim();

    // Matches verified: true OR verificationStatus: 'verified' OR demo seed records
    const filter = {
      $or: [{ verified: true }, { verificationStatus: 'verified' }, { isDemo: true }],
    };

    if (city && !allLocations) {
      filter.city = { $regex: `^${escapeRegex(city)}$`, $options: 'i' };
    }

    let rows = await Tailor.find(filter).lean();

    // Format coordinates and compute distance if center point is supplied
    rows = rows.map(t => {
      let coords = t.location?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2 || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
        // Fallback default coordinates so marker renders properly
        coords = [75.7873, 26.9124];
      }
      let distance = null;
      if (hasPoint) {
        distance = haversineKm(lat, lng, coords[1], coords[0]);
      }
      return {
        ...t,
        location: { type: 'Point', coordinates: coords },
        distance: distance !== null ? distance : (t.distance || null),
      };
    });

    // If location radius filtering is active and NOT allLocations, filter by radiusKm
    if (hasPoint && !allLocations) {
      rows = rows.filter(t => t.distance === null || t.distance <= radiusKm);
    }

    if (category) {
      rows = rows.filter(t => t.categories?.some(c => c.toLowerCase().includes(category.toLowerCase())));
    }
    if (city && !allLocations) {
      rows = rows.filter(t => t.city?.toLowerCase() === city.toLowerCase());
    }
    if (search) {
      rows = rows.filter(t =>
        `${t.name} ${t.owner || ''} ${t.area || ''} ${t.city || ''} ${(t.categories || []).join(' ')}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Sort by distance (if point is given) or rating
    rows.sort((a, b) => {
      if (hasPoint && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    res.json(rows.map(publicTailor));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/tailors/:id
 */
export async function getTailor(req, res) {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(404).json({ error: 'Tailor not found' });
    }
    const tailor = await Tailor.findById(req.params.id).lean();
    tailor ? res.json(publicTailor(tailor)) : res.status(404).json({ error: 'Tailor not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/tailors/my-studio
 * Authenticated tailor fetches their studio
 */
export async function getMyStudio(req, res) {
  try {
    const tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
    if (!tailor) {
      // Return draft template without inserting a document into the database
      const user = req.appUser;
      const defaultName = user.firstName ? `${user.firstName}'s Atelier` : 'My Tailoring Studio';
      return res.json({
        ownerClerkUserId: req.authUserId,
        name: defaultName,
        owner: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Master Artisan',
        city: user.locationLabel?.split(',')?.[0]?.trim() || 'Jaipur',
        country: 'India',
        phone: user.phone || '',
        description: '',
        minPrice: 499,
        experience: 5,
        status: 'Available',
        categories: ['Ethnic Wear', 'Alterations'],
        services: [
          { name: 'Custom Stitching', price: 499, days: 5 },
          { name: 'Suit / Blazer Fitting', price: 1499, days: 7 },
          { name: 'Alteration & Hemming', price: 149, days: 2 },
        ],
        location: user.primaryLocation || { type: 'Point', coordinates: [75.7873, 26.9124] },
        verified: false,
        verificationStatus: 'unverified',
        isDraft: true,
      });
    }
    res.json(tailor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /api/tailors/my-studio
 * Authenticated tailor updates studio details
 */
export async function updateMyStudio(req, res) {
  try {
    let tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
    if (!tailor) {
      tailor = new Tailor({ ownerClerkUserId: req.authUserId });
    }

    const b = req.body || {};
    if (typeof b.name === 'string' && b.name.trim()) tailor.name = b.name.trim().slice(0, 100);
    if (typeof b.owner === 'string') tailor.owner = b.owner.trim().slice(0, 100);
    if (typeof b.area === 'string') tailor.area = b.area.trim().slice(0, 100);
    if (typeof b.city === 'string') tailor.city = b.city.trim().slice(0, 80);
    if (typeof b.state === 'string') tailor.state = b.state.trim().slice(0, 80);
    if (typeof b.phone === 'string') tailor.phone = b.phone.trim().slice(0, 30);
    if (typeof b.description === 'string') tailor.description = b.description.trim().slice(0, 1000);
    if (typeof b.status === 'string') tailor.status = b.status.trim().slice(0, 50);

    if (b.capacitySlots !== undefined && Number.isFinite(Number(b.capacitySlots))) {
      tailor.capacitySlots = Math.max(1, Math.min(50, Number(b.capacitySlots)));
    }

    if (b.minPrice !== undefined && Number.isFinite(Number(b.minPrice))) {
      tailor.minPrice = Math.max(0, Number(b.minPrice));
    }
    if (b.experience !== undefined && Number.isFinite(Number(b.experience))) {
      tailor.experience = Math.max(0, Number(b.experience));
    }

    if (Array.isArray(b.categories)) {
      tailor.categories = b.categories.map(String).map(s => s.trim()).filter(Boolean).slice(0, 15);
    }
    if (Array.isArray(b.languages)) {
      tailor.languages = b.languages.map(String).map(s => s.trim()).filter(Boolean).slice(0, 10);
    }
    if (Array.isArray(b.services)) {
      tailor.services = b.services
        .filter(s => s && typeof s.name === 'string' && s.name.trim())
        .map(s => ({
          name: String(s.name).trim().slice(0, 80),
          price: Number.isFinite(Number(s.price)) ? Math.max(0, Number(s.price)) : 499,
          days: Number.isFinite(Number(s.days)) ? Math.max(1, Number(s.days)) : 5,
        }))
        .slice(0, 30);
    }

    if (b.latitude !== undefined && b.longitude !== undefined) {
      const lat = Number(b.latitude), lng = Number(b.longitude);
      if (Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180) {
        tailor.location = { type: 'Point', coordinates: [lng, lat] };
      }
    } else if (!tailor.location || !Array.isArray(tailor.location.coordinates) || tailor.location.coordinates.length !== 2) {
      const userLoc = req.appUser?.primaryLocation;
      if (userLoc && Array.isArray(userLoc.coordinates) && userLoc.coordinates.length === 2) {
        tailor.location = userLoc;
      } else {
        tailor.location = { type: 'Point', coordinates: [75.7873, 26.9124] };
      }
    }

    await tailor.save();
    res.json(tailor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/tailors/b2b-bid/:requestId
 * Tailor submits a commercial bid on a B2B bulk request
 */
export async function submitB2BBid(req, res) {
  try {
    const { requestId } = req.params;
    const { amount, days, notes } = req.body || {};
    const tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
    if (!tailor) return res.status(404).json({ error: 'Tailor studio profile not found.' });

    const businessReq = await BusinessRequest.findById(requestId);
    if (!businessReq) return res.status(404).json({ error: 'B2B requirement not found.' });

    const newBid = {
      tailorId: tailor._id,
      tailorName: tailor.name || tailor.owner || 'Artisan Atelier',
      amount: Number(amount) || businessReq.estBudget || 10000,
      days: Number(days) || 15,
      notes: String(notes || '').trim().slice(0, 500),
      createdAt: new Date(),
    };

    businessReq.bids = businessReq.bids || [];
    businessReq.bids.push(newBid);
    if (businessReq.status === 'submitted') businessReq.status = 'reviewing';
    await businessReq.save();

    res.json({
      success: true,
      message: 'B2B proposal submitted successfully!',
      bid: newBid,
      businessReq,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/tailors/apply-verification
 * Tailor applies for admin verification
 */
export async function applyTailorVerification(req, res) {
  try {
    let tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId });
    if (!tailor) {
      return res.status(404).json({ error: 'Please set up your studio profile first before applying for verification.' });
    }

    if (tailor.verified) {
      return res.status(400).json({ error: 'Your tailor studio is already verified!' });
    }

    tailor.verificationStatus = 'pending';
    tailor.verificationAppliedAt = new Date();
    if (typeof req.body.notes === 'string') {
      tailor.verificationNotes = req.body.notes.trim().slice(0, 500);
    }

    await tailor.save();
    res.json({
      success: true,
      message: 'Verification application submitted to administrator successfully.',
      tailor,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/saved-tailors
 */
export async function listSavedTailors(req, res) {
  try {
    const user = req.appUser;
    const ids = (user.savedTailors || []).map(item => item.tailorId?.toString?.() || item.tailorId);
    const rows = await Tailor.find({ _id: { $in: ids } }).lean();
    res.json(rows.map(publicTailor));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /api/saved-tailors/:id
 */
export async function toggleSavedTailor(req, res) {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(404).json({ error: 'Tailor not found' });
    }
    const tailor = await Tailor.findById(req.params.id);
    if (!tailor) return res.status(404).json({ error: 'Tailor not found' });

    const saved = req.appUser.savedTailors || [];
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
 * GET /api/platform/stats
 * Public endpoint returning live counts of tailors, orders, and users
 */
export async function getPlatformStats(_req, res) {
  try {
    const [tailorCount, verifiedCount, orderCount, userCount] = await Promise.all([
      Tailor.countDocuments(),
      Tailor.countDocuments({ $or: [{ verified: true }, { verificationStatus: 'verified' }, { isDemo: true }] }),
      Order.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({
      totalTailors: tailorCount,
      verifiedTailors: verifiedCount,
      totalOrders: orderCount,
      totalUsers: userCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
