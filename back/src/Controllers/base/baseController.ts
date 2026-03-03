import { Router } from 'express';
import qrcodeRoutes from '../qrcodeController';
import registerRoutes from '../registerController';
import healthcareRoutes from '../healthcareController';
import appointmentRoutes from '../appointmentController';
import structureRoutes from '../structureController';
import prescriptionRoutes from '../prescriptionController';

const router = Router();

router.use(registerRoutes);
router.use(healthcareRoutes);
router.use(appointmentRoutes);
router.use(structureRoutes);
router.use(prescriptionRoutes);
router.use(qrcodeRoutes);

export default router;