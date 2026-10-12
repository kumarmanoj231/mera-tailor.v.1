import mongoose from 'mongoose';
import { Tailor, User, Order, Measurement, BusinessRequest, VerificationRequest } from '../models.js';

export async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGO_URI is required.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  
  // Initialize indexes for collections without auto-seeding dummy/random data
  await Promise.all([
    Tailor.createIndexes().catch(() => {}),
    User.createIndexes().catch(() => {}),
    Order.createIndexes().catch(() => {}),
    Measurement.createIndexes().catch(() => {}),
    BusinessRequest.createIndexes().catch(() => {}),
    VerificationRequest.createIndexes().catch(() => {}),
  ]);

  console.log(`MongoDB connected (${mongoose.connection.name})`);
  return true;
}
