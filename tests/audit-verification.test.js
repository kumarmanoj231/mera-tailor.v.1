import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { validateOrderId, validateObjectId } from '../server/middleware/validate.js';
import { createRateLimiter } from '../server/middleware/rateLimiter.js';
import { verifyClerkWebhook } from '../server/routes/webhookRoutes.js';

test('Security & Validation: validateObjectId', () => {
  const middleware = validateObjectId('id');

  // Valid 24 hex
  let passed = false;
  const mockReq1 = { params: { id: '507f1f77bcf86cd799439011' } };
  const mockRes1 = { status: () => mockRes1, json: () => {} };
  middleware(mockReq1, mockRes1, () => { passed = true; });
  assert.equal(passed, true, 'Valid 24-hex ObjectId should pass');

  // Invalid ID
  let statusVal = null;
  let jsonVal = null;
  const mockReq2 = { params: { id: 'invalid-id' } };
  const mockRes2 = {
    status: (code) => { statusVal = code; return mockRes2; },
    json: (body) => { jsonVal = body; },
  };
  middleware(mockReq2, mockRes2, () => {});
  assert.equal(statusVal, 400, 'Invalid ObjectId should return 400');
  assert.equal(jsonVal?.code, 'INVALID_OBJECT_ID');
});

test('Security & Validation: validateOrderId dual lookup support', () => {
  // Test MT- style custom ID
  let passed1 = false;
  validateOrderId({ params: { id: 'MT-A1B2C3D4' } }, {}, () => { passed1 = true; });
  assert.equal(passed1, true, 'MT- custom ID should pass validation');

  // Test MongoDB 24-hex ObjectId
  let passed2 = false;
  validateOrderId({ params: { id: '507f1f77bcf86cd799439011' } }, {}, () => { passed2 = true; });
  assert.equal(passed2, true, '24-hex ObjectId should pass validation');

  // Test SQL injection / path traversal attack
  let statusVal = null;
  const mockRes = {
    status: (code) => { statusVal = code; return mockRes; },
    json: () => {},
  };
  validateOrderId({ params: { id: "' OR 1=1--" } }, mockRes, () => {});
  assert.equal(statusVal, 400, 'Attack string should be blocked by validateOrderId');
});

test('Webhook Security: Svix signature verification and anti-tampering', () => {
  const originalSecret = process.env.CLERK_WEBHOOK_SECRET;
  const originalEnv = process.env.NODE_ENV;

  try {
    // Generate a mock base64 test secret dynamically to avoid false-positive pattern triggers in secret scanners
    const dummyBase64 = Buffer.from('test_dummy_webhook_signature_mock_key_only').toString('base64');
    const rawSecret = `whsec_${dummyBase64}`;
    process.env.CLERK_WEBHOOK_SECRET = rawSecret;
    process.env.NODE_ENV = 'production';

    // 1. Missing headers should be rejected
    const unauthenticatedReq = { headers: {}, body: { type: 'user.deleted' } };
    assert.equal(verifyClerkWebhook(unauthenticatedReq), false, 'Missing headers should be rejected');

    // 2. Expired timestamp (> 300 seconds ago) should be rejected
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 500;
    const expiredReq = {
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': String(expiredTimestamp),
        'svix-signature': 'v1,fakesig',
      },
      body: {},
    };
    assert.equal(verifyClerkWebhook(expiredReq), false, 'Expired timestamp must be rejected');

    // 3. Forged signature should be rejected
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const forgedReq = {
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': String(currentTimestamp),
        'svix-signature': 'v1,forgedSignatureBase64==',
      },
      rawBody: JSON.stringify({ type: 'user.deleted' }),
      body: { type: 'user.deleted' },
    };
    assert.equal(verifyClerkWebhook(forgedReq), false, 'Forged signature must fail verification');

    // 4. Correctly signed Svix signature should succeed
    const svixId = 'msg_valid_001';
    const payload = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });
    const toSign = `${svixId}.${currentTimestamp}.${payload}`;
    const secretBytes = Buffer.from(rawSecret.slice(6), 'base64');
    const validSignature = crypto.createHmac('sha256', secretBytes).update(toSign).digest('base64');

    const validReq = {
      headers: {
        'svix-id': svixId,
        'svix-timestamp': String(currentTimestamp),
        'svix-signature': `v1,${validSignature}`,
      },
      rawBody: payload,
      body: JSON.parse(payload),
    };
    assert.equal(verifyClerkWebhook(validReq), true, 'Authentic Svix signature must pass verification');
  } finally {
    process.env.CLERK_WEBHOOK_SECRET = originalSecret;
    process.env.NODE_ENV = originalEnv;
  }
});

test('Rate Limiting: blocks abusive bursts and sets standard headers', () => {
  const limiter = createRateLimiter({
    windowMs: 10000,
    max: 3,
    message: 'Too many requests',
    keyGenerator: () => 'test-ip-client',
  });

  const headers = {};
  let status = 200;
  let jsonResponse = null;

  const mockRes = {
    setHeader: (k, v) => { headers[k] = v; },
    status: (s) => { status = s; return mockRes; },
    json: (j) => { jsonResponse = j; },
  };

  // Request 1: should pass
  let req1Passed = false;
  limiter({ ip: '1.2.3.4' }, mockRes, () => { req1Passed = true; });
  assert.equal(req1Passed, true);
  assert.equal(headers['RateLimit-Remaining'], 2);

  // Request 2: should pass
  let req2Passed = false;
  limiter({ ip: '1.2.3.4' }, mockRes, () => { req2Passed = true; });
  assert.equal(req2Passed, true);
  assert.equal(headers['RateLimit-Remaining'], 1);

  // Request 3: should pass (hits max)
  let req3Passed = false;
  limiter({ ip: '1.2.3.4' }, mockRes, () => { req3Passed = true; });
  assert.equal(req3Passed, true);
  assert.equal(headers['RateLimit-Remaining'], 0);

  // Request 4: must be rejected with 429
  let req4Passed = false;
  limiter({ ip: '1.2.3.4' }, mockRes, () => { req4Passed = true; });
  assert.equal(req4Passed, false, '4th request must be blocked');
  assert.equal(status, 429, 'Blocked request must return HTTP 429');
  assert.equal(jsonResponse?.code, 'RATE_LIMIT_EXCEEDED');
  assert.ok(headers['Retry-After'] !== undefined, 'Retry-After header must be present');
});
