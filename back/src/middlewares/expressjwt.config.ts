import dotenv from 'dotenv';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

dotenv.config();

const checkJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.EXPRESSJWT_SECRET_JWKSURI || '',
    }),
    audience: process.env.EXPRESSJWT_SECRET_AUDIENCE || '',
    issuer: process.env.EXPRESSJWT_SECRET_ISSUER || '',
    algorithms: ['RS256'],
  });

export default checkJwt;