import 'dotenv/config';
import mongoose from 'mongoose';
import { Tailor } from '../server/models.js';
import { tailors } from '../server/seed.js';

if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
try {
  const indexes = await Tailor.collection.indexes().catch(() => []);
  for (const index of indexes) if (index.key?.id) await Tailor.collection.dropIndex(index.name);
  const removed = await Tailor.deleteMany({});
  const inserted = await Tailor.insertMany(tailors);
  await Tailor.createIndexes();
  console.log(`Tailors reset in ${mongoose.connection.name}: removed ${removed.deletedCount}, seeded ${inserted.length} with MongoDB ObjectIds.`);
} finally {
  await mongoose.disconnect();
}
