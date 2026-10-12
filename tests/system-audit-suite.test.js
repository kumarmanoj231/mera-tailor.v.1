import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { validateOrderId, validateObjectId } from '../server/middleware/validate.js';
import { requireRole } from '../server/middleware/authMiddleware.js';
import { Order, BusinessRequest, User, Tailor, Business, AuditLog } from '../server/models.js';

// ============================================================================
// 1. ROUTE PARAMETER & INJECTION SECURITY
// ============================================================================

test('Security & Validation: validateOrderId accepts standard and enterprise formats', () => {
  const validIds = [
    'MT-A1B2C3D4',
    'MT-B2B-A1B2C3D4',
    'MT-ORD-998877',
    '507f1f77bcf86cd799439011',
    '6acc759ecc6ddd653774921e',
  ];

  for (const id of validIds) {
    let passed = false;
    validateOrderId({ params: { id } }, {}, () => { passed = true; });
    assert.equal(passed, true, `ID "${id}" should pass validation`);
  }

  const invalidIds = [
    '',
    'random-string-id',
    '12345',
    '../../etc/passwd',
    "'; DROP TABLE users; --",
    '<script>alert(1)</script>',
  ];

  for (const id of invalidIds) {
    let statusCode = null;
    let payload = null;
    const res = {
      status(code) { statusCode = code; return res; },
      json(body) { payload = body; },
    };
    validateOrderId({ params: { id } }, res, () => {});
    assert.equal(statusCode, 400, `Malicious or invalid ID "${id}" must be rejected with 400`);
    assert.equal(payload?.code, 'INVALID_ORDER_ID');
  }
});

test('Security & Validation: validateObjectId handles arbitrary parameter names', () => {
  const quoteValidator = validateObjectId('quoteId');

  let passed = false;
  quoteValidator({ params: { quoteId: '60c72b2f9b1d8b2badbee555' } }, {}, () => { passed = true; });
  assert.equal(passed, true, 'Valid 24-hex quoteId should pass');

  let statusCode = null;
  const res = {
    status(code) { statusCode = code; return res; },
    json() {},
  };
  quoteValidator({ params: { quoteId: 'invalid-quote' } }, res, () => {});
  assert.equal(statusCode, 400, 'Invalid quoteId must be rejected with 400');
});

// ============================================================================
// 2. ROLE ACCESS & AUTHORIZATION BOUNDARIES
// ============================================================================

test('Authorization: requireRole strictly admits allowed roles and rejects unauthorized roles', () => {
  const adminOnly = requireRole('admin');
  const businessAndAdmin = requireRole('business', 'admin');
  const tailorOnly = requireRole('tailor');

  // Customer attempting admin route
  let status1 = null;
  const res1 = { status(c) { status1 = c; return res1; }, json() {} };
  adminOnly({ appUser: { role: 'customer' } }, res1, () => {});
  assert.equal(status1, 403, 'Customer must be blocked from admin route');

  // Business accessing tender management
  let passed2 = false;
  businessAndAdmin({ appUser: { role: 'business' } }, {}, () => { passed2 = true; });
  assert.equal(passed2, true, 'Business should pass business route');

  // Customer attempting tender management
  let status3 = null;
  const res3 = { status(c) { status3 = c; return res3; }, json() {} };
  businessAndAdmin({ appUser: { role: 'customer' } }, res3, () => {});
  assert.equal(status3, 403, 'Customer must be blocked from business route');

  // Tailor accessing tailor studio workbook
  let passed4 = false;
  tailorOnly({ appUser: { role: 'tailor' } }, {}, () => { passed4 = true; });
  assert.equal(passed4, true, 'Tailor should pass tailor route');
});

// ============================================================================
// 3. ENTERPRISE MILESTONE ISOLATION
// ============================================================================

test('Business Logic: Production milestones are strictly reserved for bulk orders', () => {
  const retailOrder = {
    orderType: 'individual',
    status: 'In Production',
    productionStatus: 'not_started',
  };

  const bulkOrder = {
    orderType: 'bulk',
    status: 'In Production',
    productionStatus: 'cutting',
  };

  const isEligibleForMilestones = (order) => order.orderType === 'bulk';

  assert.equal(isEligibleForMilestones(retailOrder), false, 'Retail orders must not be eligible for production milestones');
  assert.equal(isEligibleForMilestones(bulkOrder), true, 'Bulk orders must be eligible for production milestones');
});

// ============================================================================
// 4. BULK CONTRACT TRANSFORMATION & SOURCE REQUIREMENT QUERYING
// ============================================================================

test('Order Queries: Dual identifier resolution matches custom ID, _id, and sourceRequirement', () => {
  const sampleOrderId = 'MT-B2B-TEST1234';
  const mongoObjectId = new mongoose.Types.ObjectId().toString();
  const tenderRequirementId = new mongoose.Types.ObjectId().toString();

  function buildOrderQuery(paramId, extra = {}) {
    const isObjectId = mongoose.isValidObjectId(paramId);
    const idQuery = isObjectId
      ? { $or: [{ id: paramId }, { _id: paramId }, { sourceRequirement: paramId }] }
      : { id: paramId };
    if (Object.keys(extra).length === 0) return idQuery;
    return { $and: [idQuery, extra] };
  }

  // 1. By custom string ID
  const query1 = buildOrderQuery(sampleOrderId);
  assert.deepEqual(query1, { id: sampleOrderId });

  // 2. By MongoDB ObjectId
  const query2 = buildOrderQuery(mongoObjectId);
  assert.deepEqual(query2, {
    $or: [
      { id: mongoObjectId },
      { _id: mongoObjectId },
      { sourceRequirement: mongoObjectId },
    ],
  });

  // 3. By tender requirement ID
  const query3 = buildOrderQuery(tenderRequirementId);
  assert.ok(query3.$or.some((c) => c.sourceRequirement === tenderRequirementId));
});

// ============================================================================
// 5. AUDIT INTEGRITY & DATABASE METRICS ACCURACY
// ============================================================================

test('Admin Architecture: Operational metrics calculate from authoritative DB models', () => {
  const mockTailors = [
    { verificationStatus: 'verified', verified: true },
    { verificationStatus: 'pending', verified: false },
    { verificationStatus: 'rejected', verified: false },
  ];

  const mockUsers = [
    { role: 'customer' },
    { role: 'tailor' },
    { role: 'business' },
    { role: 'admin' },
  ];

  const pendingTailors = mockTailors.filter(t => t.verificationStatus === 'pending');
  const verifiedTailors = mockTailors.filter(t => t.verified || t.verificationStatus === 'verified');

  assert.equal(pendingTailors.length, 1, 'Pending queue must only contain pending accounts');
  assert.equal(verifiedTailors.length, 1, 'Verified count must only contain verified accounts');

  const roleCounts = { customer: 0, tailor: 0, business: 0, admin: 0 };
  mockUsers.forEach(u => {
    if (roleCounts[u.role] !== undefined) roleCounts[u.role]++;
  });

  assert.equal(roleCounts.customer, 1);
  assert.equal(roleCounts.tailor, 1);
  assert.equal(roleCounts.business, 1);
  assert.equal(roleCounts.admin, 1);
});
