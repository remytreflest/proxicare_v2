import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Proxicare API',
    version: '1.0.0',
    description: `
API REST pour la gestion des soins médicaux à domicile.

## Fonctionnalités principales
- Gestion des utilisateurs (patients et professionnels de santé)
- Gestion des prescriptions médicales
- Gestion des rendez-vous
- Validation des soins par QR Code
- Gestion des actes de soins

## Authentification
L'API utilise JWT (JSON Web Token) pour l'authentification.
Le header \`X-Userid\` doit être présent dans chaque requête.
    `,
    contact: {
      name: 'Proxicare Support',
      email: 'support@proxicare.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Serveur de développement',
    },
    {
      url: 'https://api.proxicare.com',
      description: 'Serveur de production',
    },
  ],
  tags: [
    { name: 'Utilisateurs', description: 'Gestion des utilisateurs, patients et professionnels' },
    { name: 'Actes de soins', description: 'Gestion des actes de soins' },
    { name: 'Rendez-vous', description: 'Gestion des rendez-vous' },
    { name: 'Prescriptions', description: 'Gestion des prescriptions médicales' },
    { name: 'QR Code', description: 'Validation des soins par QR Code' },
    { name: 'Structures', description: 'Gestion des structures médicales' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      userIdHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Userid',
        description: "ID de l'utilisateur connecté",
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'auth0|123456' },
          firstName: { type: 'string', example: 'Jean' },
          lastName: { type: 'string', example: 'Dupont' },
          email: { type: 'string', format: 'email', example: 'jean.dupont@email.com' },
          roles: { type: 'string', example: 'USER,PATIENT' },
        },
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'string', example: 'auth0|123456' },
          birthday: { type: 'string', format: 'date', example: '1990-01-15' },
          gender: { type: 'string', enum: ['M', 'F'], example: 'M' },
          address: { type: 'string', example: '123 Rue de la Santé, 75014 Paris' },
          socialSecurityNumber: { type: 'string', example: '1900175123456789' },
          structureId: { type: 'integer', example: 1 },
        },
      },
      HealthcareProfessional: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'string', example: 'auth0|789012' },
          speciality: { type: 'string', enum: ['NURSE'], example: 'NURSE' },
          idn: { type: 'string', example: '123456789', description: 'Numéro ADELI/RPPS' },
        },
      },
      HealthcareAct: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Injection sous-cutanée' },
          description: { type: 'string', example: 'Injection de médicament par voie sous-cutanée' },
          price: { type: 'number', format: 'float', example: 4.5 },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          patientId: { type: 'integer', example: 1 },
          healthcareProfessionalId: { type: 'integer', example: 1 },
          prescriptionHealthcareActId: { type: 'integer', example: 1 },
          appointmentStartDate: { type: 'string', format: 'date-time' },
          appointmentEndDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['PLANNED', 'PERFORMED', 'CANCELLED'], example: 'PLANNED' },
        },
      },
      Prescription: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          socialSecurityNumber: { type: 'string', example: '1900175123456789' },
          startDate: { type: 'string', format: 'date', example: '2026-04-06' },
          endDate: { type: 'string', format: 'date', example: '2026-10-06' },
        },
      },
      Structure: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Cabinet Infirmier Paris 14' },
          address: { type: 'string', example: '45 Avenue du Maine, 75014 Paris' },
          phone: { type: 'string', example: '01 23 45 67 89' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Ressource non trouvée' },
        },
      },
    },
  },
  security: [{ bearerAuth: [], userIdHeader: [] }],
  paths: {
    // ==================== UTILISATEURS ====================
    '/api/user': {
      get: {
        tags: ['Utilisateurs'],
        summary: "Récupérer l'utilisateur courant",
        description: "Retourne les informations de l'utilisateur connecté avec ses relations",
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Utilisateur trouvé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: {
            description: 'Utilisateur non trouvé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/register/user': {
      post: {
        tags: ['Utilisateurs'],
        summary: 'Créer un nouvel utilisateur',
        description: 'Enregistre un nouvel utilisateur dans le système',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email'],
                properties: {
                  firstName: { type: 'string', example: 'Jean' },
                  lastName: { type: 'string', example: 'Dupont' },
                  email: { type: 'string', format: 'email', example: 'jean.dupont@email.com' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Utilisateur créé avec succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: { description: 'Champs requis manquants' },
          409: { description: 'Utilisateur déjà existant (ID ou email)' },
        },
      },
    },
    '/api/register/patient': {
      post: {
        tags: ['Utilisateurs'],
        summary: 'Enregistrer un patient',
        description: "Enregistre l'utilisateur courant en tant que patient",
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['birthday', 'gender', 'address', 'socialSecurityNumber', 'structureId'],
                properties: {
                  birthday: { type: 'string', format: 'date', example: '1990-01-15' },
                  gender: { type: 'string', enum: ['M', 'F'], example: 'M' },
                  address: { type: 'string', example: '123 Rue de la Santé, 75014 Paris' },
                  socialSecurityNumber: { type: 'string', example: '190017512345678' },
                  structureId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Patient enregistré avec succès' },
          400: { description: 'Champs requis manquants' },
          404: { description: 'Utilisateur non trouvé' },
          409: { description: 'Patient déjà existant ou numéro de sécurité sociale déjà utilisé' },
        },
      },
    },
    '/api/register/healthcareprofessional': {
      post: {
        tags: ['Utilisateurs'],
        summary: 'Enregistrer un professionnel de santé',
        description: "Enregistre l'utilisateur courant en tant que professionnel de santé",
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['speciality', 'structureId', 'idn'],
                properties: {
                  speciality: { type: 'string', enum: ['NURSE'], example: 'NURSE' },
                  structureId: { type: 'integer', example: 1 },
                  idn: { type: 'string', example: '123456789', description: 'Numéro ADELI ou RPPS' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Professionnel enregistré avec succès' },
          400: { description: 'Champs requis manquants ou spécialité invalide' },
          404: { description: 'Utilisateur non trouvé' },
          409: { description: 'Professionnel déjà existant' },
        },
      },
    },

    // ==================== ACTES DE SOINS ====================
    '/api/healthcare/acts': {
      get: {
        tags: ['Actes de soins'],
        summary: 'Liste tous les actes de soins',
        description: 'Retourne la liste de tous les actes de soins disponibles',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des actes de soins',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/HealthcareAct' },
                },
              },
            },
          },
        },
      },
    },
    '/api/healthcare/acts/user': {
      get: {
        tags: ['Actes de soins'],
        summary: 'Actes du professionnel connecté',
        description: 'Retourne les actes de soins associés au professionnel de santé connecté',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des actes du professionnel',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/HealthcareAct' },
                },
              },
            },
          },
          404: { description: 'Professionnel non trouvé' },
        },
      },
    },
    '/api/healthcare/act': {
      post: {
        tags: ['Actes de soins'],
        summary: 'Créer un acte de soin',
        description: 'Crée un nouvel acte de soin dans le système',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', example: 'Injection intraveineuse' },
                  description: { type: 'string', example: 'Administration de médicament par voie intraveineuse' },
                  price: { type: 'number', format: 'float', example: 6.3 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Acte créé avec succès' },
          400: { description: 'Champs requis manquants' },
          409: { description: 'Acte avec ce nom déjà existant' },
        },
      },
    },
    '/api/healthcare/act/healthcareprofessional': {
      post: {
        tags: ['Actes de soins'],
        summary: 'Associer un acte au professionnel',
        description: 'Associe un acte de soin au professionnel de santé connecté',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['healthcareActId'],
                properties: {
                  healthcareActId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Association créée avec succès' },
          400: { description: 'Paramètres manquants' },
          404: { description: 'Professionnel ou acte non trouvé' },
        },
      },
    },
    '/api/healthcare/act/healthcareprofessional/{actId}': {
      delete: {
        tags: ['Actes de soins'],
        summary: 'Dissocier un acte du professionnel',
        description: "Supprime l'association entre un acte de soin et le professionnel connecté",
        security: [{ bearerAuth: [], userIdHeader: [] }],
        parameters: [
          {
            name: 'actId',
            in: 'path',
            required: true,
            description: "ID de l'acte à dissocier",
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Association supprimée avec succès' },
          400: { description: 'ID invalide' },
          404: { description: 'Association non trouvée' },
        },
      },
    },

    // ==================== RENDEZ-VOUS ====================
    '/api/appointments': {
      get: {
        tags: ['Rendez-vous'],
        summary: 'Liste des rendez-vous',
        description: "Retourne tous les rendez-vous de l'utilisateur connecté (patient ou professionnel)",
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des rendez-vous',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Appointment' },
                },
              },
            },
          },
          403: { description: 'Utilisateur non autorisé (ni patient, ni professionnel)' },
        },
      },
    },
    '/api/appointment': {
      post: {
        tags: ['Rendez-vous'],
        summary: 'Créer un rendez-vous',
        description: 'Crée un nouveau rendez-vous entre un patient et le professionnel de santé connecté',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patientId', 'prescriptionHealthcareActId', 'appointmentStartDate', 'appointmentEndDate'],
                properties: {
                  patientId: { type: 'integer', example: 1 },
                  prescriptionHealthcareActId: { type: 'integer', example: 1 },
                  appointmentStartDate: { type: 'string', format: 'date-time', example: '2026-04-07T09:00:00Z' },
                  appointmentEndDate: { type: 'string', format: 'date-time', example: '2026-04-07T09:30:00Z' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Rendez-vous créé avec succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Appointment' },
              },
            },
          },
          400: { description: 'Erreur de validation' },
          403: { description: 'Professionnel non habilité pour cet acte' },
          404: { description: 'Patient ou acte prescrit non trouvé' },
        },
      },
    },
    '/api/appointment/{id}': {
      delete: {
        tags: ['Rendez-vous'],
        summary: 'Supprimer un rendez-vous',
        description: 'Supprime un rendez-vous existant',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID du rendez-vous à supprimer',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Rendez-vous supprimé avec succès' },
          400: { description: 'ID invalide' },
          403: { description: 'Non autorisé à supprimer ce rendez-vous' },
          404: { description: 'Rendez-vous non trouvé' },
        },
      },
    },

    // ==================== PRESCRIPTIONS ====================
    '/api/prescriptions': {
      post: {
        tags: ['Prescriptions'],
        summary: 'Créer une prescription',
        description: 'Crée une nouvelle prescription pour un patient',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['socialSecurityNumber', 'startDate', 'endDate', 'acts'],
                properties: {
                  socialSecurityNumber: { type: 'string', example: '190017512345678' },
                  startDate: { type: 'string', format: 'date', example: '2026-04-06' },
                  endDate: { type: 'string', format: 'date', example: '2026-10-06' },
                  acts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'occurrencesPerDay'],
                      properties: {
                        id: { type: 'integer', example: 1 },
                        occurrencesPerDay: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Prescription créée avec succès' },
          400: { description: 'Champs requis manquants ou invalides' },
          404: { description: 'Patient ou acte de soin non trouvé' },
        },
      },
    },
    '/api/prescriptions/patient': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Prescriptions du patient',
        description: 'Retourne toutes les prescriptions du patient connecté',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des prescriptions du patient',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Prescription' },
                },
              },
            },
          },
          404: { description: 'Patient non trouvé' },
        },
      },
    },
    '/api/prescriptions/healthcareprofessional': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Prescriptions pour le professionnel',
        description: 'Retourne les prescriptions des patients associés aux structures du professionnel connecté',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des prescriptions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Prescription' },
                },
              },
            },
          },
          404: { description: 'Professionnel non trouvé' },
        },
      },
    },

    // ==================== QR CODE ====================
    '/api/qrcode/patient/{prescriptionHealthcareActId}': {
      get: {
        tags: ['QR Code'],
        summary: 'Générer un QR Code',
        description: 'Génère un QR Code pour valider un soin prescrit (token valide 15 secondes)',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        parameters: [
          {
            name: 'prescriptionHealthcareActId',
            in: 'path',
            required: true,
            description: "ID de l'acte prescrit à valider",
            schema: { type: 'integer' },
          },
        ],
        responses: {
          201: {
            description: 'QR Code généré avec succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    qrCodeDataUrl: { type: 'string', description: 'Image du QR Code en base64' },
                    token: { type: 'string', description: 'Token de validation (UUID)' },
                    expiresAt: { type: 'string', format: 'date-time', description: "Date d'expiration" },
                  },
                },
              },
            },
          },
          400: { description: 'Acte déjà réalisé ou aucun rendez-vous actif' },
          403: { description: "L'utilisateur n'est pas le patient concerné" },
          404: { description: 'Acte prescrit non trouvé' },
        },
      },
    },
    '/api/validate/healthcareprofessional/{prescriptionHealthcareActId}/{token}': {
      get: {
        tags: ['QR Code'],
        summary: 'Valider un soin via QR Code',
        description: 'Valide la réalisation d\'un soin via le token du QR Code',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        parameters: [
          {
            name: 'prescriptionHealthcareActId',
            in: 'path',
            required: true,
            description: "ID de l'acte prescrit",
            schema: { type: 'integer' },
          },
          {
            name: 'token',
            in: 'path',
            required: true,
            description: 'Token de validation issu du QR Code',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Soin validé avec succès' },
          400: { description: 'Token invalide ou expiré' },
          403: { description: 'Professionnel non autorisé' },
          404: { description: 'Acte prescrit non trouvé' },
        },
      },
    },

    // ==================== STRUCTURES ====================
    '/api/structures': {
      get: {
        tags: ['Structures'],
        summary: 'Liste des structures',
        description: 'Retourne la liste de toutes les structures médicales',
        security: [{ bearerAuth: [], userIdHeader: [] }],
        responses: {
          200: {
            description: 'Liste des structures',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Structure' },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerDefinition;