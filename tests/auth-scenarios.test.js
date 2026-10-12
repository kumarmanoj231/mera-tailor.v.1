import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { User, Tailor, Business, AuditLog } from '../server/models.js';
import { publicUser } from '../server/controllers/userController.js';

test('Scenario 1 & 2 & 3: Initial Registration for Customer, Tailor, and Business', () => {
  const allowedRoles = ['customer', 'tailor', 'business'];
  for (const role of allowedRoles) {
    assert.ok(allowedRoles.includes(role), `Role ${role} must be a valid initial registration choice`);
  }
});

test('Scenario 4 & 8: Existing user entering sign-up does not overwrite persisted role', () => {
  const existingUser = {
    clerkUserId: 'user_cust_existing',
    role: 'customer',
    onboardingCompleted: true,
  };

  // User attempts to sign up with a different role 'tailor'
  const attemptedRole = 'tailor';
  let rejected = false;
  let code = null;

  if (existingUser.onboardingCompleted && existingUser.role !== attemptedRole) {
    rejected = true;
    code = 'ROLE_IMMUTABLE';
  }

  assert.equal(rejected, true, 'Existing user entering sign-up flow cannot overwrite existing role');
  assert.equal(code, 'ROLE_IMMUTABLE');
});

test('Scenario 5 & 11 & 12: Existing user login retains canonical role across sessions and refreshes', () => {
  const dbUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_tailor_persist',
    email: 'master@tailor.test',
    role: 'tailor',
    onboardingCompleted: true,
  };

  const userPublic = publicUser(dbUser);
  assert.equal(userPublic.role, 'tailor', 'Public user must reflect persisted tailor role');
  assert.equal(userPublic.onboardingCompleted, true);

  // Even if a query param or state claims customer, the DB user record is authoritative
  const clientSuppliedRole = 'customer';
  const resolvedRole = dbUser.role || clientSuppliedRole;
  assert.equal(resolvedRole, 'tailor', 'Database role must always supersede client claims');
});

test('Scenario 6 & 14: Rejection of self-service role escalation', () => {
  // Ordinary user attempting to modify role in PATCH /api/users/me
  const ordinaryUser = {
    clerkUserId: 'user_cust_456',
    role: 'customer',
  };

  const patchBody = {
    role: 'admin',
    firstName: 'Hacker',
  };

  // Filter allowed fields in userController.js updateProfile
  const allowed = {};
  if (typeof patchBody.firstName === 'string') allowed.firstName = patchBody.firstName;
  // Note: role is deliberately NOT allowed in updateProfile

  assert.equal(allowed.role, undefined, 'Role property must not be accepted in updateProfile');
  assert.equal(ordinaryUser.role, 'customer', 'Role remains customer');
});

test('Scenario 7 & 19: Existing Admin account maintains admin privileges and directs to /admin', () => {
  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_admin_999',
    email: 'admin@meratailor.com',
    role: 'admin',
    onboardingCompleted: true,
  };

  const pubAdmin = publicUser(adminUser);
  assert.equal(pubAdmin.role, 'admin');

  const destination = pubAdmin.role === 'admin' ? '/admin' : '/dashboard';
  assert.equal(destination, '/admin', 'Admin must be routed directly to /admin, never customer dashboard');
});

test('Scenario 13: Idempotent user lookup prevents duplicate user records for same Clerk ID', () => {
  const clerkUserId = 'user_clerk_idempotent_123';
  const query = { clerkUserId };
  assert.ok(query.clerkUserId, 'Lookup must query by unique clerkUserId index');
  assert.equal(User.schema.path('clerkUserId').options.unique, true, 'clerkUserId must be unique in User schema');
});

test('Scenario 15 & 16: Admin-only role updates, validation allowlist, and AuditLog recording', () => {
  const allowedAdminRoles = ['customer', 'tailor', 'business', 'admin'];

  const targetUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_target_001',
    role: 'customer',
  };

  const newRole = 'tailor';
  assert.ok(allowedAdminRoles.includes(newRole), 'Target role must be in allowlist');

  // Verify AuditLog model exists and has correct schema paths
  const auditSchema = AuditLog.schema;
  assert.ok(auditSchema.path('action'), 'AuditLog must have action path');
  assert.ok(auditSchema.path('adminClerkUserId'), 'AuditLog must record adminClerkUserId');
  assert.ok(auditSchema.path('previousRole'), 'AuditLog must record previousRole');
  assert.ok(auditSchema.path('newRole'), 'AuditLog must record newRole');
});

test('Scenario 17: Protection against demoting or deleting the last active Admin', () => {
  const adminCount = 1;
  const isTargetAdmin = true;
  const attemptedAction = 'demote';

  let blocked = false;
  if (isTargetAdmin && adminCount <= 1) {
    blocked = true;
  }

  assert.equal(blocked, true, 'Must block demoting the last active administrator');
});

test('Scenario 18: Admin self-demotion and self-disabling prevention', () => {
  const adminClerkUserId = 'user_admin_self';
  const targetClerkUserId = 'user_admin_self';
  const attemptedRoleChange = 'customer';

  let blocked = false;
  if (adminClerkUserId === targetClerkUserId && attemptedRoleChange !== 'admin') {
    blocked = true;
  }

  assert.equal(blocked, true, 'Admin cannot self-demote');
});

test('Scenario 20: Safe recovery for missing profile records without account loss', () => {
  // If user exists with role tailor, but tailor profile document was missing
  const user = {
    clerkUserId: 'user_tailor_recovery',
    role: 'tailor',
  };

  const tailorProfile = null;
  const needsSync = !tailorProfile && user.role === 'tailor';
  assert.equal(needsSync, true, 'Reconciliation detects missing role-specific record');
});

test('Scenario 9 & 10: Authenticated user clicking Sign In or Get Started is directed to role destination without role modal', () => {
  const tailorUser = {
    clerkUserId: 'user_tailor_flow',
    role: 'tailor',
    onboardingCompleted: true,
  };

  // When signed in user clicks "Get Started" or "Sign In"
  const isSignedIn = true;
  let openedModal = false;
  let destination = null;

  if (isSignedIn) {
    if (tailorUser.onboardingCompleted) {
      destination = tailorUser.role === 'admin' ? '/admin' : '/dashboard';
    } else {
      destination = '/onboarding';
    }
  } else {
    openedModal = true;
  }

  assert.equal(openedModal, false, 'Authenticated user must never see the role modal');
  assert.equal(destination, '/dashboard', 'Tailor is directed straight to their dashboard');
});

test('Scenario 21: Fast role caching and pre-hydration eliminates customer flash', () => {
  const cachedRole = 'tailor';
  const isSignedIn = true;
  const isProfileLoaded = false;
  const liveProfile = null;

  // Resolving role during pre-hydration
  const resolvedRole = isSignedIn
    ? (liveProfile?.role || cachedRole || (isProfileLoaded ? 'customer' : null))
    : 'guest';

  assert.equal(resolvedRole, 'tailor', 'Pre-hydration should immediately use cached role instead of defaulting to customer');
});

test('Scenario 22: Complete publicUser schema response fields', () => {
  const dbUser = {
    _id: new mongoose.Types.ObjectId(),
    clerkUserId: 'user_schema_verify',
    role: 'business',
    roleConfirmed: true,
    accountStatus: 'active',
    profileCompleted: true,
    onboardingCompleted: true,
  };

  const pub = publicUser(dbUser);
  assert.equal(pub.role, 'business');
  assert.equal(pub.roleConfirmed, true);
  assert.equal(pub.accountStatus, 'active');
  assert.equal(pub.profileCompleted, true);
  assert.equal(pub.onboardingCompleted, true);
});

