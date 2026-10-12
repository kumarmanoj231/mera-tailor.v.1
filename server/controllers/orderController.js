import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { BusinessRequest, Measurement, Message, Order, Tailor, User } from '../models.js';
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
    const isTailor = req.appUser?.role === 'tailor';
    let tailor = null;
    if (isTailor) {
      tailor = await Tailor.findOne({ ownerClerkUserId: req.authUserId }).select('_id name phone').lean();
    }

    let filter = {};
    if (isTailor && tailor && req.query.view !== 'customer') {
      filter.tailorId = tailor._id;
    } else {
      filter.clerkUserId = req.authUserId;
    }

    if (req.query.orderType && ['individual', 'bulk'].includes(req.query.orderType)) {
      filter.orderType = req.query.orderType;
    }

    let rows = await Order.find(filter).sort({ createdAt: -1 }).lean();
    if (req.query.status === 'active') rows = rows.filter(o => !['Completed', 'Cancelled'].includes(o.status));
    if (req.query.status === 'quotes') rows = rows.filter(o => ['Quote Received', 'Request Sent'].includes(o.status));
    if (req.query.status === 'history') rows = rows.filter(o => ['Completed', 'Cancelled'].includes(o.status));

    // When tailor is viewing their studio orders, enrich with authentic client details
    if (isTailor && tailor && req.query.view !== 'customer' && rows.length > 0) {
      const clientUserIds = [...new Set(rows.map(r => r.clerkUserId).filter(Boolean))];
      const clientUsers = await User.find({ clerkUserId: { $in: clientUserIds } })
        .select('clerkUserId firstName lastName phone email avatar imageUrl')
        .lean();
      const clientMap = new Map();
      clientUsers.forEach(u => {
        clientMap.set(u.clerkUserId, {
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Client',
          phone: u.phone || '',
          email: u.email || '',
          avatar: u.avatar || u.imageUrl || '',
        });
      });
      rows = rows.map(r => {
        const client = clientMap.get(r.clerkUserId);
        return {
          ...r,
          clientName: client?.name || 'Client',
          clientPhone: client?.phone || '',
          clientEmail: client?.email || '',
          clientAvatar: client?.avatar || '',
        };
      });
    } else {
      // Customer view: verify tailor existence
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
    }

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
    if (!order) return res.status(404).json({ error: 'Order request not found.' });

    const isTailor = await orderBelongsToTailor(req, order);
    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isAdmin = req.appUser?.role === 'admin';
    const nextStatus = String(req.body?.status || '');

    if (!isTailor && !isAdmin && !(isOwner && ['Completed'].includes(nextStatus))) {
      return res.status(403).json({ error: 'You are not authorized to update this order status.' });
    }

    const transitions = {
      'Request Sent': ['Quote Received', 'Cancelled'],
      'Quote Received': ['Accepted', 'Cancelled'],
      Accepted: ['In Production', 'Cancelled'],
      Confirmed: ['In Production', 'Cancelled'],
      'In Production': ['Ready for Pickup', 'Disputed', 'Cancelled'],
      'Ready for Pickup': ['Delivered', 'Completed'],
      Delivered: ['Completed', 'Disputed'],
    };
    if (req.appUser?.role !== 'admin' && !transitions[order.status]?.includes(nextStatus)) {
      return res.status(409).json({ error: `That order status change from '${order.status}' to '${nextStatus}' is not allowed.` });
    }
    if (!['Accepted', 'Confirmed', 'In Production', 'Ready for Pickup', 'Delivered', 'Completed', 'Cancelled', 'Disputed'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Choose a valid next status.' });
    }
    order.status = nextStatus;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    order.history.push([nextStatus, dateStr]);

    // Also update productionStatus if reaching Completed
    if (nextStatus === 'Completed') {
      order.productionStatus = 'delivered';
    }

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: nextStatus,
      productionStatus: order.productionStatus,
      updatedBy: req.appUser?.firstName ? `${req.appUser.firstName} ${req.appUser.lastName || ''}`.trim() : (isOwner ? 'Client' : 'Tailor Studio'),
      role: req.appUser?.role || (isOwner ? 'customer' : 'tailor'),
      note: req.body?.note || `Status updated to ${nextStatus}`,
      timestamp: now,
    });

    if (order.sourceRequirement) {
      const brStatusMap = {
        'In Production': 'in-production',
        Completed: 'completed',
        Cancelled: 'cancelled',
      };
      if (brStatusMap[nextStatus]) {
        await BusinessRequest.updateOne({ _id: order.sourceRequirement }, { $set: { status: brStatusMap[nextStatus] } });
      }
    }

    await order.save();

    // Create system message in order-linked conversation
    await Message.create({
      orderId: order.id,
      orderObjectId: order._id,
      sourceRequirementId: order.sourceRequirement,
      senderClerkUserId: req.authUserId,
      senderName: req.appUser?.firstName ? `${req.appUser.firstName} ${req.appUser.lastName || ''}`.trim() : 'Tailor Studio',
      senderRole: req.appUser?.role || 'tailor',
      senderAvatar: req.appUser?.avatar || req.appUser?.imageUrl || '',
      content: `Order status changed to: ${nextStatus}. ${req.body?.note ? `Note: ${req.body.note}` : ''}`,
      messageType: 'status_update',
    }).catch(() => {});

    // Notify other party
    const notifyTarget = isOwner
      ? (await Tailor.findById(order.tailorId).select('ownerClerkUserId').lean())?.ownerClerkUserId
      : order.clerkUserId;
    if (notifyTarget) {
      createNotification({
        recipientClerkUserId: notifyTarget,
        title: `Order Status: ${nextStatus}`,
        message: `Order #${order.id} for '${order.garment}' is now '${nextStatus}'.`,
        type: 'status',
        link: '/orders',
        metadata: { orderId: order.id, nextStatus },
      }).catch(() => {});
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * PATCH /api/orders/:id/milestone
 * Production milestone transition (Tailor or Admin)
 */
export async function updateProductionMilestone(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order || !(await orderBelongsToTailor(req, order))) return res.status(404).json({ error: 'Order not found.' });

    const milestone = String(req.body?.milestone || '').trim();
    const validMilestones = [
      'not_started',
      'measurements_pending',
      'design_approval_pending',
      'materials_pending',
      'cutting',
      'stitching',
      'quality_check',
      'ready_for_delivery',
      'delivered',
    ];

    if (!validMilestones.includes(milestone)) {
      return res.status(400).json({ error: `Invalid milestone: ${milestone}.` });
    }

    order.productionStatus = milestone;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Synchronize overall order status with production milestone
    if (['cutting', 'stitching', 'quality_check'].includes(milestone)) {
      if (!['In Production', 'Ready for Pickup', 'Completed'].includes(order.status)) {
        order.status = 'In Production';
        order.history.push(['In Production', dateStr, `Milestone: ${milestone}`]);
      }
      if (order.sourceRequirement) {
        await BusinessRequest.updateOne({ _id: order.sourceRequirement }, { $set: { status: 'in-production' } }).catch(() => {});
      }
    } else if (milestone === 'ready_for_delivery') {
      order.status = 'Ready for Pickup';
      order.history.push(['Ready for Pickup', dateStr, 'Quality Check Complete']);
    } else if (milestone === 'delivered') {
      order.status = 'Completed';
      order.history.push(['Completed', dateStr, 'Delivered to client']);
      if (order.sourceRequirement) {
        await BusinessRequest.updateOne({ _id: order.sourceRequirement }, { $set: { status: 'completed' } }).catch(() => {});
      }
    }

    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: order.status,
      productionStatus: milestone,
      updatedBy: req.appUser?.firstName ? `${req.appUser.firstName} ${req.appUser.lastName || ''}`.trim() : 'Tailor Workshop',
      role: req.appUser?.role || 'tailor',
      note: req.body?.note || `Production milestone updated to ${milestone}`,
      timestamp: now,
    });

    if (req.body?.photoUrl) {
      order.progressPhotos = order.progressPhotos || [];
      order.progressPhotos.push({
        url: req.body.photoUrl,
        caption: req.body.photoCaption || '',
        milestone,
        uploadedAt: now,
      });
    }

    await order.save();

    // Create system message in order-linked conversation
    await Message.create({
      orderId: order.id,
      orderObjectId: order._id,
      sourceRequirementId: order.sourceRequirement,
      senderClerkUserId: req.authUserId,
      senderName: req.appUser?.firstName ? `${req.appUser.firstName} ${req.appUser.lastName || ''}`.trim() : 'Tailor Studio',
      senderRole: req.appUser?.role || 'tailor',
      senderAvatar: req.appUser?.avatar || req.appUser?.imageUrl || '',
      content: `Production milestone updated: ${milestone.replace(/_/g, ' ').toUpperCase()}.${req.body?.note ? ` ${req.body.note}` : ''}`,
      messageType: 'milestone_update',
    }).catch(() => {});

    // Notify client
    createNotification({
      recipientClerkUserId: order.clerkUserId,
      title: 'Production Milestone Update',
      message: `Order #${order.id} has reached milestone: ${milestone.replace(/_/g, ' ')}.`,
      type: 'status',
      link: '/orders',
      metadata: { orderId: order.id, milestone },
    }).catch(() => {});

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * GET /api/orders/:id/messages
 * Retrieve conversation history for an order
 */
export async function getOrderMessages(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id)).lean();
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isTailor = await orderBelongsToTailor(req, order);
    const isAdmin = req.appUser?.role === 'admin';

    if (!isOwner && !isTailor && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to view this order conversation.' });
    }

    const messages = await Message.find({
      $or: [
        { orderId: order.id },
        { orderObjectId: order._id },
        ...(order.sourceRequirement ? [{ sourceRequirementId: order.sourceRequirement }] : []),
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/orders/:id/messages
 * Send message in order-linked conversation
 */
export async function sendOrderMessage(req, res) {
  try {
    const order = await Order.findOne(buildOrderQuery(req.params.id));
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isOwner = String(order.clerkUserId) === String(req.authUserId);
    const isTailor = await orderBelongsToTailor(req, order);
    const isAdmin = req.appUser?.role === 'admin';

    if (!isOwner && !isTailor && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to participate in this order conversation.' });
    }

    const content = String(req.body?.content || '').trim().slice(0, 4000);
    if (!content && (!req.body?.attachments || !req.body.attachments.length)) {
      return res.status(400).json({ error: 'Message content or attachment is required.' });
    }

    const senderRole = req.appUser?.role || (isTailor ? 'tailor' : 'business');
    const senderName = req.appUser?.firstName
      ? `${req.appUser.firstName} ${req.appUser.lastName || ''}`.trim()
      : senderRole === 'tailor'
      ? order.tailorName
      : 'Business Client';

    const message = await Message.create({
      orderId: order.id,
      orderObjectId: order._id,
      sourceRequirementId: order.sourceRequirement,
      senderClerkUserId: req.authUserId,
      senderName,
      senderRole,
      senderAvatar: req.appUser?.avatar || req.appUser?.imageUrl || '',
      content: content || 'Attachment sent',
      messageType: req.body?.messageType || 'text',
      attachments: Array.isArray(req.body?.attachments) ? req.body.attachments : [],
    });

    // Notify other party
    let recipientClerkId = null;
    if (isOwner) {
      const tailorDoc = await Tailor.findById(order.tailorId).select('ownerClerkUserId').lean();
      recipientClerkId = tailorDoc?.ownerClerkUserId;
    } else {
      recipientClerkId = order.clerkUserId;
    }

    if (recipientClerkId && recipientClerkId !== req.authUserId) {
      createNotification({
        recipientClerkUserId: recipientClerkId,
        title: `New Message on #${order.id}`,
        message: `${senderName}: ${content.slice(0, 80)}${content.length > 80 ? '...' : ''}`,
        type: 'general',
        link: '/orders',
        metadata: { orderId: order.id, messageId: message._id },
      }).catch(() => {});
    }

    res.status(201).json(message);
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
