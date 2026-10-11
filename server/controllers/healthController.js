import mongoose from 'mongoose';

export function getHealth(_req, res) {
  const connected = mongoose.connection.readyState === 1;
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  res.status(200).json({
    ok: true,
    status: connected ? 'healthy' : 'connecting',
    database: connected ? mongoose.connection.name : 'connecting',
    clerkConfigured: Boolean(process.env.CLERK_SECRET_KEY && clerkPublishableKey),
    uptime: Math.floor(process.uptime()),
  });
}
