import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes/index.js';
import { connectDatabase } from './config/database.js';
import { getHealth } from './controllers/healthController.js';
import { globalApiLimiter } from './middleware/rateLimiter.js';
import { getAllowedOrigins, getMissingProductionConfig, isCorsOriginAllowed } from './config/security.js';

const app = express();
const projectDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(projectDir, '../dist');

const missingProductionConfig = getMissingProductionConfig();
if (missingProductionConfig.length) {
  throw new Error(`Production startup blocked. Configure: ${missingProductionConfig.join(', ')}.`);
}

// Render terminates TLS at one trusted reverse proxy. Preserve visitor IPs for
// rate limiting and secure-request handling without trusting arbitrary proxy hops.
if (process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.RENDER_SERVICE_ID) {
  app.set('trust proxy', 1);
}

function getPublicSiteUrl(req) {
  const configuredUrl = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall through to the current request origin when deployment config is invalid.
    }
  }

  return `${req.protocol}://${req.get('host')}`;
}

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]);
}

function getClerkAuthorizedParties() {
  const urls = [
    ...(process.env.CLERK_AUTHORIZED_PARTIES || '').split(','),
    process.env.SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
  ].filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    urls.push(
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    );
  }

  return [...new Set(urls.flatMap((value) => {
    try {
      return [new URL(value.trim()).origin];
    } catch {
      return [];
    }
  }))];
}

// Defensive HTTP Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(self)');
  next();
});

// Direct public health check for Render & uptime monitors.
app.get(['/health', '/api/health'], getHealth);

// Keep public crawl discovery aligned with the active deployment domain.
app.get('/robots.txt', (req, res) => {
  const siteUrl = escapeXml(getPublicSiteUrl(req));
  res.type('text/plain').send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n'));
});

app.get('/sitemap.xml', (req, res) => {
  const siteUrl = escapeXml(getPublicSiteUrl(req));
  const publicPaths = ['/', '/find-tailors', '/how-it-works', '/contact', '/terms', '/privacy'];
  const urls = publicPaths
    .map((pathname) => `  <url><loc>${siteUrl}${pathname}</loc></url>`)
    .join('\n');

  res.type('application/xml').send([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n'));
});

app.use((req, res, next) => {
  if (/^\/(admin|dashboard|orders|my-orders|my-tailors|bulk|onboarding)(\/|$)/.test(req.path)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
if (process.env.CLERK_SECRET_KEY && clerkPublishableKey) {
  const authorizedParties = getClerkAuthorizedParties();
  app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: clerkPublishableKey,
    clockSkewInMs: 15_000,
    ...(authorizedParties.length ? { authorizedParties } : {}),
  }));
}

const allowedCorsOrigins = getAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => callback(null, isCorsOriginAllowed(origin, allowedCorsOrigins)),
  maxAge: 600,
}));

// Parse JSON while preserving raw body for crypto webhook signature verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf?.toString('utf8');
    },
  })
);

// Apply rate limiter to all /api endpoints
app.use('/api', globalApiLimiter, apiRoutes);
app.all('/api/*', (_req, res) => res.status(404).json({ error: 'API route not found' }));

if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.resolve(distDir, 'index.html')));
}

// Render requires binding to 0.0.0.0 and expects port 10000
const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
let port = process.env.PORT ? parseInt(process.env.PORT, 10) : (isRender ? 10000 : 5000);
if (isRender && port === 5000) {
  console.log('Notice: Detected Render with PORT=5000. Setting port to 10000 for Render proxy.');
  port = 10000;
}

connectDatabase(process.env.MONGO_URI).then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`MeraTailor API listening on 0.0.0.0:${port}`));
}).catch(error => {
  console.error(`Startup blocked: ${error.message}`);
  process.exitCode = 1;
});
