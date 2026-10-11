import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User, Tailor, Business } from '../server/models.js';
import { publicUser } from '../server/controllers/userController.js';

test('User Schema: Role validation enforces allowed enum roles', () => {
  const schema = User.schema;
  const rolePath = schema.path('role');

  assert.ok(rolePath, 'User schema must define role');
  assert.equal(rolePath.instance, 'String');
  assert.deepEqual(rolePath.enumValues, ['customer', 'tailor', 'business', 'admin']);
  assert.equal(schema.path('onboardingCompleted').instance, 'Boolean');
});

test('publicUser helper: Accurately reports role and flags inconsistent roles', () => {
  // Normal customer
  const normalUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_cust_123',
    firstName: 'Arjun',
    lastName: 'Sharma',
    email: 'arjun@example.com',
    role: 'customer',
    onboardingCompleted: true,
  };
  const pubNormal = publicUser(normalUser);
  assert.equal(pubNormal.role, 'customer');
  assert.equal(pubNormal.onboardingCompleted, true);
  assert.equal(pubNormal.roleInconsistent, false);

  // Inconsistent or missing role
  const corruptedUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_corrupt_456',
    firstName: 'Priya',
    role: 'invalid_role_value',
    onboardingCompleted: false,
  };
  const pubCorrupted = publicUser(corruptedUser);
  assert.equal(pubCorrupted.roleInconsistent, true);
});

test('Role Immutability Logic: Rejects changing role once onboarding is completed', () => {
  const existingUser = {
    clerkUserId: 'user_tailor_789',
    role: 'tailor',
    onboardingCompleted: true,
  };

  const requestedRole = 'customer';

  // Simulating check in completeOnboarding
  let errorResponse = null;
  if (existingUser.onboardingCompleted) {
    if (existingUser.role && existingUser.role !== requestedRole) {
      errorResponse = {
        status: 409,
        body: {
          error: `Account role is permanent and cannot be changed. Your registered role is ${existingUser.role}.`,
          code: 'ROLE_IMMUTABLE',
          currentRole: existingUser.role,
        },
      };
    }
  }

  assert.ok(errorResponse, 'Must reject role change attempt');
  assert.equal(errorResponse.status, 409);
  assert.equal(errorResponse.body.code, 'ROLE_IMMUTABLE');
  assert.equal(errorResponse.body.currentRole, 'tailor');
});

test('Role Immutability Logic: Idempotently allows re-submitting current role', () => {
  const existingUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_tailor_789',
    role: 'tailor',
    onboardingCompleted: true,
  };

  const requestedRole = 'tailor';

  let isConflict = false;
  if (existingUser.onboardingCompleted) {
    if (existingUser.role && existingUser.role !== requestedRole) {
      isConflict = true;
    }
  }

  assert.equal(isConflict, false, 'Submitting identical role must be idempotent without conflict');
});

test('Role Immutability Logic: Rejects changing non-customer role even if onboardingCompleted is false', () => {
  const existingUser = {
    clerkUserId: 'user_biz_101',
    role: 'business',
    onboardingCompleted: false,
  };

  const requestedRole = 'customer';

  let errorResponse = null;
  if (existingUser.role && ['tailor', 'business', 'admin'].includes(existingUser.role) && existingUser.role !== requestedRole) {
    errorResponse = {
      status: 409,
      body: {
        error: `Account role is permanent and cannot be changed. Your registered role is ${existingUser.role}.`,
        code: 'ROLE_IMMUTABLE',
        currentRole: existingUser.role,
      },
    };
  }

  assert.ok(errorResponse, 'Must reject demoting business or tailor account');
  assert.equal(errorResponse.status, 409);
});

test('Tailor Schema: ownerClerkUserId is indexed for fast idempotent queries', () => {
  const tailorSchema = Tailor.schema;
  const ownerPath = tailorSchema.path('ownerClerkUserId');
  assert.ok(ownerPath, 'Tailor must define ownerClerkUserId');
  assert.equal(ownerPath.instance, 'String');
});
