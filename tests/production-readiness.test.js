import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllowedOrigins, getMissingProductionConfig, isCorsOriginAllowed } from '../server/config/security.js';
import { buildHealthStatus } from '../server/controllers/healthController.js';

test('CORS: production only allows configured public origins', () => {
  const origins = getAllowedOrigins({
    NODE_ENV: 'production',
    SITE_URL: 'https://meratailor.example/path',
    RENDER_EXTERNAL_URL: 'https://meratailor.onrender.com',
    CORS_ALLOWED_ORIGINS: 'https://shop.example, invalid-origin',
  });

  assert.deepEqual([...origins].sort(), [
    'https://meratailor.example',
    'https://meratailor.onrender.com',
    'https://shop.example',
  ]);
  assert.equal(isCorsOriginAllowed('https://shop.example', origins), true);
  assert.equal(isCorsOriginAllowed('https://attacker.example', origins), false);
  assert.equal(isCorsOriginAllowed(undefined, origins), true, 'non-browser clients remain governed by route authorization');
});

test('CORS: local development origins remain available outside production', () => {
  const origins = getAllowedOrigins({ NODE_ENV: 'development' });
  assert.equal(isCorsOriginAllowed('http://localhost:5174', origins), true);
  assert.equal(isCorsOriginAllowed('http://127.0.0.1:5173', origins), true);
});

test('Production startup reports missing database and Clerk configuration', () => {
  assert.deepEqual(getMissingProductionConfig({ NODE_ENV: 'development' }), []);
  assert.deepEqual(getMissingProductionConfig({ NODE_ENV: 'production' }), [
    'MONGO_URI',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY)',
  ]);
  assert.deepEqual(getMissingProductionConfig({
    NODE_ENV: 'production',
    MONGO_URI: 'mongodb://database',
    CLERK_SECRET_KEY: 'secret',
    VITE_CLERK_PUBLISHABLE_KEY: 'publishable',
  }), []);
});

test('Health check reports a failure when MongoDB is unavailable', () => {
  assert.deepEqual(buildHealthStatus(0, 'meratailor'), {
    httpStatus: 503,
    ok: false,
    status: 'disconnected',
    database: 'disconnected',
  });
  assert.deepEqual(buildHealthStatus(2, 'meratailor'), {
    httpStatus: 503,
    ok: false,
    status: 'connecting',
    database: 'connecting',
  });
  assert.deepEqual(buildHealthStatus(1, 'meratailor'), {
    httpStatus: 200,
    ok: true,
    status: 'healthy',
    database: 'meratailor',
  });
});
