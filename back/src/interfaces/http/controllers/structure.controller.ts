import express from 'express';
import { serverError } from '@/shared/helpers/server-error.helper';
import { GetStructures } from '@/application/use-cases/structure/GetStructures.usecase';
import { structureRepo } from '@/infrastructure/container';

const router = express.Router();

router.get('/structures', async (req: any, res: any) => {
  try {
    const structures = await new GetStructures(structureRepo).execute();
    return res.status(200).json(structures);
  } catch (error) {
    return serverError(res, error);
  }
});

export default router;
