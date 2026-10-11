import { Measurement, Order, Tailor, User } from '../models.js';

export async function getDashboard(req, res) {
  try {
    const orders = await Order.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    const measurements = await Measurement.find({ clerkUserId: req.authUserId }).sort({ updatedAt: -1, createdAt: -1 }).lean();
    const userDoc = await User.findOne({ clerkUserId: req.authUserId }).lean();
    const savedIds = (userDoc?.savedTailors || []).map(item => item.tailorId);
    const savedTailors = savedIds.length ? await Tailor.find({ _id: { $in: savedIds } }).lean() : [];

    res.json({
      newRequests: orders.filter(o => o.status === 'Request Sent').length,
      activeOrders: orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'Completed').length,
      savedTailorsCount: savedTailors.length,
      measurementsCount: measurements.length,
      orders,
      measurements,
      savedTailors,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
}

