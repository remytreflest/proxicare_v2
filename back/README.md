# 🏥 Proxicare API

API REST pour la gestion des soins médicaux à domicile.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Docker](#-docker)
- [Documentation API (Swagger)](#-documentation-api-swagger)
- [Scripts disponibles](#-scripts-disponibles)
- [Variables d'environnement](#-variables-denvironnement)

## ✨ Fonctionnalités

- **Gestion des utilisateurs** : Inscription patients et professionnels de santé
- **Gestion des prescriptions** : Création et suivi des prescriptions médicales
- **Gestion des rendez-vous** : Planification des soins à domicile
- **Validation par QR Code** : Confirmation des soins réalisés
- **Gestion des actes de soins** : Catalogue des actes disponibles

## 🛠 Stack technique

- **Runtime** : Node.js 20+
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Sequelize
- **Base de données** : PostgreSQL
- **Authentification** : Auth0 (JWT)
- **Documentation** : Swagger/OpenAPI 3.0
- **Conteneurisation** : Docker & Docker Compose
- **Tests** : Jest & Supertest

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation locale

```bash
# Cloner le dépôt
git clone <repository-url>
cd nodejs-api

# Installer les dépendances
npm install

# Copier le fichier de configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Exécuter les migrations
npm run migrate

# Démarrer en mode développement
npm run dev
```

L'API sera accessible sur `http://localhost:3000`

## 🐳 Docker

### Démarrage rapide

```bash
# Copier le fichier de configuration
cp .env.example .env

# Démarrer tous les services (API + PostgreSQL)
docker-compose up -d

# Voir les logs
docker-compose logs -f api
```

### Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| API | 3000 | API Node.js |
| PostgreSQL | 5432 | Base de données |
| pgAdmin | 5050 | Interface d'administration (profil dev) |

### Mode développement avec hot-reload

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Commandes Docker utiles

```bash
# Construire l'image
npm run docker:build

# Démarrer les services
npm run docker:up

# Arrêter les services
npm run docker:down

# Voir les logs
npm run docker:logs

# Accéder au shell du conteneur
npm run docker:shell
```

## 📚 Documentation API (Swagger)

La documentation interactive de l'API est disponible via Swagger UI :

- **URL** : `http://localhost:3000/api-docs`
- **JSON OpenAPI** : `http://localhost:3000/api-docs.json`

### Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/healthcheck` | Vérification santé serveur |
| GET | `/api/user` | Récupérer l'utilisateur courant |
| POST | `/api/register/user` | Créer un utilisateur |
| POST | `/api/register/patient` | Enregistrer un patient |
| POST | `/api/register/healthcareprofessional` | Enregistrer un professionnel |
| GET | `/api/healthcare/acts` | Liste des actes de soins |
| GET | `/api/appointments` | Liste des rendez-vous |
| POST | `/api/appointment` | Créer un rendez-vous |
| POST | `/api/prescriptions` | Créer une prescription |
| GET | `/api/qrcode/patient/:id` | Générer QR Code |
| GET | `/api/structures` | Liste des structures |

## 📜 Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer avec hot-reload
npm run start:dev        # Alias pour dev

# Production
npm run build            # Compiler TypeScript
npm run start            # Démarrer la version compilée

# Base de données
npm run migrate          # Exécuter les migrations
npm run migrate:undo     # Annuler la dernière migration
npm run migrate:undo:all # Annuler toutes les migrations

# Tests
npm run test             # Exécuter les tests
npm run test:watch       # Tests en mode watch
npm run coverage         # Couverture de code

# Docker
npm run docker:build     # Construire l'image
npm run docker:up        # Démarrer les services
npm run docker:down      # Arrêter les services
npm run docker:logs      # Voir les logs
npm run docker:shell     # Shell dans le conteneur
```

## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement (development/production) | development |
| `PORT` | Port de l'API | 3000 |
| `DB_HOST` | Hôte PostgreSQL | localhost |
| `DB_PORT` | Port PostgreSQL | 5432 |
| `DB_NAME` | Nom de la base | proxicare |
| `DB_USER` | Utilisateur BDD | proxicare |
| `DB_PASSWORD` | Mot de passe BDD | - |
| `AUTH0_DOMAIN` | Domaine Auth0 | - |
| `AUTH0_AUDIENCE` | Audience Auth0 | - |
| `API_CORS` | Origines CORS autorisées | - |

## 📁 Structure du projet

```
nodejs-api/
├── src/
│   ├── config/           # Configuration (database, swagger)
│   ├── Controllers/      # Controllers Express
│   ├── middlewares/      # Middlewares (auth, extraction userId)
│   ├── migrations/       # Migrations Sequelize
│   ├── models/           # Modèles Sequelize
│   ├── resources/        # Enums et helpers
│   ├── swagger/          # Documentation Swagger (YAML)
│   ├── tests/            # Tests unitaires et d'intégration
│   ├── app.ts            # Configuration Express
│   └── index.ts          # Point d'entrée
├── scripts/              # Scripts utilitaires
├── docker-compose.yml    # Configuration Docker
├── Dockerfile            # Image de production
├── Dockerfile.dev        # Image de développement
└── package.json
```

## 🔒 Authentification

L'API utilise Auth0 pour l'authentification JWT. Chaque requête doit inclure :

- **Header `Authorization`** : `Bearer <token>`
- **Header `X-Userid`** : ID de l'utilisateur Auth0

## 📝 Licence

MIT
