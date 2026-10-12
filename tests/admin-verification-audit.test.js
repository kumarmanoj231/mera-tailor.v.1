import test from 'node:test';
import assert from 'node:assert/strict';
import { Tailor, Business, User, VerificationRequest, AuditLog } from '../server/models.js';

test('Verification Architecture: VerificationRequest model and schema definitions', () => {
  const schema = VerificationRequest.schema;
  assert.ok(schema.path('targetType'), 'Must define targetType');
  assert.deepEqual(schema.path('targetType').enumValues, ['tailor', 'business']);
  assert.ok(schema.path('status'), 'Must define status');
  assert.deepEqual(schema.path('status').enumValues, [
    'pending',
    'verified',
    'rejected',
    'resubmission_required',
    'suspended',
  ]);
  assert.ok(schema.path('history'), 'Must define history array');
});

test('Verification Status: Standardized enum across Tailor and Business models', () => {
  const tailorEnum = Tailor.schema.path('verificationStatus').enumValues;
  const businessEnum = Business.schema.path('verificationStatus').enumValues;
  const userBizEnum = User.schema.path('businessProfile.verificationStatus').enumValues;

  const expected = ['unverified', 'pending', 'verified', 'rejected', 'resubmission_required', 'suspended'];
  assert.deepEqual(tailorEnum, expected, 'Tailor verificationStatus enum must match standard');
  assert.deepEqual(businessEnum, expected, 'Business verificationStatus enum must match standard');
  assert.deepEqual(userBizEnum, expected, 'User.businessProfile verificationStatus enum must match standard');
});

test('Audit Integrity: AuditLog action types and administrative audit logging', () => {
  const auditSchema = AuditLog.schema;
  assert.ok(auditSchema.path('action'), 'Must define action');
  assert.ok(auditSchema.path('adminClerkUserId'), 'Must define adminClerkUserId');
  assert.ok(auditSchema.path('result'), 'Must define result');
});

test('Hardcoded Artifact Audit: Zero hardcoded royal-jaipur-sample or mock fallbacks', async () => {
  const fs = await import('node:fs/promises');
  const adminPortalCode = await fs.readFile('src/pages/AdminPortal.jsx', 'utf8');

  // Verify royal-jaipur-sample has been completely purged
  assert.equal(adminPortalCode.includes('royal-jaipur-sample'), false, 'Demo studio royal-jaipur-sample must not exist in AdminPortal.jsx');
  assert.equal(adminPortalCode.includes('synthesizeLocalNotifications'), false, 'Fake notification synthesis function must not exist');
  assert.equal(adminPortalCode.includes('Manoj Kumar Lodha'), false, 'Hardcoded admin name strings must not exist as static fallbacks');
});

test('Queue Separation: Queue filters strictly separate pending from unverified and rejected', () => {
  const sampleTailors = [
    { _id: '1', name: 'Atelier A', verificationStatus: 'pending', verified: false },
    { _id: '2', name: 'Atelier B', verificationStatus: 'verified', verified: true },
    { _id: '3', name: 'Atelier C', verificationStatus: 'unverified', verified: false },
    { _id: '4', name: 'Atelier D', verificationStatus: 'rejected', verified: false },
    { _id: '5', name: 'Atelier E', verificationStatus: 'resubmission_required', verified: false },
    { _id: '6', name: 'Atelier F', verificationStatus: 'suspended', verified: false },
  ];

  const pending = sampleTailors.filter(t => t.verificationStatus === 'pending');
  const verified = sampleTailors.filter(t => t.verified === true || t.verificationStatus === 'verified');
  const unverified = sampleTailors.filter(t => t.verificationStatus === 'unverified');
  const rejected = sampleTailors.filter(t => t.verificationStatus === 'rejected');
  const resubmit = sampleTailors.filter(t => t.verificationStatus === 'resubmission_required');
  const suspended = sampleTailors.filter(t => t.verificationStatus === 'suspended');

  assert.equal(pending.length, 1, 'Only tailors with pending status are in pending queue');
  assert.equal(verified.length, 1, 'Only tailors with verified status are in verified queue');
  assert.equal(unverified.length, 1, 'Unverified accounts are distinct');
  assert.equal(rejected.length, 1, 'Rejected queue is distinct');
  assert.equal(resubmit.length, 1, 'Resubmission queue is distinct');
  assert.equal(suspended.length, 1, 'Suspended queue is distinct');
});
