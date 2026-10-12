import mongoose from 'mongoose';

export function buildHealthStatus(readyState, databaseName) {
  const connected = readyState === 1;
  const databaseStatus = ["disconnected", "connected", "connecting", "disconnecting"][readyState] || "unknown";
  return {
    httpStatus: connected ? 200 : 503,
    ok: connected,
    status: connected ? "healthy" : databaseStatus,
    database: connected ? databaseName : databaseStatus,
  };
}

export function getHealth(_req, res) {
  const readyState = mongoose.connection.readyState;
  const health = buildHealthStatus(readyState, mongoose.connection.name);
  const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
  res.status(health.httpStatus).json({
    ok: health.ok,
    status: health.status,
    database: health.database,
    clerkConfigured: Boolean(process.env.CLERK_SECRET_KEY && clerkPublishableKey),
    uptime: Math.floor(process.uptime()),
  });
}
