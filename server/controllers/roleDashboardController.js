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

    let bulkRequirements = await BusinessRequest.find({
      status: { $in: ['submitted', 'reviewing', 'quoted'] },
    })
      .sort({ createdAt: -1 })
      .lean();

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
      : 0;

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
  } catch (error) { res.status(500).json({ error: error.message }); }
}

export async function getBusinessDashboard(req, res) {
  try {
    const requests = await BusinessRequest.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    res.json({ requests });
  } catch (error) { res.status(500).json({ error: error.message }); }
}
