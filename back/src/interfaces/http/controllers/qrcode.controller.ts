import { Router } from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GenerateQrCode } from '@/application/use-cases/qrcode/GenerateQrCode.usecase';
import { ValidateQrCode } from '@/application/use-cases/qrcode/ValidateQrCode.usecase';
import { prescriptionActRepo, healthcareProfessionalRepo, appointmentRepo } from '@/infrastructure/container';

const router = Router();

router.get('/qrcode/patient/:prescriptionHealthcareActId/:appointmentId', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.prescriptionHealthcareActId);
    const appointmentId = parseInt(req.params.appointmentId);
    const result = await new GenerateQrCode(prescriptionActRepo).execute(id, appointmentId, req.userId);
    return res.status(201).json(result);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.get('/validate/healthcareprofessional/:prescriptionHealthcareActId/:appointmentId/:token', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.prescriptionHealthcareActId);
    const appointmentId = parseInt(req.params.appointmentId);
    const { token } = req.params;
    const result = await new ValidateQrCode(prescriptionActRepo, healthcareProfessionalRepo, appointmentRepo).execute(id, appointmentId, token, req.userId);
    return res.status(200).json(result);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
