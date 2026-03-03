import express from 'express';
import routes from '@/Controllers/base/baseController';
import checkJwt from '@/middlewares/expressjwt.config';
import extractUserId from '@/middlewares/extractUserId';

const app = express();
const AUTH_TOKEN_CHECK = checkJwt;
app.use(express.json());

// N'ajoute pas de CORS OU utilise un cors permissif
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// SECURITE : Permet l'accès à l'API uniquement si un token personnalisé x-userid est présent
app.use(extractUserId);
// SECURITE : Permet l'accès à l'API uniquement si un token d'authentification est présent
// Exception faite des routes déclarées dans le unless
app.use(AUTH_TOKEN_CHECK);

app.use('/api', routes);

export default app;
