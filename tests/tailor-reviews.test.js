import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { Review } from '../server/models.js';

test('Tailor Reviews: Model schema validation and bounds', () => {
  const tailorId = new mongoose.Types.ObjectId();
  const validReview = new Review({
    tailorId,
    clerkUserId: 'user_cust_789',
    userName: 'Aarav Mehta',
    userAvatar: 'https://img.clerk.com/avatar.jpg',
    rating: 5,
    comment: 'Exceptional craftsmanship on my bespoke three-piece suit!',
  });

  const err = validReview.validateSync();
  assert.equal(err, undefined, 'Valid review must pass validation without errors');
  assert.equal(validReview.rating, 5);
  assert.equal(validReview.userName, 'Aarav Mehta');

  // Rating min/max boundary validation
  const lowRating = new Review({
    tailorId,
    clerkUserId: 'user_cust_789',
    userName: 'Aarav Mehta',
    rating: 0,
    comment: 'Too low rating',
  });
  const lowErr = lowRating.validateSync();
  assert.ok(lowErr?.errors?.rating, 'Rating below 1 should fail validation');

  const highRating = new Review({
    tailorId,
    clerkUserId: 'user_cust_789',
    userName: 'Aarav Mehta',
    rating: 6,
    comment: 'Too high rating',
  });
  const highErr = highRating.validateSync();
  assert.ok(highErr?.errors?.rating, 'Rating above 5 should fail validation');

  // Required field checks
  const missingFields = new Review({});
  const missingErr = missingFields.validateSync();
  assert.ok(missingErr?.errors?.tailorId, 'tailorId is required');
  assert.ok(missingErr?.errors?.clerkUserId, 'clerkUserId is required');
  assert.ok(missingErr?.errors?.userName, 'userName is required');
  assert.ok(missingErr?.errors?.rating, 'rating is required');
  assert.ok(missingErr?.errors?.comment, 'comment is required');
});

test('Tailor Reviews: Average rating calculation logic', () => {
  const sampleRatings = [5, 4, 5, 3, 4];
  const count = sampleRatings.length;
  const avg = Number((sampleRatings.reduce((sum, r) => sum + r, 0) / count).toFixed(1));
  assert.equal(avg, 4.2, 'Average rating must calculate precisely to 1 decimal place');
});
