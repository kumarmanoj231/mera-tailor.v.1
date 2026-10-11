import { BusinessRequest, Tailor, User } from '../models.js';
import { createNotification } from './notificationController.js';

const escapeRegex = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * POST /api/business-requests
 * Create a new bulk apparel tender / RFQ (Business or Admin)
 */
export async function createBusinessRequest(req, res) {
  try {
    const userRole = req.appUser?.role || 'customer';
    if (!['business', 'admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Only Business accounts can post bulk requirements. Tailors can bid on tenders.' });
    }

    // STRICT CHECK: Only verified business accounts can publish requirements
    const bp = req.appUser?.businessProfile;
    if (userRole === 'business') {
      const isVerified = bp?.verified === true || bp?.verificationStatus === 'verified';
      if (!isVerified) {
        return res.status(403).json({
          error: 'Verification required: Only verified business accounts with an approved GSTIN can post bulk requirements.',
          verificationStatus: bp?.verificationStatus || 'unverified',
        });
      }
    }

    const title = String(req.body.title || '').trim().slice(0, 150) || `${req.body.quantity || 50}x ${req.body.category || 'Apparel'} Requirement`;
    const organisation = String(req.body.organisation || bp?.companyName || '').trim().slice(0, 120);
    const category = String(req.body.category || 'Corporate Uniforms').trim().slice(0, 80);
    const requirement = String(req.body.requirement || '').trim().slice(0, 2500);
    const quantity = Number(req.body.quantity);
    const unitBudget = req.body.unitBudget ? Number(req.body.unitBudget) : undefined;
    const estBudget = req.body.estBudget ? Number(req.body.estBudget) : (unitBudget ? unitBudget * quantity : undefined);
    const timeline = String(req.body.timeline || '').trim().slice(0, 100);
    const city = String(req.body.city || bp?.city || 'Jaipur').trim().slice(0, 80);
    const sampleRequired = req.body.sampleRequired !== undefined ? Boolean(req.body.sampleRequired) : true;
    const notes = String(req.body.notes || '').trim().slice(0, 1500);

    if (!organisation) {
      return res.status(400).json({ error: 'Company or organisation name is required.' });
    }
    if (!requirement) {
      return res.status(400).json({ error: 'Detailed garment specifications / requirements are required.' });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500000) {
      return res.status(400).json({ error: 'Quantity must be a valid number between 1 and 500,000 units.' });
    }

    const creatorName = `${req.appUser?.firstName || ''} ${req.appUser?.lastName || ''}`.trim() || req.appUser?.email || 'Business Client';
    const isVerifiedBusiness = userRole === 'admin' || Boolean(bp?.verified || bp?.verificationStatus === 'verified');

    const saved = await BusinessRequest.create({
      clerkUserId: req.authUserId,
      creatorEmail: req.appUser?.email,
      creatorName,
      title,
      organisation,
      category,
      requirement,
      quantity,
      unitBudget,
      estBudget,
      timeline,
      city,
      sampleRequired,
      notes,
      isVerifiedBusiness,
      gstin: bp?.gstin || '',
      quotes: [],
      status: 'open',
    });

    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Bulk Requirement Published',
      message: `Your requirement for '${saved.organisation || saved.requirement}' (${saved.quantity} units) has been published to artisans.`,
      type: 'bid',
      link: '/bulk',
      metadata: { requestId: saved._id },
    }).catch(() => {});

    res.status(201).json({
      message: 'Bulk requirement published to artisan marketplace.',
      request: saved,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/business-requests
 * List requirements based on user role:
 * - Admin: All requests
 * - Business: Market requests + their own with full quotes
 * - Tailor: All verified open tenders with their own submitted quotes highlighted
 */
export async function listBusinessRequests(req, res) {
  try {
    const userRole = req.appUser?.role || 'customer';
    const isTailor = userRole === 'tailor';
    const isAdmin = userRole === 'admin';
    const isBusiness = userRole === 'business';

    // Tailor lookup if current user is tailor
    let tailorProfile = null;
    if (isTailor) {
      tailorProfile = await Tailor.findOne({ ownerClerkUserId: req.authUserId }).lean();
    }

    let query = {};
    if (req.query.mine === 'true' || (isBusiness && req.query.scope === 'mine')) {
      query.clerkUserId = req.authUserId;
    } else if (isTailor) {
      // Tailors ONLY see tenders posted by verified businesses or admin
      query.isVerifiedBusiness = true;
      query.status = { $in: ['open', 'submitted', 'reviewing', 'quoted', 'awarded'] };
    } else if (isBusiness) {
      // In marketplace feed, show only verified tenders
      query.isVerifiedBusiness = true;
      query.status = { $in: ['open', 'submitted', 'reviewing', 'quoted', 'awarded'] };
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    if (req.query.city && req.query.city !== 'all') {
      query.city = new RegExp(escapeRegex(req.query.city), 'i');
    }

    const rows = await BusinessRequest.find(query).sort({ createdAt: -1 }).lean();

    // Gather tailorClerkUserIds across all visible quotes to enrich authentic images
    const allTailorUserIds = [...new Set(rows.flatMap(r => (r.quotes || []).map(q => q.tailorClerkUserId)).filter(Boolean))];
    const tailorImgMap = new Map();
    if (allTailorUserIds.length > 0) {
      const users = await User.find({ clerkUserId: { $in: allTailorUserIds } }).select('clerkUserId avatar imageUrl').lean();
      users.forEach(u => {
        const img = u.avatar || u.imageUrl;
        if (img) tailorImgMap.set(u.clerkUserId, img);
      });
    }

    const formatted = rows.map((r) => {
      const isOwner = r.clerkUserId === req.authUserId;
      const quotesCount = r.quotes?.length || 0;

      // Enrich quotes with authentic Clerk avatar if missing
      const enrichedQuotes = (r.quotes || []).map(q => ({
        ...q,
        tailorImage: q.tailorImage || (q.tailorClerkUserId ? tailorImgMap.get(q.tailorClerkUserId) : null) || null,
      }));

      // Find my quote if tailor
      let myQuote = null;
      if (isTailor) {
        myQuote = enrichedQuotes.find(
          (q) =>
            q.tailorClerkUserId === req.authUserId ||
            (tailorProfile && q.tailorId && String(q.tailorId) === String(tailorProfile._id))
        ) || null;
      }

      // If user is neither owner nor admin, mask competitor quotes list but provide stats
      let visibleQuotes = enrichedQuotes;
      if (!isOwner && !isAdmin) {
        visibleQuotes = myQuote ? [myQuote] : [];
      }

      return {
        ...r,
        isOwner,
        quotesCount,
        quotes: visibleQuotes,
        myQuote,
        lowestQuote: enrichedQuotes.length ? Math.min(...enrichedQuotes.map((q) => q.pricePerUnit || q.totalAmount / r.quantity)) : null,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/business-requests/:id
 * Retrieve single requirement details
 */
export async function getBusinessRequest(req, res) {
  try {
    const item = await BusinessRequest.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    const isOwner = item.clerkUserId === req.authUserId;
    const isAdmin = req.appUser?.role === 'admin';
    const isTailor = req.appUser?.role === 'tailor';

    let myQuote = null;
    if (isTailor) {
      myQuote = item.quotes?.find((q) => q.tailorClerkUserId === req.authUserId) || null;
    }

    // Mask competitor quotes unless owner or admin
    if (!isOwner && !isAdmin) {
      item.quotes = myQuote ? [myQuote] : [];
    }

    res.json({
      ...item,
      isOwner,
      myQuote,
      quotesCount: item.quotes?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT / PATCH /api/business-requests/:id
 * Update requirement (Owner or Admin)
 */
export async function updateBusinessRequest(req, res) {
  try {
    const item = await BusinessRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    const isOwner = item.clerkUserId === req.authUserId;
    const isAdmin = req.appUser?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to update this requirement.' });
    }

    const values = {};
    if (typeof req.body.title === 'string') values.title = req.body.title.trim().slice(0, 150);
    if (typeof req.body.organisation === 'string') values.organisation = req.body.organisation.trim().slice(0, 120);
    if (typeof req.body.category === 'string') values.category = req.body.category.trim().slice(0, 80);
    if (typeof req.body.requirement === 'string') values.requirement = req.body.requirement.trim().slice(0, 2500);
    if (typeof req.body.timeline === 'string') values.timeline = req.body.timeline.trim().slice(0, 100);
    if (typeof req.body.city === 'string') values.city = req.body.city.trim().slice(0, 80);
    if (typeof req.body.notes === 'string') values.notes = req.body.notes.trim().slice(0, 1500);
    if (req.body.sampleRequired !== undefined) values.sampleRequired = Boolean(req.body.sampleRequired);
    if (req.body.unitBudget !== undefined) values.unitBudget = Number(req.body.unitBudget) || 0;
    if (req.body.estBudget !== undefined) values.estBudget = Number(req.body.estBudget) || 0;

    if (req.body.quantity !== undefined) {
      const q = Number(req.body.quantity);
      if (!Number.isInteger(q) || q < 1) return res.status(400).json({ error: 'Enter a valid quantity.' });
      values.quantity = q;
    }

    if (req.body.status && ['open', 'submitted', 'reviewing', 'quoted', 'awarded', 'in-production', 'completed', 'cancelled'].includes(req.body.status)) {
      values.status = req.body.status;
    }

    Object.assign(item, values);
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /api/business-requests/:id
 * Delete requirement (Owner or Admin)
 */
export async function deleteBusinessRequest(req, res) {
  try {
    const item = await BusinessRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    const isOwner = item.clerkUserId === req.authUserId;
    const isAdmin = req.appUser?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to delete this requirement.' });
    }

    await BusinessRequest.deleteOne({ _id: item._id });
    res.json({ deleted: true, id: req.params.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * POST /api/business-requests/:id/quotes
 * Submit or update a quotation from a Tailor Atelier (Tailor or Admin)
 */
export async function submitQuote(req, res) {
  try {
    const userRole = req.appUser?.role || 'customer';
    if (!['tailor', 'admin'].includes(userRole)) {
      return res.status(403).json({ error: 'Only registered Tailor ateliers and Admins can quote on tenders.' });
    }

    const item = await BusinessRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    if (['completed', 'cancelled'].includes(item.status)) {
      return res.status(400).json({ error: 'This tender is closed and no longer accepting bids.' });
    }

    const pricePerUnit = Number(req.body.pricePerUnit);
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      return res.status(400).json({ error: 'Enter a valid positive unit price per garment.' });
    }

    const totalAmount = req.body.totalAmount ? Number(req.body.totalAmount) : pricePerUnit * (item.quantity || 1);
    const leadTimeDays = Number(req.body.leadTimeDays) || 15;
    const sampleOffered = req.body.sampleOffered !== undefined ? Boolean(req.body.sampleOffered) : true;
    const notes = String(req.body.notes || '').trim().slice(0, 1000);

    // Fetch tailor studio details
    const tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId }).lean();
    const tailorName = tailor?.name || `${req.appUser?.firstName || ''} ${req.appUser?.lastName || ''}`.trim() || 'Artisan Workshop';
    const tailorImage = tailor?.image || req.appUser?.avatar || req.appUser?.imageUrl || '';
    const tailorCity = tailor?.city || req.appUser?.primaryLocation?.city || 'Jaipur';
    const tailorPhone = tailor?.phone || req.appUser?.phone || '';
    const tailorVerified = Boolean(tailor?.verified);

    // Check if quote from this tailor already exists
    const existingIndex = item.quotes.findIndex(
      (q) => q.tailorClerkUserId === req.authUserId || (tailor && q.tailorId && String(q.tailorId) === String(tailor._id))
    );

    const quotePayload = {
      tailorId: tailor?._id,
      tailorClerkUserId: req.authUserId,
      tailorName,
      tailorImage,
      tailorCity,
      tailorPhone,
      tailorVerified,
      pricePerUnit,
      totalAmount,
      leadTimeDays,
      sampleOffered,
      notes,
      status: 'pending',
      createdAt: new Date(),
    };

    if (existingIndex >= 0) {
      item.quotes[existingIndex] = { ...item.quotes[existingIndex].toObject(), ...quotePayload };
    } else {
      item.quotes.push(quotePayload);
    }

    if (item.status === 'open') {
      item.status = 'reviewing';
    }

    await item.save();

    // Notify business client that a tailor submitted a quote
    if (item.clerkUserId) {
      createNotification({
        recipientClerkUserId: item.clerkUserId,
        title: 'New Quotation Received',
        message: `${tailor.name || 'An atelier'} submitted a quote of ₹${quotePayload.totalPrice} for '${item.organisation || item.requirement}'.`,
        type: 'bid',
        link: '/bulk',
        metadata: { requestId: item._id, quoteId: quotePayload._id, totalPrice: quotePayload.totalPrice },
      }).catch(() => {});
    }

    res.status(200).json({
      message: existingIndex >= 0 ? 'Quotation updated successfully.' : 'Quotation submitted successfully to client.',
      quote: quotePayload,
      quotesCount: item.quotes.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/business-requests/:id/quotes/:quoteId/status
 * Update quote status (e.g., Accept / Award, Shortlist, Reject)
 * (Business Owner or Admin)
 */
export async function updateQuoteStatus(req, res) {
  try {
    const item = await BusinessRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    const isOwner = item.clerkUserId === req.authUserId;
    const isAdmin = req.appUser?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to moderate quotes on this tender.' });
    }

    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending, accepted, rejected, or shortlisted.' });
    }

    const quote = item.quotes.id(req.params.quoteId);
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });

    quote.status = status;

    if (status === 'accepted') {
      item.awardedQuoteId = quote._id;
      item.awardedTailorId = quote.tailorId;
      item.status = 'awarded';

      // Mark other quotes as rejected if desired or keep pending
      item.quotes.forEach((q) => {
        if (String(q._id) !== String(quote._id) && q.status === 'pending') {
          q.status = 'rejected';
        }
      });
    }

    await item.save();

    // Notify tailor of quote status change (awarded, shortlisted, rejected)
    Tailor.findById(quote.tailorId).select('ownerClerkUserId').lean().then(t => {
      if (t?.ownerClerkUserId) {
        createNotification({
          recipientClerkUserId: t.ownerClerkUserId,
          title: `Tender Quote ${status === 'accepted' ? 'Awarded! 🎉' : status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your quote for '${item.organisation || item.requirement}' has been ${status} by the client.`,
          type: 'bid',
          link: '/bulk',
          metadata: { requestId: item._id, quoteId: quote._id, status },
        }).catch(() => {});
      }
    }).catch(() => {});

    res.json({
      message: `Quotation status updated to ${status}.`,
      quote,
      requestStatus: item.status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /api/business-requests/:id/quotes/:quoteId
 * Withdraw quotation (Tailor or Admin)
 */
export async function withdrawQuote(req, res) {
  try {
    const item = await BusinessRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Bulk requirement not found.' });

    const quote = item.quotes.id(req.params.quoteId);
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });

    const isAuthor = quote.tailorClerkUserId === req.authUserId;
    const isAdmin = req.appUser?.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'You can only withdraw your own quotes.' });
    }

    quote.status = 'withdrawn';
    await item.save();

    res.json({ message: 'Quotation withdrawn.', quoteId: req.params.quoteId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/business/profile
 * Get current business profile & verification status
 */
export async function getBusinessProfile(req, res) {
  try {
    const user = await User.findOne({ clerkUserId: req.authUserId }).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      businessProfile: user.businessProfile || {
        verificationStatus: 'unverified',
        verified: false,
      },
      userRole: user.role,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /api/business/profile
 * Update business details and apply for GSTIN verification
 */
export async function updateBusinessProfile(req, res) {
  try {
    const user = await User.findOne({ clerkUserId: req.authUserId });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const bp = user.businessProfile || {};
    const companyName = String(req.body.companyName || bp.companyName || '').trim().slice(0, 150);
    const gstin = String(req.body.gstin || bp.gstin || '').trim().toUpperCase().slice(0, 20);
    const businessType = String(req.body.businessType || bp.businessType || 'Corporate Enterprise').trim().slice(0, 80);
    const panNumber = String(req.body.panNumber || bp.panNumber || '').trim().toUpperCase().slice(0, 15);
    const website = String(req.body.website || bp.website || '').trim().slice(0, 200);
    const address = String(req.body.address || bp.address || '').trim().slice(0, 300);
    const city = String(req.body.city || bp.city || 'Jaipur').trim().slice(0, 80);
    const state = String(req.body.state || bp.state || 'Rajasthan').trim().slice(0, 80);
    const pincode = String(req.body.pincode || bp.pincode || '').trim().slice(0, 10);
    const contactPerson = String(req.body.contactPerson || bp.contactPerson || '').trim().slice(0, 100);
    const contactPhone = String(req.body.contactPhone || bp.contactPhone || '').trim().slice(0, 25);
    const documentUrl = String(req.body.documentUrl || bp.documentUrl || '').trim();

    if (!companyName) {
      return res.status(400).json({ error: 'Registered company or institution name is required.' });
    }

    // Basic Indian GSTIN format validation (15 alphanumeric characters: 2 state digits + 10 PAN + 1 entity + 1 Z + 1 checksum)
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      return res.status(400).json({ error: 'Invalid GSTIN format. Expected 15-character Indian GST identification number (e.g., 08AAACH7409R1ZZ).' });
    }

    user.businessProfile = {
      ...bp,
      companyName,
      gstin,
      businessType,
      panNumber,
      website,
      address,
      city,
      state,
      pincode,
      contactPerson,
      contactPhone,
      documentUrl,
      verificationStatus: req.body.submitForAudit ? 'pending' : (bp.verificationStatus || 'unverified'),
      verificationAppliedAt: req.body.submitForAudit ? new Date() : bp.verificationAppliedAt,
    };

    // Auto-promote role to 'business' if currently 'customer'
    if (user.role === 'customer') {
      user.role = 'business';
    }

    await user.save();

    res.json({
      message: req.body.submitForAudit
        ? 'Business credentials submitted for administrative verification audit.'
        : 'Business profile updated successfully.',
      businessProfile: user.businessProfile,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
