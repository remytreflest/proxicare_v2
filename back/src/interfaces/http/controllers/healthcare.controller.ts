import express from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GetAllHealthcareActs } from '@/application/use-cases/healthcare/GetAllHealthcareActs.usecase';
import { CreateHealthcareAct } from '@/application/use-cases/healthcare/CreateHealthcareAct.usecase';
import { AssociateActToProfessional } from '@/application/use-cases/healthcare/AssociateActToProfessional.usecase';
import { RemoveActFromProfessional } from '@/application/use-cases/healthcare/RemoveActFromProfessional.usecase';
import { GetProfessionalActs } from '@/application/use-cases/healthcare/GetProfessionalActs.usecase';
import { GetProfessionalsWithActs } from '@/application/use-cases/healthcare/GetProfessionalsWithActs.usecase';
import {
  healthcareActRepo,
  healthcareProfessionalRepo,
  healthcareProfessionalActRepo,
} from '@/infrastructure/container';

const router = express.Router();

router.get('/healthcare/professionals', async (req: any, res: any) => {
  try {
    const result = await new GetProfessionalsWithActs(healthcareProfessionalRepo).execute();
    return res.status(200).json(result);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.get('/healthcare/acts', async (req: any, res: any) => {
  try {
    const acts = await new GetAllHealthcareActs(healthcareActRepo).execute();
    return res.status(200).json(acts);
  } catch (e: any) {
    return serverError(res, e);
  }
});

router.get('/healthcare/acts/user', async (req: any, res: any) => {
  try {
    const acts = await new GetProfessionalActs(healthcareProfessionalRepo).execute(req.userId);
    return res.status(200).json(acts);
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/healthcare/act', async (req: any, res: any) => {
  const { name, description, price } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Le champ "Name" est requis et doit être une chaîne non vide.' });
  }
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Le champ "Price" est requis et doit être un nombre positif.' });
  }
  try {
    const act = await new CreateHealthcareAct(healthcareActRepo).execute({ name, description, price });
    return res.status(201).json({ message: 'Acte de soin créé avec succès.', act });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.post('/healthcare/act/healthcareprofessional', async (req: any, res: any) => {
  const { healthcareActId } = req.body;
  if (!req.userId || !healthcareActId) {
    return res.status(400).json({ message: "L'utilisateur et l'ID de l'acte sont requis." });
  }
  try {
    await new AssociateActToProfessional(healthcareProfessionalRepo, healthcareActRepo, healthcareProfessionalActRepo)
      .execute(req.userId, healthcareActId);
    return res.status(201).json({ message: 'Association créée avec succès.' });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

router.delete('/healthcare/act/healthcareprofessional/:actId', async (req: any, res: any) => {
  const actId = parseInt(req.params.actId);
  if (isNaN(actId)) return res.status(400).json({ message: 'Paramètres invalides' });
  try {
    await new RemoveActFromProfessional(healthcareProfessionalRepo, healthcareProfessionalActRepo)
      .execute(req.userId, actId);
    return res.status(200).json({ message: 'Acte supprimé avec succès.' });
  } catch (e: any) {
    if (e.status) return res.status(e.status).json({ message: e.message });
    return serverError(res, e);
  }
});

export default router;
