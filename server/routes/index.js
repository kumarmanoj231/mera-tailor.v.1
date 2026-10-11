import { Router } from 'express';
import userRoutes from './userRoutes.js';
import tailorRoutes from './tailorRoutes.js';
import orderRoutes from './orderRoutes.js';
import measurementRoutes from './measurementRoutes.js';
import profileRoutes from './profileRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import businessRequestRoutes from './businessRequestRoutes.js';
import healthRoutes from './healthRoutes.js';
import adminRoutes from './adminRoutes.js';
import roleDashboardRoutes from './roleDashboardRoutes.js';
import voiceRoutes from './voiceRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = Router();

// Primary RESTful User Resource
router.use('/users', userRoutes);

// Webhooks
router.use(webhookRoutes);

// Core application routers
router.use(
  userRoutes,
  tailorRoutes,
  orderRoutes,
  measurementRoutes,
  profileRoutes,
  dashboardRoutes,
  businessRequestRoutes,
  adminRoutes,
  roleDashboardRoutes,
  healthRoutes,
  voiceRoutes
);

export default router;
