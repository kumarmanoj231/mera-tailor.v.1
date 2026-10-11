import { Router } from 'express';
import {
  createMeasurement,
  deleteMeasurement,
  getMeasurement,
  listMeasurements,
  updateMeasurement,
} from '../controllers/measurementController.js';
import { requireAuth, requireRole, syncAppUser } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.use('/measurements', requireAuth, syncAppUser, requireRole('customer', 'admin'));
router.get('/measurements', listMeasurements);
router.post('/measurements', createMeasurement);
router.get('/measurements/:id', validateObjectId('id'), getMeasurement);
router.put('/measurements/:id', validateObjectId('id'), updateMeasurement);
router.patch('/measurements/:id', validateObjectId('id'), updateMeasurement);
router.delete('/measurements/:id', validateObjectId('id'), deleteMeasurement);

export default router;
