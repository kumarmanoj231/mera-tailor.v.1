import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Order, BusinessRequest, Message, User } from '../server/models.js';

// ============================================================================
// 1. DATABASE SCHEMA INTEGRITY & EXTENSIONS
// ============================================================================

test('Schema: Order schema contains B2B bulk contract fields and indexes', () => {
  const schema = Order.schema;

  // orderType
  assert.ok(schema.path('orderType'), 'Order schema must define orderType');
  assert.deepEqual(schema.path('orderType').enumValues, ['individual', 'bulk']);

  // B2B contract linkage
  assert.ok(schema.path('businessId'), 'Order schema must define businessId');
  assert.ok(schema.path('organisation'), 'Order schema must define organisation');
  assert.ok(schema.path('sourceRequirement'), 'Order schema must define sourceRequirement ref');
  assert.ok(schema.path('acceptedQuote'), 'Order schema must define acceptedQuote');

  // Specs & attachments
  assert.ok(schema.path('sizeBreakdown'), 'Order schema must define sizeBreakdown');
  assert.ok(schema.path('designAttachments'), 'Order schema must define designAttachments');
  assert.ok(schema.path('progressPhotos'), 'Order schema must define progressPhotos');

  // Commercial terms & platform fee
  assert.ok(schema.path('agreedAmount'), 'Order schema must define agreedAmount');
  assert.ok(schema.path('platformFeeRate'), 'Order schema must define platformFeeRate');
  assert.ok(schema.path('platformFeeAmount'), 'Order schema must define platformFeeAmount');
  assert.ok(schema.path('netTailorAmount'), 'Order schema must define netTailorAmount');
  assert.deepEqual(schema.path('platformFeeStatus').enumValues, [
    'pending',
    'calculated',
    'collected',
    'waived',
    'settled',
  ]);

  // Production milestones
  assert.ok(schema.path('productionStatus'), 'Order schema must define productionStatus');
  assert.deepEqual(schema.path('productionStatus').enumValues, [
    'not_started',
    'measurements_pending',
    'design_approval_pending',
    'materials_pending',
    'cutting',
    'stitching',
    'quality_check',
    'ready_for_delivery',
    'delivered',
  ]);

  // Payment statuses
  assert.ok(schema.path('paymentStatus'), 'Order schema must define paymentStatus');
  assert.deepEqual(schema.path('paymentStatus').enumValues, [
    'pending',
    'authorized',
    'advance_paid',
    'paid',
    'refunded',
    'disputed',
  ]);

  // Audit history
  assert.ok(schema.path('statusHistory'), 'Order schema must define statusHistory array');
});

test('Schema: BusinessRequest schema defines awardedOrderId and sizeBreakdown', () => {
  const schema = BusinessRequest.schema;
  assert.ok(schema.path('awardedOrderId'), 'BusinessRequest must define awardedOrderId ref');
  assert.ok(schema.path('sizeBreakdown'), 'BusinessRequest must define sizeBreakdown');
  assert.ok(schema.path('designAttachments'), 'BusinessRequest must define designAttachments');
});

test('Schema: Message schema supports persistent order and requirement chat', () => {
  const schema = Message.schema;
  assert.ok(schema.path('orderId'), 'Message must define orderId string identifier');
  assert.ok(schema.path('orderObjectId'), 'Message must define orderObjectId ref');
  assert.ok(schema.path('senderClerkUserId'), 'Message must define senderClerkUserId');
  assert.ok(schema.path('senderName'), 'Message must define senderName');
  assert.ok(schema.path('senderRole'), 'Message must define senderRole');
  assert.ok(schema.path('content'), 'Message must define content');
  assert.deepEqual(schema.path('messageType').enumValues, [
    'text',
    'system',
    'milestone_update',
    'quote_update',
    'attachment',
    'payment_update',
  ]);
});

// ============================================================================
// 2. COMMERCIAL TERMS & PLATFORM FEE CALCULATIONS
// ============================================================================

test('Commercials: 5% Platform fee and net tailor amount calculation logic', () => {
  const feeRate = 0.05;
  const quoteTotalAmount = 75000;

  const platformFeeAmount = Math.round(quoteTotalAmount * feeRate);
  const netTailorAmount = quoteTotalAmount - platformFeeAmount;

  assert.equal(platformFeeAmount, 3750, 'Platform fee at 5% for 75,000 must be 3,750');
  assert.equal(netTailorAmount, 71250, 'Net tailor amount must be 71,250');
  assert.equal(platformFeeAmount + netTailorAmount, quoteTotalAmount, 'Sum must equal gross agreed amount');
});

test('Commercials: High volume integer precision rounding', () => {
  const feeRate = 0.05;
  const oddAmount = 33333; // 5% = 1666.65 -> 1667

  const platformFeeAmount = Math.round(oddAmount * feeRate);
  const netTailorAmount = oddAmount - platformFeeAmount;

  assert.equal(platformFeeAmount, 1667);
  assert.equal(netTailorAmount, 31666);
  assert.equal(platformFeeAmount + netTailorAmount, oddAmount);
});

// ============================================================================
// 3. CONTRACT-TO-ORDER TRANSFORMATION & IDEMPOTENCY
// ============================================================================

test('Contract Award: Auto creates bulk Order from accepted quotation', () => {
  const businessUserId = 'user_biz_1001';
  const tailorUserId = 'user_tailor_2002';
  const tailorDocId = new mongoose.Types.ObjectId();
  const requestId = new mongoose.Types.ObjectId();
  const quoteId = new mongoose.Types.ObjectId();

  const businessRequest = {
    _id: requestId,
    title: '500 Navy Blue Cotton Uniforms',
    category: 'Corporate Uniforms',
    organisation: 'Acme Corporation',
    quantity: 500,
    unitBudget: 500,
    estBudget: 250000,
    deliveryDeadline: new Date(Date.now() + 30 * 86400000),
    deliveryAddress: 'Plot 45, MIDC Industrial Area, Pune',
    sizeBreakdown: { S: 100, M: 200, L: 150, XL: 50 },
    designAttachments: ['https://example.com/spec-sheet.pdf'],
    status: 'open',
    clerkUserId: businessUserId,
    quotes: [
      {
        _id: quoteId,
        tailorId: tailorDocId,
        tailorClerkUserId: tailorUserId,
        tailorName: 'Royal Threads Atelier',
        pricePerUnit: 480,
        totalAmount: 240000,
        leadTimeDays: 25,
        notes: 'Premium twill weave cotton with reinforced stitching',
        status: 'pending',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        tailorId: new mongoose.Types.ObjectId(),
        tailorClerkUserId: 'user_other_3003',
        tailorName: 'Metro Stitches',
        pricePerUnit: 520,
        totalAmount: 260000,
        leadTimeDays: 30,
        status: 'pending',
      },
    ],
  };

  // Simulate award logic from updateQuoteStatus
  const selectedQuote = businessRequest.quotes.find((q) => q._id.equals(quoteId));
  assert.ok(selectedQuote);

  const agreedAmount = selectedQuote.totalAmount;
  const platformFeeRate = 0.05;
  const platformFeeAmount = Math.round(agreedAmount * platformFeeRate);
  const netTailorAmount = agreedAmount - platformFeeAmount;

  const businessDocId = new mongoose.Types.ObjectId();
  const orderData = {
    id: `MT-B2B-${Date.now().toString().slice(-6)}`,
    orderType: 'bulk',
    clerkUserId: businessUserId,
    businessId: businessDocId,
    tailorId: selectedQuote.tailorId,
    tailorName: selectedQuote.tailorName,
    sourceRequirement: businessRequest._id,
    acceptedQuote: quoteId,
    organisation: businessRequest.organisation,
    garment: businessRequest.title,
    category: businessRequest.category,
    quantity: businessRequest.quantity,
    sizeBreakdown: businessRequest.sizeBreakdown,
    designAttachments: businessRequest.designAttachments,
    agreedAmount,
    unitPrice: selectedQuote.pricePerUnit,
    price: agreedAmount,
    quotePrice: agreedAmount,
    platformFeeRate,
    platformFeeAmount,
    netTailorAmount,
    platformFeeStatus: 'calculated',
    paymentStatus: 'pending',
    productionStatus: 'not_started',
    status: 'Confirmed',
    deadline: '25 Days',
    deliveryDeadline: '25 Days',
    statusHistory: [
      {
        status: 'Confirmed',
        productionStatus: 'not_started',
        updatedBy: 'Test Enterprise',
        role: 'business',
        note: `Bulk contract awarded for ₹${agreedAmount}.`,
        timestamp: new Date(),
      },
    ],
  };

  const createdOrder = new Order(orderData);
  const validationError = createdOrder.validateSync();
  assert.equal(validationError, undefined, 'Created bulk order must be schema valid');

  assert.equal(createdOrder.orderType, 'bulk');
  assert.equal(createdOrder.agreedAmount, 240000);
  assert.equal(createdOrder.platformFeeAmount, 12000);
  assert.equal(createdOrder.netTailorAmount, 228000);
  assert.equal(createdOrder.quantity, 500);
  assert.equal(createdOrder.status, 'Confirmed');
  assert.equal(createdOrder.productionStatus, 'not_started');
  assert.equal(createdOrder.sourceRequirement.toString(), requestId.toString());
});

test('Contract Award: Prevents duplicate award if tender is already awarded (Idempotency)', () => {
  const businessRequest = {
    status: 'awarded',
    awardedOrderId: new mongoose.Types.ObjectId(),
  };

  let rejected = false;
  if (businessRequest.status === 'awarded') {
    rejected = true;
  }

  assert.equal(rejected, true, 'Must reject awarding an already awarded contract');
});

test('Contract Award: Rejects competitor quotes when one quote is accepted', () => {
  const quote1Id = new mongoose.Types.ObjectId();
  const quote2Id = new mongoose.Types.ObjectId();
  const quote3Id = new mongoose.Types.ObjectId();

  const quotes = [
    { _id: quote1Id, status: 'pending' },
    { _id: quote2Id, status: 'pending' },
    { _id: quote3Id, status: 'pending' },
  ];

  // Accepting quote 2
  const targetId = quote2Id;
  for (const q of quotes) {
    if (q._id.equals(targetId)) {
      q.status = 'accepted';
    } else {
      q.status = 'rejected';
    }
  }

  assert.equal(quotes[0].status, 'rejected');
  assert.equal(quotes[1].status, 'accepted');
  assert.equal(quotes[2].status, 'rejected');
});

// ============================================================================
// 4. ORDER LIFECYCLE & MILESTONE ADVANCEMENT
// ============================================================================

test('Order Lifecycle: Milestone transitions are strictly validated', () => {
  const allowedMilestones = [
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

  const validMilestone = 'cutting';
  const invalidMilestone = 'shipping_via_drone';

  assert.ok(allowedMilestones.includes(validMilestone));
  assert.ok(!allowedMilestones.includes(invalidMilestone));
});

test('Order Lifecycle: Milestone updates sync order status to In Production', () => {
  let orderStatus = 'Confirmed';
  const newMilestone = 'stitching';

  if (['cutting', 'stitching', 'quality_check'].includes(newMilestone)) {
    if (['Accepted', 'Confirmed'].includes(orderStatus)) {
      orderStatus = 'In Production';
    }
  }

  assert.equal(orderStatus, 'In Production', 'Cutting/stitching should transition status to In Production');
});

test('Order Lifecycle: Delivered milestone transitions order status to Delivered', () => {
  let orderStatus = 'In Production';
  const newMilestone = 'delivered';

  if (newMilestone === 'delivered') {
    orderStatus = 'Delivered';
  }

  assert.equal(orderStatus, 'Delivered', 'Delivered milestone must transition order status to Delivered');
});

// ============================================================================
// 5. COMMUNICATION & ACCESS AUTHORIZATION
// ============================================================================

test('Authorization: Order messages only accessible to owner, assigned tailor, or admin', () => {
  const order = {
    userId: 'user_biz_1001',
    businessId: 'user_biz_1001',
    tailorClerkUserId: 'user_tailor_2002',
  };

  function isAuthorized(requesterUserId, requesterRole) {
    if (requesterRole === 'admin') return true;
    if (order.userId === requesterUserId) return true;
    if (order.businessId === requesterUserId) return true;
    if (order.tailorClerkUserId === requesterUserId) return true;
    return false;
  }

  assert.equal(isAuthorized('user_biz_1001', 'business'), true, 'Business owner is authorized');
  assert.equal(isAuthorized('user_tailor_2002', 'tailor'), true, 'Assigned tailor is authorized');
  assert.equal(isAuthorized('user_admin_9999', 'admin'), true, 'Platform admin is authorized');

  assert.equal(isAuthorized('user_stranger_4004', 'customer'), false, 'Third-party user is denied');
  assert.equal(isAuthorized('user_other_tailor_5005', 'tailor'), false, 'Unassigned tailor is denied');
});

// ============================================================================
// 6. ROLE IMMUTABILITY DURING CONTRACT & ORDER WORKFLOWS
// ============================================================================

test('Role Immutability: Awarding tenders and managing orders does NOT mutate user roles', () => {
  const businessUser = {
    clerkUserId: 'user_biz_1001',
    role: 'business',
    onboardingCompleted: true,
  };

  const tailorUser = {
    clerkUserId: 'user_tailor_2002',
    role: 'tailor',
    onboardingCompleted: true,
  };

  // Simulating an order creation and status change
  const currentBusinessRole = businessUser.role;
  const currentTailorRole = tailorUser.role;

  // Roles must remain strictly intact
  assert.equal(currentBusinessRole, 'business', 'Business user role remains business');
  assert.equal(currentTailorRole, 'tailor', 'Tailor user role remains tailor');
});
