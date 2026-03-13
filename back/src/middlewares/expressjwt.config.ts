import dotenv from 'dotenv';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

dotenv.config();

const checkJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: process.env.JWKS_URI || '',
    }),
    audience: process.env.AUTH0_AUDIENCE || '',
    issuer: process.env.ISSUER || '',
    algorithms: ['RS256'],
  });
  
export default checkJwt;