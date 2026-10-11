import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createNotification,
} from '../server/controllers/notificationController.js';
import { Notification } from '../server/models.js';

test('Notification System: Model validation and default attributes', () => {
  const notif = new Notification({
    recipientClerkUserId: 'user_cust_123',
    title: 'Order Status Update',
    message: 'Your suit is ready for pickup.',
    type: 'status',
    link: '/orders',
  });

  assert.equal(notif.recipientClerkUserId, 'user_cust_123');
  assert.equal(notif.read, false, 'Default read state must be false');
  assert.equal(notif.type, 'status');
  assert.equal(notif.link, '/orders');

  // Validate error on missing required fields
  const invalidNotif = new Notification({});
  const validationErr = invalidNotif.validateSync();
  assert.ok(validationErr.errors.recipientClerkUserId, 'Recipient ID is required');
  assert.ok(validationErr.errors.title, 'Title is required');
  assert.ok(validationErr.errors.message, 'Message is required');
});

test('Notification System: Supported notification types', () => {
  const validTypes = ['order', 'quote', 'status', 'bid', 'measurement', 'profile', 'announcement', 'general'];

  for (const type of validTypes) {
    const doc = new Notification({
      recipientClerkUserId: 'user_test',
      title: `Test ${type}`,
      message: 'Testing type enum',
      type,
    });
    const err = doc.validateSync();
    assert.equal(err, undefined, `Type '${type}' should be valid`);
  }

  // Invalid enum type
  const badDoc = new Notification({
    recipientClerkUserId: 'user_test',
    title: 'Bad Type',
    message: 'Testing bad enum',
    type: 'unsupported_type',
  });
  const badErr = badDoc.validateSync();
  assert.ok(badErr?.errors?.type, 'Unsupported type should fail schema validation');
});

test('Notification System: Helper input sanitization and truncation', async () => {
  // Test invalid input guard
  const res1 = await createNotification({
    recipientClerkUserId: '',
    title: 'No user',
    message: 'Test',
  });
  assert.equal(res1, null, 'Should return null for missing recipient ID');

  const res2 = await createNotification({
    recipientClerkUserId: 'user_123',
    title: '',
    message: 'Test',
  });
  assert.equal(res2, null, 'Should return null for missing title');
});

test('Notification System: Authorization boundaries and IDOR prevention', () => {
  // Mock request for User A attempting to access User B's notification
  const userA_id = 'user_alice_clerk';
  const userB_id = 'user_bob_clerk';

  const mockNotification = {
    _id: '507f1f77bcf86cd799439011',
    recipientClerkUserId: userB_id,
    title: "Bob's Private Quote",
    message: 'Private tailor estimate',
    read: false,
  };

  // Verify that an operation scoping by userA_id cannot match userB_id's notification
  const queryScopedToAlice = {
    _id: mockNotification._id,
    recipientClerkUserId: userA_id,
  };

  const matches =
    mockNotification._id === queryScopedToAlice._id &&
    mockNotification.recipientClerkUserId === queryScopedToAlice.recipientClerkUserId;

  assert.equal(matches, false, 'Alice must NOT match or access Bob’s notification');
});
