import express from 'express';
import HealthcareProfessionalHealthcareAct from '@/models/HealthcareProfessionalHealthcareAct';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import HealthcareAct from '@/models/HealthcareAct';

const router = express.Router();

/**
 * Associe un professionnel de santé à un acte de soin
 * @route POST /healthcare/act/healthcareprofessional
 * @body { 
 *  HealthcareProfessionalId, 
 *  HealthcareActId 
 * }
 */
router.post('/healthcare/act/healthcareprofessional', async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { healthcareActId } = req.body;

    if (!userId || !healthcareActId) {
      return res.status(400).json({ message: 'L\'utilisateur et l\'ID de l\'acte sont requis.' });
    }

    const healthcareprofessional = await HealthcareProfessional.findOne({ where: { UserId: userId } });
    if (!healthcareprofessional) {
      return res.status(404).json({ message: 'Le professionnel de soins est introuvable.' });
    }

    const act = await HealthcareAct.findOne({ where: { Id: healthcareActId } });
    if (!act) {
      return res.status(404).json({ message: 'Acte de soin introuvable.' });
    }

    await HealthcareProfessionalHealthcareAct.create({
      HealthcareProfessionalId: healthcareprofessional.Id,
      HealthcareActId: healthcareActId,
    });

    return res.status(201).json({ message: 'Association créée avec succès.' });
  } catch (error) {
    console.error('Erreur association acte/soignant :', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route DELETE /healthcare/act/healthcareprofessional/:actId
 * @desc Supprime le lien entre un professionnel et un acte
 * @access Protégé
 */
router.delete('/healthcare/act/healthcareprofessional/:actId', async (req: any, res: any) => {
  const userId = req.userId;
  const actId = parseInt(req.params.actId);

  if (isNaN(actId)) {
    return res.status(400).json({ message: 'Paramètres invalides' });
  }

  try {
    const healthcareprofessional = await HealthcareProfessional.findOne({ where: { UserId: userId } });

    if (!healthcareprofessional) {
      return res.status(404).json({ message: 'Professionnel non trouvé.' });
    }

    const deleted = await HealthcareProfessionalHealthcareAct.destroy({
      where: {
        HealthcareProfessionalId: healthcareprofessional.Id,
        HealthcareActId: actId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Acte introuvable ou déjà supprimé.' });
    }

    return res.status(200).json({ message: 'Acte supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur suppression acte soignant :', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/**
 * @route POST /healthcare/act
 * @description Crée un nouvel acte de soin
 * @access Public
 * 
 * @body
 * - Name: string (requis) — nom unique de l'acte
 * - Description: string (requis)
 * - Price: number (requis) — tarif de l’acte
 * 
 * @returns
 * - 201 : Acte créé avec succès
 * - 400 : Champs requis manquants ou invalides
 * - 409 : Un acte avec ce nom existe déjà
 * - 500 : Erreur interne du serveur
 */
router.post('/healthcare/act', async (req: any, res: any) => {
  const { name, description, price } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Le champ "Name" est requis et doit être une chaîne non vide.' });
  }

  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Le champ "Price" est requis et doit être un nombre positif.' });
  }

  try {
    const existing = await HealthcareAct.findOne({ where: { Name: name } });
    if (existing) {
      return res.status(409).json({ message: 'Un acte avec ce nom existe déjà.' });
    }

    const newAct = await HealthcareAct.create({
      Name: name.trim(),
      Description: description?.trim() || null,
      Price: price,
    });

    return res.status(201).json({
      message: 'Acte de soin créé avec succès.',
      act: newAct,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/**
 * @route GET /healthcare/acts
 * @description Récupère tous les actes de soins disponibles
 * @access Protégé
 * 
 * @returns
 * - 200 : Liste des actes de soins
 * - 500 : Erreur serveur
 */
router.get('/healthcare/acts', async (req: any, res: any) => {
  try {
    const acts = await HealthcareAct.findAll();
    return res.status(200).json(acts);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des actes de soins' });
  }
});

/**
 * @route GET /healthcare/acts/user
 * @desc Retourne les actes de soin associés à un professionnel
 * @access Protégé
 */
router.get('/healthcare/acts/user', async (req: any, res: any) => {

  const userId = req.userId;

  try {
    const healthcareprofessional = await HealthcareProfessional.findOne({
      where: { UserId: userId },
      include: [HealthcareAct]
    });

    if (!healthcareprofessional) {
      return res.status(404).json({ message: 'Professionnel non trouvé.' });
    }

    return res.status(200).json(healthcareprofessional.HealthcareActs);
  } catch (error) {
    console.error('Erreur récupération actes utilisateur :', error);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
