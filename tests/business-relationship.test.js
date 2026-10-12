import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Business, Tailor, User } from '../server/models.js';
import { getOrSyncBusinessProfile } from '../server/utils/businessProfileMigration.js';

test('Database Architecture: Business schema matches ownerClerkUserId convention', () => {
  const schema = Business.schema;

  assert.ok(schema.path('ownerClerkUserId'), 'Business schema must define ownerClerkUserId');
  assert.equal(schema.path('ownerClerkUserId').instance, 'String');
  assert.equal(schema.path('companyName').instance, 'String');
  assert.equal(schema.path('gstin').instance, 'String');
  assert.equal(schema.path('verificationStatus').instance, 'String');
  assert.equal(schema.path('verified').instance, 'Boolean');

  // Verify enum values for verificationStatus
  const enumValues = schema.path('verificationStatus').enumValues;
  assert.deepEqual(enumValues, ['unverified', 'pending', 'verified', 'rejected', 'resubmission_required', 'suspended']);
});

test('Database Architecture: Tailor schema uses ownerClerkUserId convention', () => {
  const schema = Tailor.schema;

  assert.ok(schema.path('ownerClerkUserId'), 'Tailor schema must define ownerClerkUserId');
  assert.equal(schema.path('ownerClerkUserId').instance, 'String');
});

test('Database Architecture: User schema uses clerkUserId convention', () => {
  const schema = User.schema;

  assert.ok(schema.path('clerkUserId'), 'User schema must define clerkUserId');
  assert.equal(schema.path('clerkUserId').instance, 'String');
  assert.ok(schema.path('businessProfile.companyName'), 'User schema preserves businessProfile for dual-compatibility');
});

test('ID Safety: Validate ObjectId versus Clerk string IDs', () => {
  const validMongoId = new mongoose.Types.ObjectId().toString();
  const sampleClerkId = 'user_2xyzAbc123456789';

  assert.match(validMongoId, /^[a-f\d]{24}$/i, 'MongoDB _id must match 24-char hex format');
  assert.doesNotMatch(sampleClerkId, /^[a-f\d]{24}$/i, 'Clerk ID must never be treated as a valid MongoDB ObjectId');
  assert.ok(sampleClerkId.startsWith('user_'), 'Clerk ID convention starts with user_ prefix');
});

test('Business Model: Schema validation requires companyName and ownerClerkUserId', () => {
  const invalidBiz = new Business({});
  const err = invalidBiz.validateSync();

  assert.ok(err, 'Validation error expected when required fields are missing');
  assert.ok(err.errors.ownerClerkUserId, 'ownerClerkUserId is required');
  assert.ok(err.errors.companyName, 'companyName is required');

  const validBiz = new Business({
    ownerClerkUserId: 'user_test_business_999',
    companyName: 'Fabrics & Silks India Ltd',
    gstin: '08AAACH7409R1ZZ',
  });
  const validErr = validBiz.validateSync();
  assert.equal(validErr, undefined, 'Valid business document should have no validation errors');
  assert.equal(validBiz.verificationStatus, 'unverified', 'Default verificationStatus should be unverified');
  assert.equal(validBiz.verified, false, 'Default verified should be false');
});

test('Migration Helper: Gracefully handles null or missing clerkUserId', async () => {
  const res = await getOrSyncBusinessProfile(null);
  assert.equal(res, null);

  const resEmpty = await getOrSyncBusinessProfile('');
  assert.equal(resEmpty, null);
});
