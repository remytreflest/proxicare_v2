import { Router } from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GenerateQrCode } from '@/application/use-cases/qrcode/GenerateQrCode.usecase';
import { ValidateQrCode } from '@/application/use-cases/qrcode/ValidateQrCode.usecase';
import { prescriptionActRepo, healthcareProfessionalRepo } from '@/infrastructure/container';

const router = Router();

router.get('/qrcode/patient/:prescriptionHealthcareActId', async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.prescriptionHealthcareActId);
    const result = await new GenerateQrCode(prescriptionActRepo).execute(id, req.userId);
    return res.status(201).json(result);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.get('/validate/healthcareprofessional/:prescriptionHealthcareActId/:token', async (req: any, res: any) => {
  try {
    console.log(req.params);
    const id = parseInt(req.params.prescriptionHealthcareActId);
    const { token } = req.params;
    const result = await new ValidateQrCode(prescriptionActRepo, healthcareProfessionalRepo).execute(id, token, req.userId);
    return res.status(200).json(result);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
