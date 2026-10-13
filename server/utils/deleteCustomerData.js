import { BusinessRequest, Measurement, Order, Review } from '../models.js';

/** Remove customer-owned work while retaining reviews as anonymous feedback. */
export async function deleteCustomerData(clerkUserId) {
  await Promise.all([
    Measurement.deleteMany({ clerkUserId }),
    BusinessRequest.deleteMany({ clerkUserId }),
    Order.deleteMany({ clerkUserId }),
    Review.updateMany(
      { clerkUserId },
      { $set: { userName: 'Unknown', userAvatar: '' } },
    ),
  ]);
}
