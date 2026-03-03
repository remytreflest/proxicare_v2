import express from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GetAppointments } from '@/application/use-cases/appointment/GetAppointments.usecase';
import { CreateAppointment } from '@/application/use-cases/appointment/CreateAppointment.usecase';
import { DeleteAppointment } from '@/application/use-cases/appointment/DeleteAppointment.usecase';
import { userRepo, patientRepo, healthcareProfessionalRepo, healthcareActRepo, healthcareProfessionalActRepo, prescriptionActRepo, appointmentRepo } from '@/infrastructure/container';

const router = express.Router();

router.get('/appointments', async (req: any, res: any) => {
  try {
    const appointments = await new GetAppointments(userRepo, patientRepo, healthcareProfessionalRepo, appointmentRepo)
      .execute(req.userId);
    return res.status(200).json(appointments);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/appointment', async (req: any, res: any) => {
  try {
    const { patientId, prescriptionHealthcareActId, appointmentStartDate, appointmentEndDate } = req.body;
    if (!patientId || !prescriptionHealthcareActId || !appointmentStartDate || !appointmentEndDate) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const appointment = await new CreateAppointment(patientRepo, healthcareProfessionalRepo, healthcareActRepo, healthcareProfessionalActRepo, prescriptionActRepo, appointmentRepo)
      .execute({ userId: req.userId, patientId, prescriptionHealthcareActId, appointmentStartDate, appointmentEndDate });
    return res.status(201).json(appointment);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.delete('/appointment/:id', async (req: any, res: any) => {
  const appointmentId = parseInt(req.params.id);
  if (!appointmentId || isNaN(appointmentId)) {
    return res.status(400).json({ message: 'ID de rendez-vous invalide' });
  }
  try {
    await new DeleteAppointment(userRepo, patientRepo, healthcareProfessionalRepo, appointmentRepo)
      .execute(appointmentId, req.userId);
    return res.status(200).json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
