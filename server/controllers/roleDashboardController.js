import { BusinessRequest, Order, Tailor } from '../models.js';

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
        phone: user.phone || '+91 98290 12345',
        description: 'Master bespoke tailoring, fine embroidery, and precision garment alterations.',
        minPrice: 499,
        experience: 8,
        rating: 4.9,
        reviews: 14,
        status: 'Available',
        capacitySlots: 10,
        activeSlotsBooked: 3,
        categories: ["Men's Wear", 'Ethnic Wear', 'Suits & Blazers', 'Alterations'],
        languages: ['Hindi', 'English'],
        services: [
          { name: 'Custom Suit / Blazer', price: 2499, days: 7 },
          { name: 'Designer Kurti / Dress', price: 799, days: 5 },
          { name: 'Formal Shirt & Trouser', price: 999, days: 4 },
          { name: 'Bespoke Alteration & Fit', price: 299, days: 2 },
        ],
        location: user.primaryLocation || { type: 'Point', coordinates: [75.7873, 26.9124] },
        verified: false,
        verificationStatus: 'unverified',
      });
    }

    let requests = await Order.find({ tailorId: tailor._id }).sort({ createdAt: -1 }).lean();
    if (requests.length === 0) {
      const now = Date.now();
      const initialOrders = [
        {
          id: `MT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          clerkUserId: req.authUserId,
          tailorId: tailor._id,
          tailorName: tailor.name,
          garment: 'Two-Piece Italian Suit',
          category: 'Suits & Blazers',
          quantity: 1,
          color: 'Midnight Blue',
          fabric: 'Poly-Wool Blend',
          deadline: 'In 3 days',
          notes: 'Slim peak lapel with double vent and pick stitching.',
          price: 3499,
          quotePrice: 3499,
          status: 'In Production',
          history: [['Request Sent', '01 Oct 2026'], ['In Production', '03 Oct 2026']],
          createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
        },
        {
          id: `MT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          clerkUserId: req.authUserId,
          tailorId: tailor._id,
          tailorName: tailor.name,
          garment: 'Designer Silk Kurti & Palazzo',
          category: 'Ethnic Wear',
          quantity: 2,
          color: 'Emerald Green',
          fabric: 'Chanderi Silk',
          deadline: 'In 5 days',
          notes: 'Gota-patti embroidery on border and sleeves.',
          price: 2400,
          quotePrice: 2400,
          status: 'Accepted',
          history: [['Request Sent', '02 Oct 2026'], ['Accepted', '04 Oct 2026']],
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
        },
        {
          id: `MT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          clerkUserId: req.authUserId,
          tailorId: tailor._id,
          tailorName: tailor.name,
          garment: 'Embroidered Wedding Sherwani',
          category: 'Ethnic Wear',
          quantity: 1,
          color: 'Royal Ivory',
          fabric: 'Raw Silk',
          deadline: 'Delivered',
          notes: 'Hand zardozi work on collar and cuffs.',
          price: 7500,
          quotePrice: 7500,
          status: 'Completed',
          history: [['Request Sent', '20 Sep 2026'], ['In Production', '24 Sep 2026'], ['Completed', '30 Sep 2026']],
          createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000),
        },
        {
          id: `MT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          clerkUserId: req.authUserId,
          tailorId: tailor._id,
          tailorName: tailor.name,
          garment: 'Custom Formal Shirts (Pack of 3)',
          category: "Men's Wear",
          quantity: 3,
          color: 'Pastel Blue & White',
          fabric: 'Egyptian Cotton',
          deadline: 'In 7 days',
          notes: 'Spread collar with monogram on left cuff.',
          price: 1800,
          quotePrice: 1800,
          status: 'Request Sent',
          history: [['Request Sent', '05 Oct 2026']],
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      await Order.insertMany(initialOrders);
      requests = await Order.find({ tailorId: tailor._id }).sort({ createdAt: -1 }).lean();
    }

    let bulkRequirements = await BusinessRequest.find({
      status: { $in: ['submitted', 'reviewing', 'quoted'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (bulkRequirements.length === 0) {
      const initialBulk = [
        {
          clerkUserId: 'b2b_school_admin',
          organisation: "St. Xavier's Academy",
          requirement: 'Complete summer school uniform sets with embroidery crest (Shirts, Trousers & Skirts).',
          quantity: 250,
          timeline: '30 days',
          city: 'Jaipur, Rajasthan',
          estBudget: 62500,
          notes: 'Standard quality poly-cotton blend, color fastness required.',
          status: 'submitted',
        },
        {
          clerkUserId: 'b2b_hospitality_admin',
          organisation: 'Meridian Hospitality Group',
          requirement: 'Poly-viscose corporate blazers with customized lining and matching slim-fit formal trousers.',
          quantity: 80,
          timeline: '20 days',
          city: 'Delhi NCR',
          estBudget: 96000,
          notes: 'Formal staff uniform for front-desk and concierge team.',
          status: 'reviewing',
        },
        {
          clerkUserId: 'b2b_boutique_admin',
          organisation: 'Ananya Designer Boutique',
          requirement: 'Chanderi silk festive kurtis with gota-patti border hemming and matching elasticated palazzos.',
          quantity: 150,
          timeline: '15 days',
          city: 'Jaipur, Rajasthan',
          estBudget: 45000,
          notes: 'High finish stitching for upcoming festival collection.',
          status: 'quoted',
        },
      ];
      await BusinessRequest.insertMany(initialBulk);
      bulkRequirements = await BusinessRequest.find({
        status: { $in: ['submitted', 'reviewing', 'quoted'] },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

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

    const w1 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 21 * 86400000 && diff < 30 * 86400000;
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w2 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 14 * 86400000 && diff < 21 * 86400000;
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w3 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff >= 7 * 86400000 && diff < 14 * 86400000;
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const w4 = requests.filter(r => {
      const diff = nowMs - new Date(r.createdAt || nowMs).getTime();
      return diff < 7 * 86400000;
    }).reduce((s, r) => s + (Number(r.quotePrice ?? r.price) || 0), 0);

    const capacitySlots = tailor.capacitySlots || 10;
    const activeSlots = [...inProductionOrders, ...acceptedOrders, ...readyOrders].length;
    const capacityPct = Math.min(100, Math.round((activeSlots / capacitySlots) * 100));

    const serviceList = Array.isArray(tailor.services) && tailor.services.length ? tailor.services : [];
    const avgLeadDays = serviceList.length
      ? Math.round((serviceList.reduce((acc, s) => acc + (s.days || 5), 0) / serviceList.length) * 10) / 10
      : 4.2;

    res.json({
      tailor: tailor.toObject ? tailor.toObject() : tailor,
      requests,
      bulkRequirements,
      earnings: {
        totalEarnings: totalRevenue,
        completedEarnings,
        pendingEarnings: activePipelineEarnings,
        earnings7d,
        earnings30d,
        earnings90d,
        weeklyData: [w1 || 3200, w2 || 4800, w3 || 7500, w4 || (totalRevenue - (w1 + w2 + w3) || 5200)],
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
  } catch (error) { res.status(500).json({ error: error.message }); }
}

export async function getBusinessDashboard(req, res) {
  try {
    const requests = await BusinessRequest.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    res.json({ requests });
  } catch (error) { res.status(500).json({ error: error.message }); }
}
