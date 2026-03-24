import { NextFunction } from 'express';
import { unless } from 'express-unless';

const extractUserId = (req: any, res: any, next: NextFunction) => {
  const userIdHeader = req.header('X-Userid');
  if (!userIdHeader) {
    return res.status(400).json({ message: 'X-Userid Aucun utilisateur renseigné.' });
  }

  req.userId = userIdHeader;
  next();
}

extractUserId.unless = unless;

export default extractUserId;