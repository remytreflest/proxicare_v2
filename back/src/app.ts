import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from '@/Controllers/base/baseController';
import checkJwt from '@/middlewares/expressjwt.config';
import extractUserId from '@/middlewares/extractUserId';
import { swaggerSpec } from '@/config/swagger';

dotenv.config();

const app = express();
const AUTH_TOKEN_CHECK = checkJwt;

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.API_CORS ?? [''];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-UserId'],
}));

// ========================
// Documentation Swagger
// ========================
// Accessible sans authentification à /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Proxicare API Documentation',
}));

// Endpoint pour récupérer le JSON OpenAPI
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========================
// Routes publiques
// ========================
app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

// ========================
// Middlewares de sécurité
// ========================
// Permet l'accès à l'API uniquement si un token personnalisé x-userid est présent
app.use(extractUserId);
// Permet l'accès à l'API uniquement si un token d'authentification est présent
// Exception faite des routes déclarées dans le unless
// app.use(AUTH_TOKEN_CHECK);

// ========================
// Routes API
// ========================
app.use('/api', routes);

export default app;
