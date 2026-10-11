/**
 * Zero-dependency In-Memory Rate Limiter Middleware
 * Uses sliding window counter per client IP / identifier.
 * Cleans expired records periodically to prevent memory leaks.
 */

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Too many requests, please slow down and try again later.',
  keyGenerator = req => req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
} = {}) {
  const store = new Map();

  // Periodic garbage collection every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node process to exit cleanly if needed
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: resetSeconds,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
}

export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'API rate limit exceeded. Please wait a moment before sending more requests.',
});

export const aiApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'AI assistant request limit exceeded. Please try again in a few moments.',
});

export const orderCreationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Order creation limit reached. Please wait a moment before submitting another order.',
});
