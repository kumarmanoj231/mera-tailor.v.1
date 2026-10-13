import { Business, BusinessRequest, Order, Tailor, User, VerificationRequest } from '../models.js';
import { deleteCustomerData } from './deleteCustomerData.js';

/** Remove data owned by the role an administrator is replacing. */
export async function deleteRoleData(clerkUserId, role) {
  if (role === 'customer') return deleteCustomerData(clerkUserId);

  if (role === 'tailor') {
    const tailors = await Tailor.find({ ownerClerkUserId: clerkUserId }).select('_id').lean();
    const tailorIds = tailors.map(tailor => tailor._id);
    await Promise.all([
      User.updateMany({ 'savedTailors.tailorId': { $in: tailorIds } }, { $pull: { savedTailors: { tailorId: { $in: tailorIds } } } }),
      Order.deleteMany({ tailorId: { $in: tailorIds } }),
      BusinessRequest.updateMany({ 'quotes.tailorId': { $in: tailorIds } }, { $pull: { quotes: { tailorId: { $in: tailorIds } } } }),
      VerificationRequest.deleteMany({ clerkUserId, targetType: 'tailor' }),
      Tailor.deleteMany({ ownerClerkUserId: clerkUserId }),
    ]);
    return;
  }

  if (role === 'business') {
    const business = await Business.findOne({ ownerClerkUserId: clerkUserId }).select('_id').lean();
    await Promise.all([
      BusinessRequest.deleteMany({ clerkUserId }),
      Order.deleteMany({ $or: [{ clerkUserId, orderType: 'bulk' }, ...(business?._id ? [{ businessId: business._id }] : [])] }),
      VerificationRequest.deleteMany({ clerkUserId, targetType: 'business' }),
      Business.deleteMany({ ownerClerkUserId: clerkUserId }),
      User.updateOne({ clerkUserId }, { $unset: { businessProfile: 1 } }),
    ]);
  }
}
