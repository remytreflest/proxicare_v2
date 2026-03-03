import express from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { CreatePrescription } from '@/application/use-cases/prescription/CreatePrescription.usecase';
import { GetPatientPrescriptions } from '@/application/use-cases/prescription/GetPatientPrescriptions.usecase';
import { GetProfessionalPrescriptions } from '@/application/use-cases/prescription/GetProfessionalPrescriptions.usecase';
import { userRepo, patientRepo, healthcareProfessionalRepo, healthcareActRepo, prescriptionRepo, prescriptionActRepo } from '@/infrastructure/container';

const router = express.Router();

router.post('/prescriptions', async (req: any, res: any) => {
  try {
    const { socialSecurityNumber, healthcareProfessionalId, startDate, endDate, acts } = req.body;
    if (!socialSecurityNumber || !healthcareProfessionalId || !startDate || !endDate || !Array.isArray(acts)) {
      return res.status(400).json({ message: 'Champs requis manquants ou invalides.' });
    }
    await new CreatePrescription(userRepo, patientRepo, healthcareProfessionalRepo, healthcareActRepo, prescriptionRepo, prescriptionActRepo)
      .execute({ userId: req.userId, socialSecurityNumber, healthcareProfessionalId, startDate, endDate, acts });
    return res.status(201).json({ message: 'Prescription enregistrée avec succès.' });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.get('/prescriptions/patient', async (req: any, res: any) => {
  if (!req.userId) return res.status(400).json({ message: 'Utilisateur non authentifié.' });
  try {
    const prescriptions = await new GetPatientPrescriptions(patientRepo, prescriptionRepo).execute(req.userId);
    return res.status(200).json(prescriptions);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.get('/prescriptions/healthcareprofessional', async (req: any, res: any) => {
  if (!req.userId) return res.status(400).json({ message: 'Utilisateur non authentifié' });
  try {
    const prescriptions = await new GetProfessionalPrescriptions(healthcareProfessionalRepo, prescriptionRepo).execute(req.userId);
    return res.status(200).json(prescriptions);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
