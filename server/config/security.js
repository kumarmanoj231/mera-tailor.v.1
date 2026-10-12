const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

function originOf(value) {
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(env = process.env) {
  const configuredOrigins = [
    ...(env.CORS_ALLOWED_ORIGINS || "").split(","),
    ...(env.CLERK_AUTHORIZED_PARTIES || "").split(","),
    env.SITE_URL,
    env.RENDER_EXTERNAL_URL,
  ].filter(Boolean);

  const isProduction = env.NODE_ENV === "production" || Boolean(env.RENDER || env.RENDER_SERVICE_ID);
  const candidates = isProduction
    ? configuredOrigins
    : [...configuredOrigins, ...LOCAL_DEVELOPMENT_ORIGINS];

  return new Set(candidates.map(originOf).filter(Boolean));
}

export function isCorsOriginAllowed(origin, allowedOrigins) {
  // Non-browser clients do not send Origin and are governed by authentication and authorization.
  return !origin || allowedOrigins.has(origin);
}

export function getMissingProductionConfig(env = process.env) {
  if (env.NODE_ENV !== "production") return [];

  const missing = [];
  if (!env.MONGO_URI) missing.push("MONGO_URI");
  if (!env.CLERK_SECRET_KEY) missing.push("CLERK_SECRET_KEY");
  if (!(env.CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY)) {
    missing.push("CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY)");
  }
  return missing;
}
