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

const app = express();
const projectDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(projectDir, '../dist');

// Direct public health check for Render & uptime monitors (always returns 200)
app.get(['/health', '/api/health'], getHealth);

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
if (process.env.CLERK_SECRET_KEY && clerkPublishableKey) {
  app.use(clerkMiddleware({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: clerkPublishableKey }));
}
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);
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
