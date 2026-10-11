import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { Measurement, Order, Tailor } from '../models.js';
import { createNotification } from './notificationController.js';

function buildOrderQuery(paramId, extra = {}) {
  const isObjectId = mongoose.isValidObjectId(paramId);
  const idQuery = isObjectId
    ? { $or: [{ id: paramId }, { _id: paramId }] }
    : { id: paramId };
  if (Object.keys(extra).length === 0) return idQuery;
  return { $and: [idQuery, extra] };
}

export async function listOrders(req, res) {
  try {
    let rows = await Order.find({ clerkUserId: req.authUserId }).sort({ createdAt: -1 }).lean();
    if (req.query.status === 'active') rows = rows.filter(o => !['Completed', 'Cancelled'].includes(o.status));
    if (req.query.status === 'quotes') rows = rows.filter(o => o.status === 'Quote Received');
    if (req.query.status === 'history') rows = rows.filter(o => ['Completed', 'Cancelled'].includes(o.status));

    // Verify tailor existence
    const tailorIds = [...new Set(rows.map(r => r.tailorId).filter(Boolean))];
    const liveTailors = tailorIds.length ? await Tailor.find({ _id: { $in: tailorIds } }).select('_id').lean() : [];
    const liveSet = new Set(liveTailors.map(t => String(t._id)));

    rows = rows.map(order => {
      const exists = order.tailorId && liveSet.has(String(order.tailorId));
      if (!exists && order.status === 'Completed') {
        return { ...order, tailorName: 'undefined' };
      }
      return order;
    });

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrder(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id)).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isTailor = await orderBelongsToTailor(req, order);
    const isAdmin = req.appUser?.role === 'admin';
    if (!isOwner && !isTailor && !isAdmin) {
      return res.status(403).json({ error: 'You do not have access to this order.' });
    }

    if (order.tailorId) {
      const tailorExists = await Tailor.exists({ _id: order.tailorId });
      if (!tailorExists && order.status === 'Completed') {
        order.tailorName = 'undefined';
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createOrder(req, res) {
  try {
    const input = req.body || {};
    const tailorId = String(input.tailorId || '');
    if (!/^[a-f\d]{24}$/i.test(tailorId)) return res.status(400).json({ error: 'Choose a valid tailor.' });
    const tailor = await Tailor.findById(tailorId).lean();
    if (!tailor) return res.status(404).json({ error: 'Tailor not found.' });

    const garment = String(input.garment || '').trim().slice(0, 100);
    const quantity = Number(input.quantity);
    if (!garment) return res.status(400).json({ error: 'Choose a stitching service.' });
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      return res.status(400).json({ error: 'Quantity must be between 1 and 500.' });
    }

    const services = Array.isArray(tailor.services) ? tailor.services : [];
    const categories = Array.isArray(tailor.categories) ? tailor.categories : [];
    const service = services.find(item => String(item.name).trim().toLowerCase() === garment.toLowerCase());
    const categoryMatch = categories.find(item => String(item).trim().toLowerCase() === garment.toLowerCase());
    if (services.length && !service) return res.status(400).json({ error: 'That service is not offered by this tailor.' });
    if (!services.length && categories.length && !categoryMatch) return res.status(400).json({ error: 'Choose one of this tailor’s listed specialties.' });

    const priceValue = service?.price ?? tailor.minPrice;
    const unitPrice = Number.isFinite(Number(priceValue)) && Number(priceValue) >= 0 ? Number(priceValue) : null;
    const measurementProfileId = String(input.measurementProfileId || '');
    if (measurementProfileId) {
      if (!/^[a-f\d]{24}$/i.test(measurementProfileId)) return res.status(400).json({ error: 'Choose a valid measurement profile.' });
      const belongsToCustomer = await Measurement.exists({ _id: measurementProfileId, clerkUserId: req.authUserId });
      if (!belongsToCustomer) return res.status(400).json({ error: 'That measurement profile is not available on your account.' });
    }

    const now = new Date();
    const order = await Order.create({
      id: `MT-${randomUUID().slice(0, 8).toUpperCase()}`,
      clerkUserId: req.authUserId,
      tailorId: tailor._id,
      tailorName: tailor.name,
      garment,
      category: String(input.category || categoryMatch || garment).trim().slice(0, 100),
      quantity,
      color: String(input.color || '').trim().slice(0, 60),
      fabric: String(input.fabric || '').trim().slice(0, 100),
      deadline: String(input.deadline || '').trim().slice(0, 80),
      notes: String(input.notes || '').trim().slice(0, 1000),
      measurementMode: input.measurementMode === 'profile' && measurementProfileId ? 'profile' : 'self',
      measurementProfileId: measurementProfileId || undefined,
      unitPrice: unitPrice ?? undefined,
      price: unitPrice === null ? undefined : unitPrice * quantity,
      status: 'Request Sent',
      history: [['Request Sent', now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })]],
    });

    // Notify tailor of new order request
    if (tailor.ownerClerkUserId) {
      createNotification({
        recipientClerkUserId: tailor.ownerClerkUserId,
        title: 'New Stitching Request',
        message: `Customer requested '${garment}' (${quantity}x). Review specifications and submit a quote.`,
        type: 'order',
        link: '/dashboard',
        metadata: { orderId: order.id, garment, quantity },
      }).catch(() => {});
    }

    // Confirmation notification to customer
    createNotification({
      recipientClerkUserId: req.authUserId,
      title: 'Order Request Placed',
      message: `Your stitching request #${order.id} for '${garment}' has been sent to ${tailor.name}.`,
      type: 'order',
      link: '/orders',
      metadata: { orderId: order.id, garment, tailorId: tailor._id },
    }).catch(() => {});

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function orderBelongsToTailor(req, order) {
  if (req.appUser?.role === 'admin') return true;
  const tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId }).select('_id').lean();
  return Boolean(tailor && String(tailor._id) === String(order.tailorId));
}

export async function sendOrderQuote(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order || !(await orderBelongsToTailor(req, order))) return res.status(404).json({ error: 'Order request not found.' });
    if (!['Request Sent', 'Quote Received'].includes(order.status)) return res.status(409).json({ error: 'This order is no longer waiting for a quote.' });
    const quotePrice = Number(req.body?.quotePrice);
    if (!Number.isFinite(quotePrice) || quotePrice < 0 || quotePrice > 10000000) return res.status(400).json({ error: 'Enter a valid quote amount.' });
    order.quotePrice = quotePrice;
    order.status = 'Quote Received';
    order.history.push(['Quote Received', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })]);
    await order.save();

    // Notify customer that quote was provided
    createNotification({
      recipientClerkUserId: order.clerkUserId,
      title: 'Tailor Quote Received',
      message: `${order.tailorName || 'The atelier'} submitted a quote of ₹${quotePrice} for order #${order.id}.`,
      type: 'quote',
      link: '/orders',
      metadata: { orderId: order.id, quotePrice },
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function declineOrder(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order || !(await orderBelongsToTailor(req, order))) return res.status(404).json({ error: 'Order request not found.' });
    if (['In Production', 'Ready for Pickup', 'Completed'].includes(order.status)) {
      return res.status(400).json({ error: 'Orders already in production or completed cannot be declined.' });
    }
    order.status = 'Cancelled';
    order.history.push(['Cancelled', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 'Declined by Tailor']);
    await order.save();

    // Notify customer that order was declined
    createNotification({
      recipientClerkUserId: order.clerkUserId,
      title: 'Order Request Declined',
      message: `${order.tailorName || 'The atelier'} was unable to accept order #${order.id}.`,
      type: 'order',
      link: '/orders',
      metadata: { orderId: order.id },
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function acceptOrderQuote(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id, { clerkUserId: req.authUserId }));
    if (!order) return res.status(404).json({ error: 'Order request not found.' });
    if (order.status !== 'Quote Received' || order.quotePrice == null) return res.status(409).json({ error: 'There is no tailor quote to accept yet.' });
    order.status = 'Accepted';
    order.history.push(['Accepted', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })]);
    await order.save();

    // Notify tailor that customer accepted quote
    Tailor.findById(order.tailorId).select('ownerClerkUserId').lean().then(t => {
      if (t?.ownerClerkUserId) {
        createNotification({
          recipientClerkUserId: t.ownerClerkUserId,
          title: 'Quote Accepted by Customer',
          message: `Customer accepted your quote of ₹${order.quotePrice} for order #${order.id}. Production can now begin.`,
          type: 'quote',
          link: '/dashboard',
          metadata: { orderId: order.id, quotePrice: order.quotePrice },
        }).catch(() => {});
      }
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * Customer cancel order endpoint
 * Order can ONLY be cancelled if no progress has been made by the tailor
 * (i.e., status is Request Sent or Quote Received).
 * Cancelled orders are preserved in MongoDB and NEVER purged.
 */
export async function cancelCustomerOrder(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isAdmin = req.appUser?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'This order is already cancelled.' });
    }

    // Gating check: customer can only cancel if tailor has NOT made progress
    // If Accepted, In Production, Ready for Pickup, or Completed, cancellation is blocked.
    const cancellableStatuses = ['Request Sent', 'Quote Received', 'Pending Review'];
    if (!cancellableStatuses.includes(order.status) && !isAdmin) {
      return res.status(400).json({
        error: `Cannot cancel order in status '${order.status}'. Work or commitment has already commenced with the atelier. Please contact the studio directly.`,
      });
    }

    const reason = String(req.body?.reason || 'Cancelled by customer').trim().slice(0, 300);
    order.status = 'Cancelled';
    order.history = order.history || [];
    order.history.push([
      'Cancelled',
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      reason,
    ]);
    await order.save();

    // Notify tailor that customer cancelled the order
    Tailor.findById(order.tailorId).select('ownerClerkUserId').lean().then(t => {
      if (t?.ownerClerkUserId) {
        createNotification({
          recipientClerkUserId: t.ownerClerkUserId,
          title: 'Order Cancelled by Customer',
          message: `Order #${order.id} (${order.garment}) was cancelled by the customer. Reason: ${reason}.`,
          type: 'order',
          link: '/dashboard',
          metadata: { orderId: order.id, reason },
        }).catch(() => {});
      }
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Order successfully cancelled and stored in past orders.',
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order || !(await orderBelongsToTailor(req, order))) return res.status(404).json({ error: 'Order request not found.' });
    const nextStatus = String(req.body?.status || '');
    const transitions = {
      Accepted: ['In Production', 'Cancelled'],
      'In Production': ['Ready for Pickup'],
      'Ready for Pickup': ['Completed'],
    };
    if (req.appUser?.role !== 'admin' && !transitions[order.status]?.includes(nextStatus)) {
      return res.status(409).json({ error: 'That order status change is not allowed.' });
    }
    if (!['In Production', 'Ready for Pickup', 'Completed', 'Cancelled'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Choose a valid next status.' });
    }
    order.status = nextStatus;
    order.history.push([nextStatus, new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })]);
    await order.save();

    // Notify customer about order progress/status change
    createNotification({
      recipientClerkUserId: order.clerkUserId,
      title: `Order Status: ${nextStatus}`,
      message: `Your order #${order.id} for '${order.garment}' is now '${nextStatus}'.`,
      type: 'status',
      link: '/orders',
      metadata: { orderId: order.id, nextStatus },
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteOrder(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order) return res.status(404).json({ error: 'Order request not found.' });

    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isTailor = await orderBelongsToTailor(req, order);
    const isAdmin = req.appUser?.role === 'admin';

    if (!isOwner && !isTailor && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to delete this order.' });
    }

    const preProductionStatuses = ['Request Sent', 'Quote Received'];
    if (!preProductionStatuses.includes(order.status)) {
      return res.status(400).json({
        error: 'Orders that have already entered production or are completed cannot be deleted.',
      });
    }

    await Order.deleteOne({ _id: order._id });
    res.json({ success: true, message: 'Order request deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
