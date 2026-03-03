import express from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GetCurrentUser } from '@/application/use-cases/register/GetCurrentUser.usecase';
import { CreateUser } from '@/application/use-cases/register/CreateUser.usecase';
import { RegisterPatient } from '@/application/use-cases/register/RegisterPatient.usecase';
import { RegisterHealthcareProfessional } from '@/application/use-cases/register/RegisterHealthcareProfessional.usecase';
import { userRepo, patientRepo, healthcareProfessionalRepo } from '@/infrastructure/container';

const router = express.Router();

router.get('/user', async (req: any, res: any) => {
  try {
    const user = await new GetCurrentUser(userRepo).execute(req.userId);
    return res.status(200).json(user);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/register/user', async (req: any, res: any) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const user = await new CreateUser(userRepo).execute({ auth0Id: req.userId, firstName, lastName, email });
    return res.status(201).json(user);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/register/patient', async (req: any, res: any) => {
  try {
    const { birthday, gender, address, socialSecurityNumber, structureId } = req.body;
    if (!birthday || !gender || !address || !socialSecurityNumber || isNaN(structureId) || structureId <= 0) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const patient = await new RegisterPatient(userRepo, patientRepo).execute({
      userId: req.userId, birthday, gender, address, socialSecurityNumber, structureId,
    });
    return res.status(201).json({ message: 'Patient enregistré avec succès.', patient });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/register/healthcareprofessional', async (req: any, res: any) => {
  try {
    const { speciality, structureId, idn } = req.body;
    if (!speciality || structureId <= 0 || !idn) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const professional = await new RegisterHealthcareProfessional(userRepo, healthcareProfessionalRepo).execute({
      userId: req.userId, speciality, structureId, idn,
    });
    return res.status(201).json({ message: 'Professionnel de soins enregistré avec succès.', patient: professional });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
