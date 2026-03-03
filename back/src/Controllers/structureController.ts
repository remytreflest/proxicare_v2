import express from 'express';
import { Structure } from '@/models/Structure';

const router = express.Router();

/**
 * @route GET /structures
 * @desc Retourne toutes les structures médicales
 * @access Protégé
 */
router.get('/structures', async (req: any, res: any) => {
  try {
    const structures = await Structure.findAll();
    res.status(200).json(structures);
  } catch (error) {
    console.error('Erreur récupération des structures :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

export default router;