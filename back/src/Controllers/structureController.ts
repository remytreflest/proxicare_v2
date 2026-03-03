import express from 'express';
import { serverError } from '@/helpers/serverError';
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
    return serverError(res, error);
  }
});

export default router;