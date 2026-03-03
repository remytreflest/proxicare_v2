import { Router } from 'express';
import qrcodeRoutes from '@/interfaces/http/controllers/qrcode.controller';
import registerRoutes from '@/interfaces/http/controllers/register.controller';
import healthcareRoutes from '@/interfaces/http/controllers/healthcare.controller';
import appointmentRoutes from '@/interfaces/http/controllers/appointment.controller';
import structureRoutes from '@/interfaces/http/controllers/structure.controller';
import prescriptionRoutes from '@/interfaces/http/controllers/prescription.controller';

const router = Router();

router.use(registerRoutes);
router.use(healthcareRoutes);
router.use(appointmentRoutes);
router.use(structureRoutes);
router.use(prescriptionRoutes);
router.use(qrcodeRoutes);

export default router;
