import mongoose from 'mongoose';

export function getHealth(_req, res) {
  const connected = mongoose.connection.readyState === 1;
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  res.status(connected ? 200 : 503).json({ ok: connected, database: connected ? mongoose.connection.name : 'disconnected', clerkConfigured: Boolean(process.env.CLERK_SECRET_KEY && clerkPublishableKey) });
}
